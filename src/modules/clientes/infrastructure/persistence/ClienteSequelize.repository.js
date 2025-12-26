const IClienteRepository = require('../../domain/repositories/IClienteRepository');
const ClienteModel = require('./cliente.model');
const Cliente = require('../../domain/entities/cliente.entity');

const Endereco = require('../../../enderecos/domain/entities/endereco.entity');

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

    return new Cliente({
      ...data,
      dataNascimento: data.data_nascimento || data.dataNascimento, // Handling possible field naming
      limiteFiado: data.limite_fiado || data.limiteFiado,
      enderecos: enderecos
    });
  },
  toPersistence(entity) {
    return {
      id: entity.id,
      nome: entity.nome,
      email: entity.email,
      telefone: entity.telefone,

      // TRATAMENTO DE CAMPOS OPCIONAIS
      cpf: entity.cpf || null,
      data_nascimento: entity.dataNascimento || null,
      genero: entity.genero || null,

      limite_fiado: entity.limiteFiado,
    };
  },
};

class ClienteSequelizeRepository extends IClienteRepository {
  async salvar(cliente, transaction) {
    const data = ClienteMapper.toPersistence(cliente);
    // Pass transaction if provided
    const options = transaction ? { transaction } : {};
    const newModel = await ClienteModel.create(data, options);
    return ClienteMapper.toDomain(newModel);
  }

  async buscarPorId(id) {
    const model = await ClienteModel.findByPk(id);
    return ClienteMapper.toDomain(model);
  }

  async buscarTodos() {
    const models = await ClienteModel.findAll();
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