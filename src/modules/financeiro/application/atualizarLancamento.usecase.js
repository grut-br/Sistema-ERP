class AtualizarLancamentoUseCase {
  constructor(lancamentoRepository) {
    this.lancamentoRepository = lancamentoRepository;
  }

  async execute(id, dadosParaAtualizar) {
    const lancamento = await this.lancamentoRepository.buscarPorId(id);
    if (!lancamento) {
      throw new Error('Lançamento não encontrado.');
    }

    Object.assign(lancamento, dadosParaAtualizar);
    lancamento.validar(); // Revalida a entidade com os novos dados

    return this.lancamentoRepository.atualizar(lancamento);
  }
}

module.exports = AtualizarLancamentoUseCase;