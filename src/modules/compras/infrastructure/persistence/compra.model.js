const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');
const FornecedorModel = require('../../../fornecedores/infrastructure/persistence/fornecedor.model');

const CompraModel = sequelize.define('Compra', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  idFornecedor: { type: DataTypes.INTEGER, field: 'id_fornecedor' },
  dataCompra: { type: DataTypes.DATEONLY, allowNull: false, field: 'data_compra' },
  valorTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'valor_total' },
  notaFiscal: { type: DataTypes.STRING, field: 'nota_fiscal' },
  observacoes: { type: DataTypes.TEXT },
}, {
  tableName: 'compras',
  createdAt: 'criado_em',
  updatedAt: false,
});

// Associações
CompraModel.belongsTo(FornecedorModel, { foreignKey: 'idFornecedor' });

module.exports = CompraModel;