const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');
const ProdutoModel = require('../../../produtos/infrastructure/persistence/produto.model');
const VendaModel = require('./venda.model');

const ItemVendaModel = sequelize.define('ItemVenda', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  idVenda: { type: DataTypes.INTEGER, allowNull: false, field: 'id_venda' },
  idProduto: { type: DataTypes.INTEGER, allowNull: false, field: 'id_produto' },
  quantidade: { type: DataTypes.INTEGER, allowNull: false },
  precoUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'preco_unitario' },
}, {
  tableName: 'itens_venda',
  timestamps: false,
});

// Associações
VendaModel.hasMany(ItemVendaModel, { foreignKey: 'idVenda', as: 'itens' });
ItemVendaModel.belongsTo(VendaModel, { foreignKey: 'idVenda' });
ItemVendaModel.belongsTo(ProdutoModel, { foreignKey: 'idProduto' });

module.exports = ItemVendaModel;