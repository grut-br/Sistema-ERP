const ICategoriaRepository = require('../../domain/repositories/ICategoriaRepository');

const CategoriaModel = require('./categoria.model');
const Categoria = require('../../domain/entities/categoria.entity');

const CategoriaMapper = {
  toDomain: (model) => model ? new Categoria(model) : null,
  toPersistence: (entity) => ({ id: entity.id, nome: entity.nome }),
};

class CategoriaSequelizeRepository extends ICategoriaRepository {
  async salvar(categoria) {
    const data = CategoriaMapper.toPersistence(categoria);
    const newModel = await CategoriaModel.create(data);
    return CategoriaMapper.toDomain(newModel);
  }

  async buscarPorId(id) {
    const model = await CategoriaModel.findByPk(id);
    return CategoriaMapper.toDomain(model);
  }

  async buscarTodas() {
    const models = await CategoriaModel.findAll();
    return models.map(CategoriaMapper.toDomain);
  }

  async atualizar(categoria) {
    const data = CategoriaMapper.toPersistence(categoria);
    await CategoriaModel.update(data, { where: { id: categoria.id } });
    const updatedModel = await this.buscarPorId(categoria.id);
    return CategoriaMapper.toDomain(updatedModel);
  }

  async deletar(id) {
    await CategoriaModel.destroy({ where: { id } });
  }
}

// Crie e exporte a interface também, para consistência
// Arquivo: src/modules/categorias/domain/repositories/ICategoriaRepository.js
//class ICategoriaRepository {}

module.exports = CategoriaSequelizeRepository;