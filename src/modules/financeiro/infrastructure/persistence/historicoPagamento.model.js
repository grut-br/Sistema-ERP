const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');

const HistoricoPagamentoModel = sequelize.define('HistoricoPagamento', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  idLancamento: { type: DataTypes.INTEGER, allowNull: false, field: 'id_lancamento' },
  valor: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  formaPagamento: { 
    type: DataTypes.ENUM('DINHEIRO', 'PIX', 'CARTAO', 'TRANSFERENCIA', 'CREDITO'), 
    defaultValue: 'DINHEIRO',
    field: 'forma_pagamento'
  },
  observacao: { type: DataTypes.STRING(255) },
  dataPagamento: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW,
    field: 'data_pagamento'
  },
}, {
  tableName: 'historico_pagamentos',
  createdAt: 'criado_em',
  updatedAt: false, // Sem campo de atualização
});

module.exports = HistoricoPagamentoModel;
