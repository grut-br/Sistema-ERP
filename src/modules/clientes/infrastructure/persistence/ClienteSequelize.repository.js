const IClienteRepository = require('../../domain/repositories/IClienteRepository');
const ClienteModel = require('./cliente.model');
const Cliente = require('../../domain/entities/cliente.entity');

const Endereco = require('../../../enderecos/domain/entities/endereco.entity');

const FidelizacaoModel = require('../../../fidelizacao/infrastructure/persistence/fidelizacao.model');

const ClienteMapper = {
  toDomain: (model) => {
    if (!model) return null;
    const data = model.toJSON ? model.toJSON() : model;

    let enderecos = [];
    if (data.enderecos && Array.isArray(data.enderecos)) {
      enderecos = data.enderecos.map(e => new Endereco({
        id: e.id,
        logradouro: e.logradouro,
        numero: e.numero,
        complemento: e.complemento,
        bairro: e.bairro,
        cidade: e.cidade,
        estado: e.estado,
        cep: e.cep,
        titulo: e.titulo,
        idCliente: e.id_cliente
      }));
    }

    // Map Fidelizacao points
    const pontos = data.Fidelizacao ? data.Fidelizacao.pontosSaldo : 0;

    return new Cliente({
      ...data,
      dataNascimento: data.data_nascimento || data.dataNascimento,
      limiteFiado: data.limite_fiado || data.limiteFiado,
      enderecos: enderecos,
      pontos: pontos // Add points to domain entity (dynamic field)
    });
  },
  // ... toPersistence (remains same) ...
};

class ClienteSequelizeRepository extends IClienteRepository {
  // ... salvar ...

  async buscarPorId(id) {
    const model = await ClienteModel.findByPk(id, {
        include: [
            { model: FidelizacaoModel } 
        ]
    });
    return ClienteMapper.toDomain(model);
  }

  async buscarTodos() {
    const models = await ClienteModel.findAll({
        include: [
            { model: FidelizacaoModel }
        ]
    });
    return models.map(ClienteMapper.toDomain);
  }

  async atualizar(cliente) {
    const data = ClienteMapper.toPersistence(cliente);
    await ClienteModel.update(data, { where: { id: cliente.id } });
    const updatedModel = await this.buscarPorId(cliente.id);
    return ClienteMapper.toDomain(updatedModel);
  }

  async deletar(id) {
    await ClienteModel.destroy({ where: { id } });
  }
}
module.exports = ClienteSequelizeRepository;