const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');

const CategoriaFinanceiraModel = sequelize.define('CategoriaFinanceira', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  tipo: { type: DataTypes.ENUM('RECEITA', 'DESPESA'), allowNull: false },
  cor: { type: DataTypes.STRING(7), defaultValue: '#6B7280' },
}, {
  tableName: 'categorias_financeiras',
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
});

module.exports = CategoriaFinanceiraModel;
