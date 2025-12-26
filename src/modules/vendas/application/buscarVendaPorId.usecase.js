class BuscarVendaPorIdUseCase {
  constructor(vendaRepository) {
    this.vendaRepository = vendaRepository;
  }

  async execute(id) {
    const venda = await this.vendaRepository.buscarPorId(id);
    if (!venda) {
      throw new Error('Venda não encontrada.');
    }
    return venda;
  }
}

module.exports = BuscarVendaPorIdUseCase;