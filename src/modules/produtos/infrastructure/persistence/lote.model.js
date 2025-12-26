const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');
const ProdutoModel = require('./produto.model');
const CompraModel = require('../../../compras/infrastructure/persistence/compra.model');

const LoteModel = sequelize.define('Lote', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  idProduto: { type: DataTypes.INTEGER, allowNull: false, field: 'id_produto' },
  idCompra: { type: DataTypes.INTEGER, field: 'id_compra' },
  quantidade: { type: DataTypes.INTEGER, allowNull: false },
  validade: { type: DataTypes.DATEONLY, allowNull: false },
  custoUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'custo_unitario' },
}, {
  tableName: 'lotes',
  timestamps: false,
});

LoteModel.belongsTo(ProdutoModel, { foreignKey: 'idProduto' });
ProdutoModel.hasMany(LoteModel, { foreignKey: 'idProduto', as: 'lotes' });

LoteModel.belongsTo(CompraModel, { foreignKey: 'idCompra' });

module.exports = LoteModel;