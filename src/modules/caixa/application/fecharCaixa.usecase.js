class FecharCaixaUseCase {
  constructor(caixaRepository) {
    this.caixaRepository = caixaRepository;
  }

  async execute({ idSessao, saldoFinalInformado }) {
    const sessao = await this.caixaRepository.buscarSessaoPorId(idSessao);
    if (!sessao || sessao.status !== 'ABERTO') {
      throw new Error('Sessão inválida ou já fechada.');
    }

    // Re-calculate balance to be sure
    let saldoCalculado = parseFloat(sessao.saldo_inicial);
    
    sessao.movimentacoes.forEach(mov => {
        const val = parseFloat(mov.valor);
        if (mov.forma_pagamento === 'DINHEIRO') {
            if (mov.tipo === 'ENTRADA' || mov.tipo === 'SUPRIMENTO') {
                saldoCalculado += val;
            } else if (mov.tipo === 'SAIDA' || mov.tipo === 'SANGRIA') {
                saldoCalculado -= val;
            }
        }
    });

    const diferenca = parseFloat(saldoFinalInformado) - saldoCalculado;

    await this.caixaRepository.fecharSessao(idSessao, {
      saldo_final_informado: saldoFinalInformado,
      saldo_final_calculado: saldoCalculado,
      diferenca: diferenca,
      data_fechamento: new Date(),
      status: 'FECHADO'
    });

    return {
      saldo_final_calculado: saldoCalculado,
      saldo_final_informado: saldoFinalInformado,
      diferenca
    };
  }
}

module.exports = FecharCaixaUseCase;
