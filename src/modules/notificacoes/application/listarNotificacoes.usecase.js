class ListarNotificacoesUseCase {
  constructor(repository) { this.repository = repository; }
  async execute() {
    return this.repository.listarPendentes();
  }
}
module.exports = ListarNotificacoesUseCase;