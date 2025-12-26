const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');

const FornecedorModel = sequelize.define('Fornecedor', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  cnpj: { type: DataTypes.STRING, unique: true },
  telefone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, validate: { isEmail: true } },
  endereco: { type: DataTypes.STRING },
}, {
  tableName: 'fornecedores',
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
});

module.exports = FornecedorModel;