class BuscarCompraPorIdUseCase {
  constructor(compraRepository) {
    this.compraRepository = compraRepository;
  }

  async execute(id) {
    const compra = await this.compraRepository.buscarPorId(id);
    if (!compra) {
      throw new Error('Compra não encontrada.');
    }
    return compra;
  }
}

module.exports = BuscarCompraPorIdUseCase;