class ListarComprasUseCase {
  constructor(compraRepository) {
    this.compraRepository = compraRepository;
  }

  async execute(filters) {
    return this.compraRepository.listarTodas(filters);
  }
}

module.exports = ListarComprasUseCase;