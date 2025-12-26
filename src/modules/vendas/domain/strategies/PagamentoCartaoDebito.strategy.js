const IProcessadorPagamento = require('./IProcessadorPagamento');

class PagamentoCartaoDebito extends IProcessadorPagamento {
  processar(valor) {
    // Exemplo: Taxa de Débito de 1.99%
    const PORCENTAGEM_TAXA = 0.0199; 
    
    const taxaAdministrativa = valor * PORCENTAGEM_TAXA;
    const valorLiquido = valor - taxaAdministrativa;

    return {
      status: 'APROVADO',
      taxa: taxaAdministrativa,
      valorLiquido: valorLiquido, // O que cai na conta da loja
      mensagem: 'Débito aprovado.',
      detalhes: { 
        tipo: 'DEBITO',
        taxaAplicada: '1.99%' 
      }
    };
  }
}

module.exports = PagamentoCartaoDebito;