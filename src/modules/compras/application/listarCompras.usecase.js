class ListarComprasUseCase {
  constructor(compraRepository) {
    this.compraRepository = compraRepository;
  }

  async execute() {
    return this.compraRepository.listarTodas();
  }
}

module.exports = ListarComprasUseCase;