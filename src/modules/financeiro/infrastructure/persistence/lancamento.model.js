const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');
const ClienteModel = require('../../../clientes/infrastructure/persistence/cliente.model');
const VendaModel = require('../../../vendas/infrastructure/persistence/venda.model');
const CategoriaFinanceiraModel = require('./categoriaFinanceira.model');

const LancamentoModel = sequelize.define('Lancamento', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  descricao: { type: DataTypes.STRING, allowNull: false },
  valor: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  valorPago: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'valor_pago' },
  tipo: { type: DataTypes.ENUM('RECEITA', 'DESPESA'), allowNull: false },
  status: { type: DataTypes.ENUM('PENDENTE', 'PAGO'), allowNull: false, defaultValue: 'PENDENTE' },
  dataVencimento: { type: DataTypes.DATEONLY, field: 'data_vencimento' },
  dataPagamento: { type: DataTypes.DATEONLY, field: 'data_pagamento' },
  idCliente: { type: DataTypes.INTEGER, field: 'id_cliente' },
  idVenda: { type: DataTypes.INTEGER, field: 'id_venda' },
  idCompra: { type: DataTypes.INTEGER, field: 'id_compra' },
  // Novos campos para categorização e recorrência
  idCategoria: { type: DataTypes.INTEGER, field: 'id_categoria' },
  frequencia: { 
    type: DataTypes.ENUM('NENHUMA', 'SEMANAL', 'MENSAL', 'ANUAL'), 
    defaultValue: 'NENHUMA' 
  },
  idPai: { type: DataTypes.INTEGER, field: 'id_pai' },
}, {
  tableName: 'lancamentos',
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
});

// Associações
LancamentoModel.belongsTo(ClienteModel, { foreignKey: 'idCliente', as: 'cliente' });
LancamentoModel.belongsTo(VendaModel, { foreignKey: 'idVenda' });
LancamentoModel.belongsTo(CategoriaFinanceiraModel, { foreignKey: 'idCategoria', as: 'categoria' });
LancamentoModel.belongsTo(LancamentoModel, { foreignKey: 'idPai', as: 'lancamentoPai' });
// Associação com Compra (não precisa importar CompraModel aqui para evitar ciclo de dependências)

module.exports = LancamentoModel;

