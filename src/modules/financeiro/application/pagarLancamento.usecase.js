/**
 * PagarLancamentoUseCase
 * Responsável por registrar pagamentos (parciais ou totais) de lançamentos.
 * Se o lançamento for quitado e for recorrente, cria o próximo automaticamente.
 */
class PagarLancamentoUseCase {
  constructor(lancamentoRepository, historicoPagamentoRepository = null) { 
    this.lancamentoRepository = lancamentoRepository;
    this.historicoPagamentoRepository = historicoPagamentoRepository;
  }
  
  /**
   * Executa o pagamento
   * @param {number} id - ID do lançamento
   * @param {Object} dados - Dados do pagamento
   * @param {number} dados.valorPago - Valor a pagar (opcional, default = saldo restante)
   * @param {string} dados.formaPagamento - Forma de pagamento (DINHEIRO, PIX, CARTAO, etc)
   * @param {string} dados.observacao - Observação do pagamento
   */
  async execute(id, dados = {}) {
    const lancamento = await this.lancamentoRepository.buscarPorId(id);
    if (!lancamento) throw new Error('Lançamento não encontrado.');
    
    const { valorPago, formaPagamento, observacao } = dados;

    // Registra o pagamento usando a lógica da entidade
    const foiQuitado = lancamento.registrarPagamento(valorPago);
    
    // Salva histórico de pagamento se o repositório estiver disponível
    if (this.historicoPagamentoRepository) {
      const valorRegistrado = valorPago || lancamento.saldoRestante;
      await this.historicoPagamentoRepository.salvar({
        idLancamento: id,
        valor: valorPago || (lancamento.valor - (lancamento.valorPago - (valorPago || 0))),
        formaPagamento: formaPagamento || 'DINHEIRO',
        observacao: observacao,
        dataPagamento: new Date()
      });
    }

    // Atualiza o lançamento no banco
    await this.lancamentoRepository.atualizar(lancamento);

    // =============================================
    // LÓGICA DE RECORRÊNCIA INTELIGENTE
    // =============================================
    // Se o lançamento FOI QUITADO e é recorrente, cria o próximo automaticamente
    if (foiQuitado && lancamento.frequencia && lancamento.frequencia !== 'NENHUMA') {
      try {
        const proximoLancamento = lancamento.clonarParaProximoPeriodo();
        await this.lancamentoRepository.salvar(proximoLancamento);
        console.log(`[RECORRÊNCIA] Próximo lançamento criado: ${proximoLancamento.descricao} - Vencimento: ${proximoLancamento.dataVencimento}`);
        
        return {
          lancamento,
          proximoLancamento,
          mensagem: 'Lançamento quitado e próximo criado automaticamente.'
        };
      } catch (error) {
        console.error('[RECORRÊNCIA] Erro ao criar próximo lançamento:', error.message);
        // Não lança erro para não impedir o pagamento original
      }
    }

    return {
      lancamento,
      proximoLancamento: null,
      mensagem: foiQuitado ? 'Lançamento quitado com sucesso.' : 'Pagamento parcial registrado.'
    };
  }
}

module.exports = PagarLancamentoUseCase;

