const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infra/database');
const CategoriaModel = require('../../../categorias/infrastructure/persistence/categoria.model');
const FabricanteModel = require('../../../fabricantes/infrastructure/persistence/fabricante.model');


const ProdutoModel = sequelize.define('Produto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
  },
  idCategoria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_categoria',
    references: {
      model: 'categorias',
      key: 'id'
    }
  },
  idFabricante: {
    type: DataTypes.INTEGER,
    allowNull: true, // Assuming it can be null if not all products have a manufacturer
    field: 'id_fabricante',
    references: {
      model: 'fabricantes',
      key: 'id'
    }
  },
  precoVenda: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'preco_venda'
  },
  codigoBarras: {
    type: DataTypes.STRING,
    field: 'codigo_barras'
  },
  urlImagem: {
    type: DataTypes.STRING,
    field: 'url_imagem'
  },
  eKit: { 
    type: DataTypes.BOOLEAN, 
    field: 'e_kit', 
    defaultValue: false 
  },

  status: { 
    type: DataTypes.ENUM('ATIVO', 'INATIVO', 'SEM_ESTOQUE'), 
    defaultValue: 'ATIVO' 
  },
  estoqueMinimo: {
    type: DataTypes.INTEGER,
    field: 'estoque_minimo',
    defaultValue: 0
  },
}, {
  tableName: 'produtos',
  timestamps: false
});

ProdutoModel.belongsTo(CategoriaModel, { foreignKey: 'idCategoria', as: 'categoria' });
CategoriaModel.hasMany(ProdutoModel, { foreignKey: 'idCategoria' });

// Associações
ProdutoModel.belongsTo(FabricanteModel, { foreignKey: 'idFabricante', as: 'fabricante' });

module.exports = ProdutoModel;