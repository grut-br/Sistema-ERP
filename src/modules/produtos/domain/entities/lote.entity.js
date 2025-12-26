class Lote {
  constructor({ id, idProduto, idCompra, quantidade, validade, custoUnitario }) {
    this.id = id;
    this.idProduto = idProduto;
    this.idCompra = idCompra;
    this.quantidade = quantidade;
    this.validade = validade;
    this.custoUnitario = custoUnitario;
  }

  // Lógica de negócio para dar baixa no estoque deste lote
  darBaixa(quantidadeParaRetirar) {
    if (this.quantidade < quantidadeParaRetirar) {
      throw new Error(`Erro de lógica: Lote ${this.id} não tem estoque suficiente.`);
    }
    this.quantidade -= quantidadeParaRetirar;
  }
}

module.exports = Lote;