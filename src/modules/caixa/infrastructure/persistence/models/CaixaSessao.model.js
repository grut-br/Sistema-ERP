const { DataTypes } = require('sequelize');
const sequelize = require('../../../../../shared/infra/database');

const CaixaSessao = sequelize.define('CaixaSessao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  data_abertura: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  data_fechamento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  saldo_inicial: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  saldo_final_informado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  saldo_final_calculado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  diferenca: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ABERTO', 'FECHADO'),
    defaultValue: 'ABERTO'
  }
}, {
  tableName: 'caixas_sessao',
  timestamps: false
});

module.exports = CaixaSessao;
