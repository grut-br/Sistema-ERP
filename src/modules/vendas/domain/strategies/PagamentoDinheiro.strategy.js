const IProcessadorPagamento = require('./IProcessadorPagamento');

class PagamentoDinheiro extends IProcessadorPagamento {
  processar(valor, dadosExtras) {
    // O frontend deve mandar 'valorRecebido' se for diferente do valor da venda
    const valorRecebido = Number(dadosExtras.valorRecebido) || valor;
    
    // Define para onde vai o troco (Padrão: DINHEIRO, mas pode ser PIX ou CREDITO)
    const destinoTroco = dadosExtras.destinoTroco || 'DINHEIRO'; 
    
    if (valorRecebido < valor) {
      throw new Error(`Valor recebido (R$ ${valorRecebido}) é insuficiente para o pagamento de R$ ${valor}.`);
    }

    const troco = valorRecebido - valor;

    return {
      status: 'APROVADO',
      taxa: 0.00,
      valorLiquido: valor,
      mensagem: `Dinheiro. Recebido: R$ ${valorRecebido}. Troco: R$ ${troco.toFixed(2)} (${destinoTroco}).`,
      detalhes: { 
        valorRecebido: valorRecebido,
        troco: troco,
        destinoTroco: destinoTroco 
      }
    };
  }
}

module.exports = PagamentoDinheiro;