class EstornarPontosUseCase {
  constructor(fidelizacaoRepository) {
    this.fidelizacaoRepository = fidelizacaoRepository;
  }

  async execute({ clienteId, valorCompra }, options = {}) {
    const perfil = await this.fidelizacaoRepository.buscarPorClienteId(clienteId, options);
    if (!perfil) return; // Cliente não tem perfil

    // Usa a MESMA regra de ganho, mas ao contrário
    const pontosEstornados = Math.floor(valorCompra);
    if (pontosEstornados <= 0) return;

    // Usamos o método 'resgatarPontos' da entidade, que já valida o saldo
    perfil.resgatarPontos(pontosEstornados);
    
    return this.fidelizacaoRepository.atualizar(perfil, options);
  }
}
module.exports = EstornarPontosUseCase;