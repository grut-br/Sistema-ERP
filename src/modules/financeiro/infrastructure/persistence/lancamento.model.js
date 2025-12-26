const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');
const ClienteModel = require('../../../clientes/infrastructure/persistence/cliente.model');
const VendaModel = require('../../../vendas/infrastructure/persistence/venda.model');

const LancamentoModel = sequelize.define('Lancamento', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  descricao: { type: DataTypes.STRING, allowNull: false },
  valor: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  tipo: { type: DataTypes.ENUM('RECEITA', 'DESPESA'), allowNull: false },
  status: { type: DataTypes.ENUM('PENDENTE', 'PAGO'), allowNull: false, defaultValue: 'PENDENTE' },
  dataVencimento: { type: DataTypes.DATEONLY, field: 'data_vencimento' },
  dataPagamento: { type: DataTypes.DATEONLY, field: 'data_pagamento' },
  idCliente: { type: DataTypes.INTEGER, field: 'id_cliente' },
  idVenda: { type: DataTypes.INTEGER, field: 'id_venda' },
}, {
  tableName: 'lancamentos',
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
});

// Associações
LancamentoModel.belongsTo(ClienteModel, { foreignKey: 'idCliente' });
LancamentoModel.belongsTo(VendaModel, { foreignKey: 'idVenda' });

module.exports = LancamentoModel;