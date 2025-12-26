const IProcessadorPagamento = require('./IProcessadorPagamento');

class PagamentoPix extends IProcessadorPagamento {
  processar(valor, dadosExtras) {
    // Futuro: Validar se o comprovante foi anexado?
    return {
      status: 'APROVADO',
      taxa: 0.00,
      valorLiquido: valor,
      mensagem: 'Pagamento PIX registrado.',
      detalhes: {}
    };
  }
}
module.exports = PagamentoPix;