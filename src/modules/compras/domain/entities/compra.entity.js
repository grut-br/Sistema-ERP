class Compra {
  constructor({ id, idFornecedor, dataCompra, valorTotal, observacoes, itens, fornecedor }) {
    this.id = id;
    this.idFornecedor = idFornecedor;
    this.dataCompra = dataCompra;
    this.valorTotal = valorTotal;
    this.observacoes = observacoes;
    this.itens = itens || []; // Array de ItemCompra
    this.fornecedor = fornecedor;
  }
}
module.exports = Compra;