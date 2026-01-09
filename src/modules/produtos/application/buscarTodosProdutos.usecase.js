class BuscarTodosProdutosUseCase {
  constructor(produtoRepository) {
    this.produtoRepository = produtoRepository;
  }

  async execute(filters = {}) {
    return this.produtoRepository.listarTodos(filters);
  }
}

module.exports = BuscarTodosProdutosUseCase;