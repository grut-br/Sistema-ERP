class Venda {
  constructor({ id, idCliente, idUsuario, metodoPagamento, itens, totalVenda, dataVenda, status, pagamentos, cliente, destinoTroco, descontoManual, descontoPontos, creditoGerado }) {
    this.id = id;
    this.idCliente = idCliente;
    this.idUsuario = idUsuario;
    this.metodoPagamento = metodoPagamento;
    this.itens = itens || [];
    this.totalVenda = totalVenda;
    this.dataVenda = dataVenda;
    this.status = status;
    this.pagamentos = pagamentos || []; 
    this.cliente = cliente || null;
    this.destinoTroco = destinoTroco || null;
    this.descontoManual = descontoManual || 0;
    this.descontoPontos = descontoPontos || 0;
    this.creditoGerado = creditoGerado || 0;
  }
}

module.exports = Venda;