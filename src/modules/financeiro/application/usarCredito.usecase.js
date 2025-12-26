class UsarCreditoUseCase {
  constructor(creditoRepository) {
    this.creditoRepository = creditoRepository;
  }

  async execute({ idCliente, valor, idVenda }, options = {}) {
    // 1. Verificar o saldo atual (dentro da transação para garantir segurança)
    const saldoAtual = await this.creditoRepository.buscarSaldoCliente(idCliente, options);

    if (saldoAtual < valor) {
      throw new Error(`Saldo insuficiente. O cliente possui R$ ${saldoAtual.toFixed(2)} em créditos, mas tentou usar R$ ${valor.toFixed(2)}.`);
    }

    // 2. Registrar a saída (Uso do crédito)
    return this.creditoRepository.adicionar({
      idCliente,
      valor: valor,
      tipo: 'SAIDA', // Saída da carteira do cliente
      descricao: `Pagamento da Venda #${idVenda}`,
      idVendaOrigem: idVenda
    }, options);
  }
}

module.exports = UsarCreditoUseCase;