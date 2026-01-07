const ILancamentoRepository = require('../../domain/repositories/ILancamentoRepository');
const LancamentoModel = require('./lancamento.model');
const CategoriaFinanceiraModel = require('./categoriaFinanceira.model');
const Lancamento = require('../../domain/entities/lancamento.entity');
const { Op } = require('sequelize');

const Mapper = {
  toDomain: (model) => {
    if (!model) return null;
    const data = model.toJSON();
    return new Lancamento({
      ...data,
      // Extrai categoria se disponível
      categoria: data.categoria || null,
      cliente: data.cliente || null,
    });
  },
  toPersistence: (entity) => ({
    id: entity.id,
    descricao: entity.descricao,
    valor: entity.valor,
    valorPago: entity.valorPago,
    tipo: entity.tipo,
    status: entity.status,
    dataVencimento: entity.dataVencimento,
    dataPagamento: entity.dataPagamento,
    idCliente: entity.idCliente,
    idVenda: entity.idVenda,
    idCompra: entity.idCompra,
    // Novos campos
    idCategoria: entity.idCategoria,
    frequencia: entity.frequencia,
    idPai: entity.idPai,
  }),
};


class LancamentoSequelizeRepository extends ILancamentoRepository {
  async salvar(lancamento, options = {}) {
    const data = Mapper.toPersistence(lancamento);
    const newModel = await LancamentoModel.create(data, options);
    return Mapper.toDomain(newModel);
  }

  async buscarPorId(id) {
    const model = await LancamentoModel.findByPk(id);
    return Mapper.toDomain(model);
  }

  async listarTodos() {
    const models = await LancamentoModel.findAll({ order: [['data_vencimento', 'ASC']] });
    return models.map(Mapper.toDomain);
  }
  
  async listarPorCliente(clienteId) {
    const models = await LancamentoModel.findAll({ 
      where: { idCliente: clienteId },
      order: [['data_vencimento', 'ASC']]
    });
    return models.map(Mapper.toDomain);
  }

  async atualizar(lancamento) {
    const data = Mapper.toPersistence(lancamento);
    await LancamentoModel.update(data, { where: { id: lancamento.id } });
    return this.buscarPorId(lancamento.id);
  }

  async deletar(id) {
    await LancamentoModel.destroy({ where: { id } });
  }

  async buscarContasPendentesPorVencimento(dias) {
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + dias); // Pega vencidas + vencendo nos próximos X dias

    const models = await LancamentoModel.findAll({
      where: {
        status: 'PENDENTE',
        dataVencimento: {
          [Op.lte]: dataLimite // lte = "Less than or equal to" (menor ou igual a)
        }
      }
    });
    return models.map(Mapper.toDomain);
  }

  async cancelarFiadoPorVendaId(vendaId, options = {}) {
    // O fiado é uma RECEITA PENDENTE vinculada à venda
    // Como o status 'ESTORNADO' não existe no ENUM, optamos por DELETAR o registro pendente
    await LancamentoModel.destroy({
      where: {
        idVenda: vendaId,
        tipo: 'RECEITA',
        status: 'PENDENTE'
      },
      ...options // Passa a transação
    });
  }
}
module.exports = LancamentoSequelizeRepository;