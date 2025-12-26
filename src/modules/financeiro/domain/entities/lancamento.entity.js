class Lancamento {
  constructor({ id, descricao, valor, tipo, status, dataVencimento, dataPagamento, idCliente, idVenda }) {
    this.id = id;
    this.descricao = descricao;
    this.valor = valor;
    this.tipo = tipo;
    this.status = status || 'PENDENTE';
    this.dataVencimento = dataVencimento;
    this.dataPagamento = dataPagamento;
    this.idCliente = idCliente;
    this.idVenda = idVenda;

    this.validar();
  }

  validar() {
    if (!this.descricao || this.valor <= 0 || !this.tipo) {
      throw new Error('Descrição, valor (maior que zero) e tipo são obrigatórios.');
    }
  }

  // Ação de negócio para pagar/quitar o lançamento
  pagar() {
    if (this.status === 'PAGO') {
      throw new Error('Este lançamento já foi pago.');
    }
    this.status = 'PAGO';
    this.dataPagamento = new Date();
  }
}

module.exports = Lancamento;