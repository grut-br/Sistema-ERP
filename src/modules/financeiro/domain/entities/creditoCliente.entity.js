class CreditoCliente {
  constructor({ id, idCliente, valor, tipo, descricao, idVendaOrigem, criado_em }) {
    this.id = id;
    this.idCliente = idCliente;
    this.valor = Number(valor);
    this.tipo = tipo;
    this.descricao = descricao;
    this.idVendaOrigem = idVendaOrigem;
    this.dataCriacao = criado_em;
  }
}
module.exports = CreditoCliente;