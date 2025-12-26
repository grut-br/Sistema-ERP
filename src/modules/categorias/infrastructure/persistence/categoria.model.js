const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');

const CategoriaModel = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'categorias',
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em',
});

module.exports = CategoriaModel;