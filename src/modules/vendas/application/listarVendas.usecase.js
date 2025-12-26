class ListarVendasUseCase {
  constructor(vendaRepository) {
    this.vendaRepository = vendaRepository;
  }

  async execute() {
    return this.vendaRepository.listarTodas();
  }
}

module.exports = ListarVendasUseCase;