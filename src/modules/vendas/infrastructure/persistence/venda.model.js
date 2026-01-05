const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');
const ClienteModel = require('../../../clientes/infrastructure/persistence/cliente.model');
const UsuarioModel = require('../../../usuarios/infrastructure/persistence/usuario.model'); // Assumindo que você criará este módulo

const VendaModel = sequelize.define('Venda', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  idCliente: { type: DataTypes.INTEGER, field: 'id_cliente' },
  idUsuario: { type: DataTypes.INTEGER, field: 'id_usuario' },
  totalVenda: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'total_venda' },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'CONCLUIDA',
  },
}, {
  tableName: 'vendas',
  createdAt: 'data_venda',
  updatedAt: false, // Não temos 'atualizado_em' nesta tabela
});

// Associações
VendaModel.belongsTo(ClienteModel, { foreignKey: 'idCliente', as: 'cliente' });
// VendaModel.belongsTo(UsuarioModel, { foreignKey: 'idUsuario' }); // Futuro

module.exports = VendaModel;