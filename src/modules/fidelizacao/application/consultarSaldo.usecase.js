class ConsultarSaldoUseCase {
  constructor(repository) { this.repository = repository; }
  async execute({ clienteId }) {
    const perfil = await this.repository.buscarPorClienteId(clienteId);
    if (!perfil) throw new Error('Perfil de fidelidade não encontrado.');
    return perfil;
  }
}
module.exports = ConsultarSaldoUseCase;