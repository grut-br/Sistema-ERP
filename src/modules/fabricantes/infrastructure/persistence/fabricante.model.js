const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');

const FabricanteModel = sequelize.define('Fabricante', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'fabricantes',
  timestamps: false // Assuming no createdAt/updatedAt for simple lookup table, or true if desired. Defaulting to false for simplicity based on prompt description unless user specifies.
});

module.exports = FabricanteModel;
