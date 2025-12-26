const Produto = require('../domain/entities/produto.entity');

class CriarProdutoUseCase {
  constructor(produtoRepository) {
    this.produtoRepository = produtoRepository;
  }

  async execute(dadosProduto) {
    const novoProduto = new Produto(dadosProduto);
    const produtoCriado = await this.produtoRepository.salvar(novoProduto);
    return produtoCriado;
  }
}

module.exports = CriarProdutoUseCase;