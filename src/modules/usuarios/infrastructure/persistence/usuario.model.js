const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');
const bcrypt = require('bcryptjs');

const UsuarioModel = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  usuario: { type: DataTypes.STRING, allowNull: false, unique: true },
  senha: { type: DataTypes.STRING, allowNull: false },
  tipo: {
    type: DataTypes.ENUM('ADMIN', 'VENDEDOR', 'SUPER_ADMIN'), 
    allowNull: false,
    defaultValue: 'VENDEDOR'
  },
}, {
  tableName: 'usuarios',
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
  hooks: {
    beforeCreate: async (user) => {
      if (user.senha) {
        const salt = await bcrypt.genSalt(10);
        user.senha = await bcrypt.hash(user.senha, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('senha')) {
        const salt = await bcrypt.genSalt(10);
        user.senha = await bcrypt.hash(user.senha, salt);
      }
    }
  }
});

module.exports = UsuarioModel;