const IUsuarioRepository = require('../../domain/repositories/IUsuarioRepository');
const UsuarioModel = require('./usuario.model');
const Usuario = require('../../domain/entities/usuario.entity');
const { Op } = require('sequelize');

const UsuarioMapper = {
  toDomain: (model) => model ? new Usuario(model.toJSON()) : null,
  toPersistence: (entity) => ({
    id: entity.id,
    nome: entity.nome,
    email: entity.email,
    usuario: entity.usuario,
    senha: entity.senha,
    tipo: entity.tipo,
  }),
};

class UsuarioSequelizeRepository extends IUsuarioRepository {
  async salvar(user) {
    const data = UsuarioMapper.toPersistence(user);
    // A senha em texto puro já vem no 'data', o hook do model vai criptografar
    const newModel = await UsuarioModel.create(data);
    return UsuarioMapper.toDomain(newModel);
  }

  async buscarPorId(id) {
    const model = await UsuarioModel.findByPk(id);
    return UsuarioMapper.toDomain(model);
  }

  async buscarTodos() {
    const models = await UsuarioModel.findAll();
    return models.map(UsuarioMapper.toDomain);
  }

  async buscarPorEmailOuUsuario(identificador) {
    const model = await UsuarioModel.findOne({
      where: {
        [Op.or]: [
          { email: identificador },
          { usuario: identificador }
        ]
      }
    });
    return UsuarioMapper.toDomain(model);
  }
  
  async atualizar(user) {
    const data = UsuarioMapper.toPersistence(user);
    await UsuarioModel.update(data, { where: { id: user.id } });
    return this.buscarPorId(user.id);
  }

  async deletar(id) {
    await UsuarioModel.destroy({ where: { id } });
  }

  async buscarPorTipo(tipo) {
    const model = await UsuarioModel.findOne({ where: { tipo } });
    return UsuarioMapper.toDomain(model);
  }
}
module.exports = UsuarioSequelizeRepository;