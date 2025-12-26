class VerificarContasVencendoUseCase {
  constructor(lancamentoRepository, criarNotificacaoUseCase) {
    this.lancamentoRepository = lancamentoRepository;
    this.criarNotificacaoUseCase = criarNotificacaoUseCase;
  }

  async execute({ diasParaVencer }) {
    console.log('[Job] Executando verificação de contas vencendo...');
    // 1. Busca as contas usando o novo método do repositório
    const contas = await this.lancamentoRepository.buscarContasPendentesPorVencimento(diasParaVencer);

    if (contas.length === 0) {
      console.log('[Job] Nenhuma conta vencendo ou vencida.');
      return;
    }

    // 2. Para cada conta, cria a notificação correta
    for (const conta of contas) {
      let tipoNotificacao;
      let mensagem;

      if (conta.tipo === 'RECEITA') {
        tipoNotificacao = 'COBRANCA_FIADO';
        mensagem = `Cobrança de Fiado: Lançamento #${conta.id} (R$ ${conta.valor}) venceu ou vence em breve. Venc: ${conta.dataVencimento}`;
      } else { // DESPESA
        tipoNotificacao = 'CONTA_A_PAGAR_VENCENDO';
        mensagem = `Conta a Pagar: Lançamento #${conta.id} (R$ ${conta.valor}) venceu ou vence em breve. Venc: ${conta.dataVencimento}`;
      }

      // 3. Chama o módulo de notificações
      await this.criarNotificacaoUseCase.execute({
        tipo: tipoNotificacao,
        mensagem: mensagem,
        idReferencia: conta.id,
        referenciaTipo: 'LANCAMENTO'
      });
    }
    console.log(`[Job] ${contas.length} notificações financeiras criadas.`);
  }
}

module.exports = VerificarContasVencendoUseCase;