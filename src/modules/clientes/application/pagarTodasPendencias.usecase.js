/**
 * Use Case: Pagar Todas as Pendências (FIFO)
 * Distribui um valor de pagamento entre todas as pendências do cliente
 * seguindo a ordem FIFO (First In, First Out).
 * 
 * Regras:
 * 1. Busca pendências (Lancamentos PENDENTE/RECEITA)
 * 2. Ordena por Vencimento ASC
 * 3. Abate do valor total (FIFO)
 * 4. Cria registro em HistoricoPagamento para cada abatimento
 * 5. Atualiza Lancamento (Status, ValorPago, Descrição)
 */
const HistoricoPagamentoModel = require('../../financeiro/infrastructure/persistence/historicoPagamento.model');

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

    const metodosValidos = ['DINHEIRO', 'PIX', 'CARTAO', 'TRANSFERENCIA', 'CREDITO'];
    if (!metodosValidos.includes(metodoPagamento)) {
      throw new Error('Método de pagamento inválido');
    }

    // Inicia transação
    const transaction = await this.sequelize.transaction();

    try {
      // Buscar todas as pendências do cliente (Lançamentos PENDENTE e RECEITA)
      const pendencias = await this.lancamentoRepository.buscarPorClienteESaldo(
        clienteId,
        'PENDENTE',
        'RECEITA'
      );

      // Se não tem dívidas, mas está pagando, pode ser geração de crédito antecipado?
      // Por enquanto, seguimos a regra de abater dívidas. 
      if (pendencias.length === 0) {
        // Opção: Poderíamos apenas gerar crédito. Mas vamos lançar erro/aviso por enquanto ou retornar sucesso com crédito total.
        // O requisito diz "Busque todos os lançamentos... Itere sobre as dívidas".
        // Vamos retornar que não há dívidas, mas talvez o usuário queira adicionar crédito.
        // Dado o fluxo, vamos permitir e gerar crédito total.
        // throw new Error('Cliente não possui dívidas pendentes');
      }

      // Ordenar: FIFO (Vencimento ASC)
      const pendenciasOrdenadas = pendencias.sort((a, b) => {
        // nulls last or first? Assuming older dates first.
        if (!a.dataVencimento) return 1;
        if (!b.dataVencimento) return -1;
        return new Date(a.dataVencimento) - new Date(b.dataVencimento);
      });

      let valorRestante = parseFloat(valorPagamento);
      const resultado = {
        valorPago: valorPagamento,
        metodoPagamento,
        dividasQuitadas: [],
        dividasParciais: [],
        creditoGerado: 0
      };

      const hoje = new Date();

      // Distribuir o valor entre as pendências (FIFO)
      for (const pendencia of pendenciasOrdenadas) {
        if (valorRestante <= 0.01) break; // Tolerância

        const saldoDevido = pendencia.valor - (pendencia.valorPago || 0);
        const valorAplicado = Math.min(valorRestante, saldoDevido);

        console.log(`[PAGAR TODAS] Processando pendência #${pendencia.id}: saldo=${saldoDevido}, aplicando=${valorAplicado}`);

        // 1. Atualizar o Lançamento (Entidade)
        const foiQuitada = pendencia.registrarPagamento(valorAplicado);



        // 2. Persistir atualização do Lançamento
        await this.lancamentoRepository.atualizar(pendencia, transaction);

        // 3. Criar registro na tabela pagamentos (HistoricoPagamento)
        await HistoricoPagamentoModel.create({
          idLancamento: pendencia.id,
          valor: valorAplicado,
          formaPagamento: metodoPagamento,
          observacao: `Pagamento ${foiQuitada ? 'Total' : 'Parcial'} via ${metodoPagamento}`,
          dataPagamento: new Date()
        }, { transaction });

        // Adicionar ao resultado
        const infoDivida = {
          id: pendencia.id,
          descricao: pendencia.descricao,
          valorTotal: pendencia.valor,
          valorPago: valorAplicado,
          saldoRestante: pendencia.saldoRestante // Getter da entidade
        };

        if (foiQuitada) {
          resultado.dividasQuitadas.push(infoDivida);
        } else {
          resultado.dividasParciais.push(infoDivida);
        }

        valorRestante -= valorAplicado;
      }

      // Se sobrou dinheiro, vira crédito
      if (valorRestante > 0.01) {
        resultado.creditoGerado = valorRestante;
        // TODO: Implementar lógica de crédito na tabela de clientes ou conta corrente
        // Por enquanto apenas retornamos essa informação
      }

      await transaction.commit();

      return resultado;
    } catch (error) {
      console.error('[PAGAR TODAS] Erro:', error.message);
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = PagarTodasPendenciasUseCase;
