const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');
const VendaModel = require('./venda.model');

const PagamentoModel = sequelize.define('Pagamento', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  idVenda: { type: DataTypes.INTEGER, allowNull: false, field: 'id_venda' },
  metodo: {
    type: DataTypes.ENUM('DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'FIADO', 'CREDITO'),
    allowNull: false,
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'pagamentos',
  createdAt: 'data_pagamento',
  updatedAt: false,
});

// Associações
VendaModel.hasMany(PagamentoModel, { foreignKey: 'idVenda', as: 'pagamentos' });
PagamentoModel.belongsTo(VendaModel, { foreignKey: 'idVenda' });

module.exports = PagamentoModel;