class BuscarProdutoPorIdUseCase {
  constructor(produtoRepository) {
    this.produtoRepository = produtoRepository;
  }

  async execute(id) {
    return this.produtoRepository.buscarPorId(id);
  }
}

module.exports = BuscarProdutoPorIdUseCase;