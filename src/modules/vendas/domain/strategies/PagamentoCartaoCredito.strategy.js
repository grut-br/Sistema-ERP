const IProcessadorPagamento = require('./IProcessadorPagamento');

class PagamentoCartaoCredito extends IProcessadorPagamento {
  processar(valor, dadosExtras) {
    const parcelas = dadosExtras.parcelas || 1;
    
    let taxaAdministrativa = 0;
    let valorLiquido = 0;
    let mensagem = '';

    // REGRA DE NEGÓCIO:
    if (parcelas === 1) {
      // À VISTA: A loja paga a taxa (ex: 3.5%)
      const PORCENTAGEM_TAXA = 0.035;
      taxaAdministrativa = valor * PORCENTAGEM_TAXA;
      valorLiquido = valor - taxaAdministrativa;
      mensagem = `Crédito à vista (1x). Taxa assumida pela loja.`;
    } else {
      // PARCELADO (2x ou mais): Taxa repassada ao comprador
      // Se a maquininha cobra os juros do cliente, a loja recebe o valor "cheio" do produto.
      // Ex: Produto é 100. Maquininha cobra 110 do cliente. Loja recebe 100.
      taxaAdministrativa = 0.00; 
      valorLiquido = valor; 
      mensagem = `Crédito parcelado em ${parcelas}x. Taxa repassada ao cliente.`;
    }

    return {
      status: 'APROVADO',
      taxa: taxaAdministrativa, // Será 0 se for parcelado
      valorLiquido: valorLiquido,
      mensagem: mensagem,
      detalhes: { 
        parcelas: parcelas,
        taxaRepassada: parcelas > 1 // Flag para saber se repassou
      }
    };
  }
}

module.exports = PagamentoCartaoCredito;