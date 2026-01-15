const { DataTypes } = require('sequelize');
const sequelize = require('../../../../../shared/infra/database');
const CaixaSessao = require('./CaixaSessao.model');

const CaixaMovimentacao = sequelize.define('CaixaMovimentacao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_sessao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CaixaSessao,
      key: 'id'
    }
  },
  id_venda: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tipo: {
    type: DataTypes.ENUM('ENTRADA', 'SAIDA', 'SANGRIA', 'SUPRIMENTO'),
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  forma_pagamento: {
    type: DataTypes.ENUM('DINHEIRO', 'PIX', 'CARTAO', 'OUTRO'),
    defaultValue: 'DINHEIRO'
  },
  descricao: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'caixas_movimentacoes',
  timestamps: false
});

// Relationships
CaixaSessao.hasMany(CaixaMovimentacao, { foreignKey: 'id_sessao', as: 'movimentacoes' });
CaixaMovimentacao.belongsTo(CaixaSessao, { foreignKey: 'id_sessao', as: 'sessao' });

module.exports = CaixaMovimentacao;
