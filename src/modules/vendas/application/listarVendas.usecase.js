class ListarVendasUseCase {
  constructor(vendaRepository) {
    this.vendaRepository = vendaRepository;
  }

  async execute(filtros) {
    return this.vendaRepository.listarTodas(filtros);
  }
}

module.exports = ListarVendasUseCase;