class ObterInfoFinanceiraUseCase {
  constructor(clienteRepository, fidelizacaoRepository, creditoRepository) {
    this.clienteRepository = clienteRepository;
    this.fidelizacaoRepository = fidelizacaoRepository;
    this.creditoRepository = creditoRepository;
  }

  async execute(clienteId) {
    const cliente = await this.clienteRepository.buscarPorId(clienteId);
    if (!cliente) {
      throw new Error('Cliente não encontrado.');
    }

    // 1. Limite de Fiado
    const limiteFiado = cliente.limiteFiado || 0;

    // 2. Pontos de Fidelidade
    let pontos = 0;
    if (this.fidelizacaoRepository) {
        const perfil = await this.fidelizacaoRepository.buscarPorClienteId(clienteId);
        if (perfil) {
            pontos = perfil.pontosSaldo;
        }
    }

    // 3. Saldo em Créditos
    let saldoCredito = 0;
    if (this.creditoRepository) {
        saldoCredito = await this.creditoRepository.buscarSaldoCliente(clienteId);
    }

    return {
      limiteFiado: Number(limiteFiado),
      pontos: Number(pontos),
      saldoCredito: Number(saldoCredito)
    };
  }
}

module.exports = ObterInfoFinanceiraUseCase;
