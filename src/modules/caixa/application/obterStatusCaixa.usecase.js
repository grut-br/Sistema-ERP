class ObterStatusCaixaUseCase {
  constructor(caixaRepository) {
    this.caixaRepository = caixaRepository;
  }

  async execute() {
    const sessao = await this.caixaRepository.buscarSessaoAberta();
    if (!sessao) {
      return { aberto: false, mensagem: 'Nenhum caixa aberto no momento.' };
    }

    // Calcular totais
    let totalEntradasDinheiro = 0;
    let totalSaidasDinheiro = 0;
    let totalVendasPix = 0;
    let totalVendasCartao = 0;

    // TODO: Verify if we should separate SALES from MANUAL movements in the dashboard logic
    // For now, simple aggregation based on type and payment method

    sessao.movimentacoes.forEach(mov => {
        const valor = parseFloat(mov.valor);

        if (mov.tipo === 'ENTRADA') {
            if (mov.forma_pagamento === 'DINHEIRO') totalEntradasDinheiro += valor;
            if (mov.forma_pagamento === 'PIX') totalVendasPix += valor;
            if (mov.forma_pagamento === 'CARTAO') totalVendasCartao += valor;
        } else if (mov.tipo === 'SUPRIMENTO') {
            if (mov.forma_pagamento === 'DINHEIRO') totalEntradasDinheiro += valor;
        } else if (mov.tipo === 'SAIDA' || mov.tipo === 'SANGRIA') {
            if (mov.forma_pagamento === 'DINHEIRO') totalSaidasDinheiro += valor;
        }
    });

    const saldoInicial = parseFloat(sessao.saldo_inicial);
    const saldoAtual = saldoInicial + totalEntradasDinheiro - totalSaidasDinheiro;

    return {
      aberto: true,
      sessao: {
        id: sessao.id,
        id_usuario: sessao.id_usuario,
        data_abertura: sessao.data_abertura,
        saldo_inicial: saldoInicial,
        saldo_atual: saldoAtual,
        totais: {
            entradas_dinheiro: totalEntradasDinheiro,
            saidas_dinheiro: totalSaidasDinheiro,
            vendas_pix: totalVendasPix,
            vendas_cartao: totalVendasCartao
        },
        movimentacoes: sessao.movimentacoes
      }
    };
  }
}

module.exports = ObterStatusCaixaUseCase;
