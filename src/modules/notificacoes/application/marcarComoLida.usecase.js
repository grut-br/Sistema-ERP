class MarcarComoLidaUseCase {
  constructor(repository) { this.repository = repository; }
  async execute(id) {
    const notificacao = await this.repository.buscarPorId(id);
    if (!notificacao) throw new Error('Notificação não encontrada.');
    notificacao.marcarComoLida();
    return this.repository.atualizar(notificacao);
  }
}
module.exports = MarcarComoLidaUseCase;