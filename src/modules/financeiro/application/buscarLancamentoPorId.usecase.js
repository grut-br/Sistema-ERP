class BuscarLancamentoPorIdUseCase {
  constructor(lancamentoRepository) {
    this.lancamentoRepository = lancamentoRepository;
  }

  async execute(id) {
    const lancamento = await this.lancamentoRepository.buscarPorId(id);
    if (!lancamento) {
      throw new Error('Lançamento não encontrado.');
    }
    return lancamento;
  }
}

module.exports = BuscarLancamentoPorIdUseCase;