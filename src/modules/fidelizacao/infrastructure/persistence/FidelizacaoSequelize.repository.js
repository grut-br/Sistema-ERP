const IFidelizacaoRepository = require('../../domain/repositories/IFidelizacaoRepository');
const FidelizacaoModel = require('./fidelizacao.model');
const Fidelizacao = require('../../domain/entities/fidelizacao.entity');

const Mapper = {
  toDomain: (model) => model ? new Fidelizacao(model.toJSON()) : null,
  toPersistence: (entity) => ({
    id: entity.id,
    idCliente: entity.idCliente,
    pontosSaldo: entity.pontosSaldo,
  }),
};

class FidelizacaoSequelizeRepository extends IFidelizacaoRepository {
  async salvar(fidelizacao) {
    const data = Mapper.toPersistence(fidelizacao);
    const newModel = await FidelizacaoModel.create(data);
    return Mapper.toDomain(newModel);
  }

  async atualizar(fidelizacao) {
    const data = Mapper.toPersistence(fidelizacao);
    await FidelizacaoModel.update(data, { where: { id: fidelizacao.id } });
    return fidelizacao;
  }

  async buscarPorClienteId(clienteId) {
    const model = await FidelizacaoModel.findOne({ where: { idCliente: clienteId } });
    return Mapper.toDomain(model);
  }
}
module.exports = FidelizacaoSequelizeRepository;