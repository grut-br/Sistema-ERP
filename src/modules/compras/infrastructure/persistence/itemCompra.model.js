const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');
const CompraModel = require('./compra.model.js');
const ProdutoModel = require('../../../produtos/infrastructure/persistence/produto.model');

const ItemCompraModel = sequelize.define('ItemCompra', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  idCompra: { type: DataTypes.INTEGER, allowNull: false, field: 'id_compra' },
  idProduto: { type: DataTypes.INTEGER, allowNull: false, field: 'id_produto' },
  quantidade: { type: DataTypes.INTEGER, allowNull: false },
  custoUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'custo_unitario' },
}, {
  tableName: 'itens_compra',
  timestamps: false,
});

// Associações
CompraModel.hasMany(ItemCompraModel, { foreignKey: 'idCompra', as: 'itens' });
ItemCompraModel.belongsTo(CompraModel, { foreignKey: 'idCompra' });
ItemCompraModel.belongsTo(ProdutoModel, { foreignKey: 'idProduto' });

module.exports = ItemCompraModel;