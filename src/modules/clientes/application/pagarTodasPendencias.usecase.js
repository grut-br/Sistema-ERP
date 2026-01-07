/**
 * Use Case: Pagar Todas as Pendências (FIFO)
 * Distribui um valor de pagamento entre todas as pendências do cliente
 * seguindo a ordem FIFO (First In, First Out)
 */
class PagarTodasPendenciasUseCase {
  constructor(lancamentoRepository, sequelize) {
    this.lancamentoRepository = lancamentoRepository;
    this.sequelize = sequelize;
  }

  async execute(clienteId, valorPagamento, metodoPagamento) {
    if (!clienteId) {
      throw new Error('ID do cliente é obrigatório');
    }

    if (!valorPagamento || valorPagamento <= 0) {
      throw new Error('Valor do pagamento deve ser maior que zero');
    }

    if (!metodoPagamento) {
      throw new Error('Método de pagamento é obrigatório');
    }

    const metodosValidos = ['DINHEIRO', 'PIX', 'CARTAO', 'TRANSFERENCIA'];
    if (!metodosValidos.includes(metodoPagamento)) {
      throw new Error('Método de pagamento inválido');
    }

    // Inicia transação
    const transaction = await this.sequelize.transaction();

    try {
      // Buscar todas as pendências do cliente ordenadas por FIFO
      // Critério: dataVencimento (vencidas primeiro) -> criadoEm (mais antigas primeiro)
      const pendencias = await this.lancamentoRepository.buscarPorClienteESaldo(
        clienteId,
        'PENDENTE',
        'RECEITA'
      );

      if (pendencias.length === 0) {
        await transaction.rollback();
        throw new Error('Cliente não possui dívidas pendentes');
      }

      // Ordenar: vencidas primeiro, depois por data de criação
      const hoje = new Date();
      pendencias.sort((a, b) => {
        const aVencido = a.dataVencimento && new Date(a.dataVencimento) < hoje;
        const bVencido = b.dataVencimento && new Date(b.dataVencimento) < hoje;

        // Vencidas primeiro
        if (aVencido && !bVencido) return -1;
        if (!aVencido && bVencido) return 1;

        // Se ambas vencidas ou ambas não vencidas, ordenar por data de criação
        return new Date(a.criadoEm) - new Date(b.criadoEm);
      });

      let valorRestante = parseFloat(valorPagamento);
      const resultado = {
        valorPago: valorPagamento,
        metodoPagamento,
        dividasQuitadas: [],
        dividasParciais: [],
        creditoGerado: 0
      };

      // Distribuir o valor entre as pendências (FIFO)
      for (const pendencia of pendencias) {
        if (valorRestante <= 0.01) break; // Tolerância de centavo

        const saldoDevido = pendencia.valor - (pendencia.valorPago || 0);
        const valorAplicado = Math.min(valorRestante, saldoDevido);

        console.log(`[PAGAR TODAS] Processando pendência #${pendencia.id}: saldo=${saldoDevido}, aplicando=${valorAplicado}`);

        // Registrar pagamento na pendência
        const foiQuitada = pendencia.registrarPagamento(valorAplicado);

        // Adicionar método de pagamento à descrição
        if (!pendencia.descricao.includes(`- Pago via ${metodoPagamento}`)) {
          if (foiQuitada) {
            pendencia.descricao = `${pendencia.descricao} - Pago via ${metodoPagamento}`;
          } else {
            pendencia.descricao = `${pendencia.descricao} - Parcial R$ ${valorAplicado.toFixed(2)} via ${metodoPagamento}`;
          }
        }

        // Atualizar no banco
        await this.lancamentoRepository.atualizar(pendencia, transaction);

        // Adicionar ao resultado
        if (foiQuitada) {
          resultado.dividasQuitadas.push({
            id: pendencia.id,
            descricao: pendencia.descricao,
            valorTotal: pendencia.valor,
            valorPago: valorAplicado
          });
        } else {
          resultado.dividasParciais.push({
            id: pendencia.id,
            descricao: pendencia.descricao,
            valorTotal: pendencia.valor,
            valorPago: valorAplicado,
            saldoRestante: pendencia.saldoRestante
          });
        }

        valorRestante -= valorAplicado;
      }

      // Se sobrou dinheiro, vira crédito
      if (valorRestante > 0.01) {
        resultado.creditoGerado = valorRestante;
        // TODO: Implementar geração de crédito automaticamente
      }

      await transaction.commit();

      return resultado;
    } catch (error) {
      console.error('[PAGAR TODAS] Erro:', error.message);
      console.error('[PAGAR TODAS] Stack:', error.stack);
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = PagarTodasPendenciasUseCase;
