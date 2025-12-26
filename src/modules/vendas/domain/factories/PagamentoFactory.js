const PagamentoPix = require("../strategies/PagamentoPix.strategy");
const PagamentoCartaoCredito = require("../strategies/PagamentoCartaoCredito.strategy");
const PagamentoCartaoDebito = require("../strategies/PagamentoCartaoDebito.strategy");
const PagamentoDinheiro = require("../strategies/PagamentoDinheiro.strategy");
const PagamentoCredito = require("../strategies/PagamentoCredito.strategy");

class PagamentoFactory {
  static criar(metodo) {
    switch (metodo) {
      case "PIX":
        return new PagamentoPix();
      case "CARTAO_CREDITO":
        return new PagamentoCartaoCredito();
      case "CARTAO_DEBITO": 
        return new PagamentoCartaoDebito();
      case "DINHEIRO":
        return new PagamentoDinheiro();
      case "CREDITO":
        return new PagamentoCredito();
      case "FIADO":
        return null;
      default:
        throw new Error(`Método de pagamento ${metodo} não suportado.`);
    }
  }
}

module.exports = PagamentoFactory;
