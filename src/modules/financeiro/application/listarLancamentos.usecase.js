class ListarLancamentosUseCase {
  constructor(lancamentoRepository) {
    this.lancamentoRepository = lancamentoRepository;
  }

  async execute(filtros = {}) {
    // Aqui você pode adicionar lógica para filtrar por data, tipo, status, etc.
    return this.lancamentoRepository.listarTodos(filtros);
  }
}

module.exports = ListarLancamentosUseCase;