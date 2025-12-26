class AtualizarProdutoUseCase {
  constructor(produtoRepository) {
    this.produtoRepository = produtoRepository;
  }

  async execute(produtoId, dadosParaAtualizar) {
    // 1. Busca o produto para garantir que ele existe
    const produtoExistente = await this.produtoRepository.buscarPorId(produtoId);
    if (!produtoExistente) {
      throw new Error('Produto não encontrado.');
    }

    // 2. Atualiza as propriedades do objeto existente com os novos dados
    Object.assign(produtoExistente, dadosParaAtualizar);
    
    // 3. Valida a entidade com os novos dados
    produtoExistente.validar();

    // 4. Persiste as alterações no banco
    return this.produtoRepository.atualizar(produtoExistente);
  }
}

module.exports = AtualizarProdutoUseCase;