class RegistrarMovimentacaoCaixaUseCase {
  constructor(caixaRepository) {
    this.caixaRepository = caixaRepository;
  }

  async execute({ idSessao, tipo, valor, formaPagamento, descricao }) {
    if (valor <= 0) throw new Error('O valor deve ser positivo.');

    const sessao = await this.caixaRepository.buscarSessaoPorId(idSessao);
    if (!sessao || sessao.status !== 'ABERTO') {
        throw new Error('Sessão de caixa não encontrada ou fechada.');
    }

    const mov = await this.caixaRepository.registrarMovimentacao({
      id_sessao: idSessao,
      tipo, // 'SANGRIA' or 'SUPRIMENTO' usually, but generic enough
      valor,
      forma_pagamento: formaPagamento || 'DINHEIRO',
      descricao
    });

    return mov;
  }
}

module.exports = RegistrarMovimentacaoCaixaUseCase;
