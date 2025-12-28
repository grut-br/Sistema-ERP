class AtualizarFabricanteUseCase {
  constructor(fabricanteRepository) {
    this.fabricanteRepository = fabricanteRepository;
  }

  async execute(id, dados) {
    if (!dados.nome) throw new Error('Nome é obrigatório');
    const fabricante = await this.fabricanteRepository.atualizar(id, dados);
    if (!fabricante) throw new Error('Fabricante não encontrado');
    return fabricante;
  }
}

module.exports = AtualizarFabricanteUseCase;
