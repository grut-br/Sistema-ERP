const CategoriaFinanceiraModel = require('./categoriaFinanceira.model');
const CategoriaFinanceira = require('../../domain/entities/categoriaFinanceira.entity');

const Mapper = {
  toDomain: (model) => model ? new CategoriaFinanceira(model.toJSON()) : null,
  toPersistence: (entity) => ({
    id: entity.id,
    nome: entity.nome,
    tipo: entity.tipo,
    cor: entity.cor,
  }),
};

class CategoriaFinanceiraSequelizeRepository {
  async salvar(categoria) {
    const data = Mapper.toPersistence(categoria);
    const newModel = await CategoriaFinanceiraModel.create(data);
    return Mapper.toDomain(newModel);
  }

  async buscarPorId(id) {
    const model = await CategoriaFinanceiraModel.findByPk(id);
    return Mapper.toDomain(model);
  }

  async buscarPorNome(nome) {
    const model = await CategoriaFinanceiraModel.findOne({ where: { nome } });
    return Mapper.toDomain(model);
  }

  async listarTodas(filtros = {}) {
    const where = {};
    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }
    const models = await CategoriaFinanceiraModel.findAll({ 
      where,
      order: [['nome', 'ASC']] 
    });
    return models.map(Mapper.toDomain);
  }

  async atualizar(categoria) {
    const data = Mapper.toPersistence(categoria);
    await CategoriaFinanceiraModel.update(data, { where: { id: categoria.id } });
    return this.buscarPorId(categoria.id);
  }

  async deletar(id) {
    await CategoriaFinanceiraModel.destroy({ where: { id } });
  }
}

module.exports = CategoriaFinanceiraSequelizeRepository;
