class DeletarProdutoUseCase {
  constructor(produtoRepository) {
    this.produtoRepository = produtoRepository;
  }

  async execute(id) {
    // O método deletar do repositório já deve verificar se o produto existe
    return this.produtoRepository.deletar(id);
  }
}

module.exports = DeletarProdutoUseCase;