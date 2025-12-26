class AdicionarPontosUseCase {
  constructor(repository) { this.repository = repository; }
  async execute({ clienteId, valorCompra }) {
    const perfil = await this.repository.buscarPorClienteId(clienteId);
    if (!perfil) return; // Cliente pode não ter perfil de fidelidade

    // REGRA DE NEGÓCIO: 1 ponto para cada R$ 1 gasto (arredondado para baixo)
    const pontosGanhos = Math.floor(valorCompra);
    if (pontosGanhos <= 0) return;

    perfil.adicionarPontos(pontosGanhos);
    return this.repository.atualizar(perfil);
  }
}
module.exports = AdicionarPontosUseCase;