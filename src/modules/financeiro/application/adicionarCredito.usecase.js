class AdicionarCreditoUseCase {
  constructor(creditoRepository) {
    this.creditoRepository = creditoRepository;
  }

  async execute({ idCliente, valor, descricao, idVendaOrigem }, options = {}) {
    if (!idCliente) throw new Error('Cliente é obrigatório para gerar crédito.');
    if (valor <= 0) return;

    return this.creditoRepository.adicionar({
      idCliente,
      valor,
      tipo: 'ENTRADA', // É uma entrada na carteira do cliente
      descricao,
      idVendaOrigem
    }, options);
  }
}
module.exports = AdicionarCreditoUseCase;