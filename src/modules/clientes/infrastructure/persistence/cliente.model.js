const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');

const ClienteModel = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true,
  },
  dataNascimento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'data_nascimento'
  },
  genero: {
    type: DataTypes.ENUM('MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMAR'),
    allowNull: true
  },
  telefone: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  limiteFiado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'limite_fiado'
  },
}, {
  tableName: 'clientes',
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
});

module.exports = ClienteModel;

// Import EnderecoModel after definition to avoid circular dependency issues during define if possible, 
// though require cache usually handles it.
// However, since we need to define association:

const EnderecoModel = require('../../../enderecos/infrastructure/persistence/endereco.model');

ClienteModel.hasMany(EnderecoModel, { foreignKey: 'id_cliente', as: 'enderecos' });
EnderecoModel.belongsTo(ClienteModel, { foreignKey: 'id_cliente', as: 'cliente' });
