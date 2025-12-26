const INotificacaoRepository = require('../../domain/repositories/INotificacaoRepository');
const NotificacaoModel = require('./notificacao.model');
const Notificacao = require('../../domain/entities/notificacao.entity');

const Mapper = {
  toDomain: (model) => model ? new Notificacao(model.toJSON()) : null,
  toPersistence: (entity) => ({
    id: entity.id,
    tipo: entity.tipo,
    mensagem: entity.mensagem,
    idReferencia: entity.idReferencia,
    referenciaTipo: entity.referenciaTipo,
    status: entity.status,
  }),
};

class NotificacaoSequelizeRepository extends INotificacaoRepository {
  async salvar(notificacao, options = {}) {
    const data = Mapper.toPersistence(notificacao);
    const newModel = await NotificacaoModel.create(data, options);
    return Mapper.toDomain(newModel);
  }

  async buscarPorId(id) {
    const model = await NotificacaoModel.findByPk(id);
    return Mapper.toDomain(model);
  }
  
  async atualizar(notificacao) {
    const data = Mapper.toPersistence(notificacao);
    await NotificacaoModel.update(data, { where: { id: notificacao.id } });
    return this.buscarPorId(notificacao.id);
  }

  async listarPendentes() {
    const models = await NotificacaoModel.findAll({
      where: { status: 'PENDENTE' },
      order: [['data_criacao', 'DESC']]
    });
    return models.map(Mapper.toDomain);
  }
}
module.exports = NotificacaoSequelizeRepository;