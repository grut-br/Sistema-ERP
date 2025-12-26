class IProdutoRepository {
  salvar(produto) {
    throw new Error('Método "salvar" não implementado.');
  }

  buscarPorId(id) {
    throw new Error('Método "buscarPorId" não implementado.');
  }

  buscarTodos() {
    throw new Error('Método "buscarTodos" não implementado.');
  }

  buscarLotesDisponiveisPorProduto(idProduto, options = {}) { 
    throw new Error('Método não implementado.'); 
  }

  buscarLotesProximosDoVencimento(dias, options = {}) {
    throw new Error('Método não implementado.');
  }
  
  atualizar(produto) {
    throw new Error('Método "atualizar" não implementado.');
  }

  deletar(id) {
    throw new Error('Método "deletar" não implementado.');
  }
}

module.exports = IProdutoRepository;