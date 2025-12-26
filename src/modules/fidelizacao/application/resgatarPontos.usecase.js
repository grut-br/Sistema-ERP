class ResgatarPontosUseCase {
  constructor(repository) { this.repository = repository; }
  async execute({ clienteId, pontos }) {
    const perfil = await this.repository.buscarPorClienteId(clienteId);
    if (!perfil) throw new Error('Perfil de fidelidade não encontrado.');

    perfil.resgatarPontos(pontos); // A entidade faz a validação do saldo
    return this.repository.atualizar(perfil);
  }
}
module.exports = ResgatarPontosUseCase;