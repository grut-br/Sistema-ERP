class ListarLancamentosPorClienteUseCase {
  constructor(lancamentoRepository) {
    this.lancamentoRepository = lancamentoRepository;
  }

  async execute(clienteId) {
    // No futuro, poderíamos adicionar uma verificação se o cliente existe
    return this.lancamentoRepository.listarPorCliente(clienteId);
  }
}

module.exports = ListarLancamentosPorClienteUseCase;