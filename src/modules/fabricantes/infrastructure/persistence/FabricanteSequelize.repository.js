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

  async atualizar(id, dados) {
    const model = await FabricanteModel.findByPk(id);
    if (!model) return null;
    await model.update(dados);
    return new Fabricante(model.toJSON());
  }

  async deletar(id) {
    const model = await FabricanteModel.findByPk(id);
    if (!model) throw new Error('Fabricante não encontrado');
    await model.destroy();
  }
}

module.exports = FabricanteSequelizeRepository;
