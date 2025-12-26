class DeletarLancamentoUseCase {
  constructor(lancamentoRepository) {
    this.lancamentoRepository = lancamentoRepository;
  }

  async execute(id) {
    const lancamento = await this.lancamentoRepository.buscarPorId(id);
    if (!lancamento) {
      throw new Error('Lançamento não encontrado.');
    }
    return this.lancamentoRepository.deletar(id);
  }
}

module.exports = DeletarLancamentoUseCase;