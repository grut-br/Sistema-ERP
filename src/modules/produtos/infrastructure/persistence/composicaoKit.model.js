const { DataTypes } = require("sequelize");
const sequelize = require("../../../../shared/infra/database");
const ProdutoModel = require("./produto.model");

const ComposicaoKitModel = sequelize.define(
  "ComposicaoKit",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    idProdutoPai: { type: DataTypes.INTEGER, field: "id_produto_pai" },
    idProdutoFilho: { type: DataTypes.INTEGER, field: "id_produto_filho" },
    quantidade: { type: DataTypes.INTEGER, allowNull: false },
    precoNoCombo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "preco_no_combo",
    },
  },
  {
    tableName: "composicao_kits",
    timestamps: false,
  }
);

// Associações
// Um Produto (Pai) tem muitos componentes
ProdutoModel.hasMany(ComposicaoKitModel, {
  foreignKey: "idProdutoPai",
  as: "componentes",
});
// Cada linha da composição pertence a um produto filho (o item real)
ComposicaoKitModel.belongsTo(ProdutoModel, {
  foreignKey: "idProdutoFilho",
  as: "produtoFilho",
});

module.exports = ComposicaoKitModel;
