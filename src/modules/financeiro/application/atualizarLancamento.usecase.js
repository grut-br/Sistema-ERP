class AtualizarLancamentoUseCase {
  constructor(lancamentoRepository) {
    this.lancamentoRepository = lancamentoRepository;
  }

  async execute(id, dadosParaAtualizar) {
    const lancamento = await this.lancamentoRepository.buscarPorId(id);
    if (!lancamento) {
      throw new Error('Lançamento não encontrado.');
    }

    // Filtra apenas campos que foram enviados (não undefined)
    const camposPermitidos = ['descricao', 'valor', 'tipo', 'dataVencimento', 'idCategoria', 'frequencia'];
    const dadosFiltrados = {};
    
    for (const campo of camposPermitidos) {
      if (dadosParaAtualizar[campo] !== undefined) {
        dadosFiltrados[campo] = dadosParaAtualizar[campo];
      }
    }

    Object.assign(lancamento, dadosFiltrados);
    lancamento.validar(); // Revalida a entidade com os novos dados

    return this.lancamentoRepository.atualizar(lancamento);
  }
}

module.exports = AtualizarLancamentoUseCase;