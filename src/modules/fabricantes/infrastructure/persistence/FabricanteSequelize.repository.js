const IFabricanteRepository = require('../../domain/repositories/IFabricanteRepository');
const FabricanteModel = require('./fabricante.model');
const Fabricante = require('../../domain/entities/fabricante.entity');

class FabricanteSequelizeRepository extends IFabricanteRepository {
  async salvar(fabricante) {
    const model = await FabricanteModel.create({ nome: fabricante.nome });
    return new Fabricante(model.toJSON());
  }

  async buscarTodos() {
    const models = await FabricanteModel.findAll({ order: [['nome', 'ASC']] });
    return models.map(m => new Fabricante(m.toJSON()));
  }

  async buscarPorId(id) {
    const model = await FabricanteModel.findByPk(id);
    return model ? new Fabricante(model.toJSON()) : null;
  }
}

module.exports = FabricanteSequelizeRepository;
