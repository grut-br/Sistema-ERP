class ItemVenda {
  constructor({ id, idVenda, idProduto, produto, quantidade, precoUnitario }) {
    this.id = id;
    this.idVenda = idVenda;
    this.idProduto = idProduto;
    this.produto = produto; // Objeto produto completo
    this.quantidade = Number(quantidade) || 0;
    this.precoUnitario = Number(precoUnitario) || 0;
    this.subtotal = this.quantidade * this.precoUnitario;
  }
}
module.exports = ItemVenda;