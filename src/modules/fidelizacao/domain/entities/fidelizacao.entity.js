class Fidelizacao {
  constructor({ id, idCliente, pontosSaldo }) {
    this.id = id;
    this.idCliente = idCliente;
    this.pontosSaldo = pontosSaldo;
  }

  adicionarPontos(pontos) {
    if (pontos < 0) throw new Error('Não é possível adicionar pontos negativos.');
    this.pontosSaldo += pontos;
  }

  resgatarPontos(pontos) {
    if (pontos < 0) throw new Error('Não é possível resgatar pontos negativos.');
    if (this.pontosSaldo < pontos) {
      throw new Error('Saldo de pontos insuficiente.');
    }
    this.pontosSaldo -= pontos;
  }
}
module.exports = Fidelizacao;