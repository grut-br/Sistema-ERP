const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');
const ClienteModel = require('../../../clientes/infrastructure/persistence/cliente.model');

const FidelizacaoModel = sequelize.define('Fidelizacao', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  idCliente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'id_cliente'
  },
  pontosSaldo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'pontos_saldo'
  }
}, {
  tableName: 'fidelizacao',
  createdAt: false,
  updatedAt: 'ultima_atualizacao',
});

// Associação: Um perfil de fidelidade pertence a um cliente
FidelizacaoModel.belongsTo(ClienteModel, { foreignKey: 'idCliente' });
ClienteModel.hasOne(FidelizacaoModel, { foreignKey: 'idCliente' });

module.exports = FidelizacaoModel;