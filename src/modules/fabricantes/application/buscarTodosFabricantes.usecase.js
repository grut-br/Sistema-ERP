class BuscarTodosFabricantesUseCase {
  constructor(fabricanteRepository) {
    this.fabricanteRepository = fabricanteRepository;
  }

  async execute() {
    return await this.fabricanteRepository.buscarTodos();
  }
}

module.exports = BuscarTodosFabricantesUseCase;
