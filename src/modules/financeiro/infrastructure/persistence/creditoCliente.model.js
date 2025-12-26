const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');
const ClienteModel = require('../../../clientes/infrastructure/persistence/cliente.model');

const CreditoClienteModel = sequelize.define('CreditoCliente', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  idCliente: { type: DataTypes.INTEGER, field: 'id_cliente', allowNull: false },
  valor: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  tipo: { type: DataTypes.ENUM('ENTRADA', 'SAIDA'), allowNull: false }, // ENTRADA = Troco que ficou, SAIDA = Usou na compra
  descricao: { type: DataTypes.STRING, allowNull: false },
  idVendaOrigem: { type: DataTypes.INTEGER, field: 'id_venda_origem' }
}, {
  tableName: 'creditos_clientes',
  createdAt: 'criado_em',
  updatedAt: false,
});

CreditoClienteModel.belongsTo(ClienteModel, { foreignKey: 'idCliente' });

module.exports = CreditoClienteModel;