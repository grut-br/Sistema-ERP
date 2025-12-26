const NotificacaoSequelizeRepository = require('../infrastructure/persistence/NotificacaoSequelize.repository');
const ListarNotificacoesUseCase = require('../application/listarNotificacoes.usecase');
const MarcarComoLidaUseCase = require('../application/marcarComoLida.usecase');

class NotificacaoController {
  constructor() {
    const repo = new NotificacaoSequelizeRepository();
    this.listarUseCase = new ListarNotificacoesUseCase(repo);
    this.marcarComoLidaUseCase = new MarcarComoLidaUseCase(repo);

    this.getAll = this.getAll.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
  }

  async getAll(req, res) {
    try {
      const notificacoes = await this.listarUseCase.execute();
      res.status(200).json(notificacoes);
    } catch (error) { res.status(500).json({ error: error.message }); }
  }

  async markAsRead(req, res) {
    try {
      const id = Number(req.params.id);
      const notificacao = await this.marcarComoLidaUseCase.execute(id);
      res.status(200).json(notificacao);
    } catch (error) { res.status(400).json({ error: error.message }); }
  }
}
module.exports = NotificacaoController;