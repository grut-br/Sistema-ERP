const Notificacao = require('../domain/entities/notificacao.entity');

class CriarNotificacaoUseCase {
  constructor(repository) { this.repository = repository; }

  async execute(dados, options = {}) {
    const notificacao = new Notificacao(dados);
    return this.repository.salvar(notificacao, options);
  }
}

module.exports = CriarNotificacaoUseCase;