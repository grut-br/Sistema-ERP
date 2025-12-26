class BuscarTodosFornecedoresUseCase {
  constructor(repository) { this.repository = repository; }
  async execute() { return this.repository.buscarTodos(); }
}
module.exports = BuscarTodosFornecedoresUseCase;