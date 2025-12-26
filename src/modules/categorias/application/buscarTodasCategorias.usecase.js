class BuscarTodasCategoriasUseCase {
  constructor(repository) { this.repository = repository; }
  async execute() { return this.repository.buscarTodas(); }
}
module.exports = BuscarTodasCategoriasUseCase;