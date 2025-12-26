const ProdutoSequelizeRepository = require('../persistence/ProdutoSequelize.repository');
const VerificarValidadeProdutosUseCase = require('../../application/verificarValidadeProdutos.usecase');

async function runVerificacaoValidade() {
  const produtoRepository = new ProdutoSequelizeRepository();
  const verificarValidade = new VerificarValidadeProdutosUseCase(produtoRepository, null);
  
  await verificarValidade.execute({ diasParaVencer: 50 });
}

module.exports = { runVerificacaoValidade };