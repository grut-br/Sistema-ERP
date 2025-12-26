const IProcessadorPagamento = require('./IProcessadorPagamento');

class PagamentoCredito extends IProcessadorPagamento {
  processar(valor) {
    // A validação de saldo será feita no banco de dados (UseCase), 
    // aqui apenas formatamos o pedido.
    return {
      status: 'PENDENTE_VALIDACAO', // Será validado na transação
      taxa: 0.00,
      valorLiquido: valor,
      mensagem: 'Utilização de saldo em carteira.',
      detalhes: { 
        tipo: 'CREDITO_LOJA'
      }
    };
  }
}

module.exports = PagamentoCredito;