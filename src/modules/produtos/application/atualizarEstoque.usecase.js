class AtualizarEstoqueUseCase {
  constructor(produtoRepository) {
    this.produtoRepository = produtoRepository;
  }

  async execute({ produtoId, quantidade }) {
    // 1. Busca o produto no banco
    const produto = await this.produtoRepository.buscarPorId(produtoId);
    if (!produto) {
      throw new Error('Produto não encontrado.');
    }

    // 2. Usa o método da entidade para ajustar o estoque
    produto.ajustarEstoque(quantidade);

    // 3. Salva o produto atualizado no banco
    return this.produtoRepository.atualizar(produto);
  }
}

module.exports = AtualizarEstoqueUseCase;