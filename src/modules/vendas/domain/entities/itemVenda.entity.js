class ItemVenda {
  constructor({ id, idVenda, idProduto, produto, quantidade, precoUnitario }) {
    this.id = id;
    this.idVenda = idVenda;
    this.idProduto = idProduto;
    this.produto = produto; // Objeto produto completo
    this.quantidade = quantidade;
    this.precoUnitario = precoUnitario;
  }
}
module.exports = ItemVenda;