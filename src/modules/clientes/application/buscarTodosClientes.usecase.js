class BuscarTodosClientesUseCase {
  constructor(clienteRepository) {
    this.clienteRepository = clienteRepository;
  }

  async execute() {
    return this.clienteRepository.buscarTodos();
  }
}

module.exports = BuscarTodosClientesUseCase;