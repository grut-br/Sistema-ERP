class Venda {
  constructor({ id, idCliente, idUsuario, metodoPagamento, itens, totalVenda, dataVenda, status, pagamentos }) {
    this.id = id;
    this.idCliente = idCliente;
    this.idUsuario = idUsuario;
    this.metodoPagamento = metodoPagamento;
    this.itens = itens || [];
    this.totalVenda = totalVenda;
    this.dataVenda = dataVenda;
    this.status = status;
    this.pagamentos = pagamentos || []; 
  }
}

module.exports = Venda;