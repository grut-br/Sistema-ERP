/**
 * Use Case: Baixar Lançamento (Registrar Recebimento)
 * Marca um lançamento como pago e registra o método de pagamento
 */
class BaixarLancamentoUseCase {
  constructor(lancamentoRepository) {
    this.lancamentoRepository = lancamentoRepository;
  }

  async execute(lancamentoId, metodoPagamento, valorAPagar = null) {
    console.log('[USE CASE] Parâmetros recebidos:', { lancamentoId, metodoPagamento, valorAPagar, tipo: typeof valorAPagar });
    
    if (!lancamentoId) {
      throw new Error('ID do lançamento é obrigatório');
    }

    if (!metodoPagamento) {
      throw new Error('Método de pagamento é obrigatório');
    }

    // Valida método de pagamento
    const metodosValidos = ['Dinheiro', 'PIX', 'Cartão'];
    if (!metodosValidos.includes(metodoPagamento)) {
      throw new Error('Método de pagamento inválido');
    }

    // Busca o lançamento
    const lancamento = await this.lancamentoRepository.buscarPorId(lancamentoId);
    
    if (!lancamento) {
      throw new Error('Lançamento não encontrado');
    }

    if (lancamento.status === 'PAGO') {
      throw new Error('Este lançamento já foi pago');
    }

    // Usa o método da entidade para registrar pagamento (parcial ou total)
    console.log('[USE CASE] Antes de chamar registrarPagamento:', { valorAPagar, saldoRestante: lancamento.saldoRestante });
    const isQuitado = lancamento.registrarPagamento(valorAPagar);
    console.log('[USE CASE] Depois de registrarPagamento:', { isQuitado, valorPago: lancamento.valorPago, status: lancamento.status });
    
    // Adiciona método de pagamento à descrição (apenas uma vez)
    if (!lancamento.descricao.includes(`- Pago via ${metodoPagamento}`)) {
      if (isQuitado) {
        lancamento.descricao = `${lancamento.descricao} - Pago via ${metodoPagamento}`;
      } else {
        const valorPago = valorAPagar || lancamento.saldoRestante;
        lancamento.descricao = `${lancamento.descricao} - Parcial R$ ${valorPago.toFixed(2)} via ${metodoPagamento}`;
      }
    }

    // Salva as alterações
    const lancamentoAtualizado = await this.lancamentoRepository.atualizar(lancamento);

    return lancamentoAtualizado;
  }
}

module.exports = BaixarLancamentoUseCase;
