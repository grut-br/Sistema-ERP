const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');

const NotificacaoModel = sequelize.define('Notificacao', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tipo: {
    type: DataTypes.ENUM('PRODUTO_VENCENDO', 'ESTOQUE_BAIXO', 'COBRANCA_FIADO', 'CONTA_A_PAGAR_VENCENDO'),
    allowNull: false
  },
  mensagem: { type: DataTypes.TEXT, allowNull: false },
  idReferencia: { type: DataTypes.INTEGER, field: 'id_referencia' },
  referenciaTipo: { type: DataTypes.STRING, field: 'referencia_tipo' },
  status: {
    type: DataTypes.ENUM('PENDENTE', 'LIDA', 'ARQUIVADA'),
    allowNull: false,
    defaultValue: 'PENDENTE'
  }
}, {
  tableName: 'notificacoes',
  createdAt: 'data_criacao',
  updatedAt: false, // Não precisamos de 'atualizado_em'
});

module.exports = NotificacaoModel;