const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');
const ClienteModel = require('../../../clientes/infrastructure/persistence/cliente.model');
const UsuarioModel = require('../../../usuarios/infrastructure/persistence/usuario.model'); // Assumindo que você criará este módulo

const VendaModel = sequelize.define('Venda', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  idCliente: { type: DataTypes.INTEGER, field: 'id_cliente' },
  idUsuario: { type: DataTypes.INTEGER, field: 'id_usuario' },
  totalVenda: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'total_venda' },
  descontoManual: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'desconto_manual' },
  descontoPontos: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'desconto_pontos' },
  creditoGerado: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'credito_gerado' },
  troco: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  destinoTroco: { type: DataTypes.ENUM('DINHEIRO', 'PIX', 'CAIXA', 'CREDITO'), field: 'destino_troco' },
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