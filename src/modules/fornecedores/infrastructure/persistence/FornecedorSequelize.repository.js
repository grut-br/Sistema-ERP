const IFornecedorRepository = require('../../../fornecedores/domain/repositories/IFornecedorRepository');
const FornecedorModel = require('./fornecedor.model');
const Fornecedor = require('../../../fornecedores/domain/entities/fornecedor.entity');

const Mapper = {
  toDomain: (model) => model ? new Fornecedor(model.toJSON()) : null,
  toPersistence: (entity) => ({
    id: entity.id,
    nome: entity.nome,
    cnpj: entity.cnpj || null,
    telefone: entity.telefone || null,
    email: entity.email || null,
  }),
};

class FornecedorSequelizeRepository extends IFornecedorRepository {
  async salvar(fornecedor) {
    const data = Mapper.toPersistence(fornecedor);
    const newModel = await FornecedorModel.create(data);
    return Mapper.toDomain(newModel);
  }

  async buscarPorId(id) {
    const model = await FornecedorModel.findByPk(id);
    return Mapper.toDomain(model);
  }

  async buscarTodos() {
    const models = await FornecedorModel.findAll({ order: [['nome', 'ASC']] });
    return models.map(Mapper.toDomain);
  }

  async atualizar(fornecedor) {
    const data = Mapper.toPersistence(fornecedor);
    await FornecedorModel.update(data, { where: { id: fornecedor.id } });
    return this.buscarPorId(fornecedor.id);
  }

  async deletar(id) {
    await FornecedorModel.destroy({ where: { id } });
  }
}
module.exports = FornecedorSequelizeRepository;