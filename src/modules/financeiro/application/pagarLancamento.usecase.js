class PagarLancamentoUseCase {
  constructor(repository) { this.repository = repository; }
  async execute(id) {
    const lancamento = await this.repository.buscarPorId(id);
    if (!lancamento) throw new Error('Lançamento não encontrado.');
    lancamento.pagar(); // Usa a lógica da entidade
    return this.repository.atualizar(lancamento);
  }
}
module.exports = PagarLancamentoUseCase;