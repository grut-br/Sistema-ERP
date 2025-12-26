class ItemCompra {
  // Adicione 'validade'
  constructor({ id, idCompra, idProduto, produto, quantidade, custoUnitario, validade }) {
    this.id = id;
    this.idCompra = idCompra;
    this.idProduto = idProduto;
    this.produto = produto;
    this.quantidade = quantidade;
    this.custoUnitario = custoUnitario;
    this.validade = validade; // <-- Novo
  }
}
module.exports = ItemCompra;