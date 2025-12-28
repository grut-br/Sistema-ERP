class DeletarFabricanteUseCase {
  constructor(fabricanteRepository) {
    this.fabricanteRepository = fabricanteRepository;
  }

  async execute(id) {
    // Pode-se adicionar verificação de vínculo com produtos aqui se o repositório não lançar erro de FK
    // Mas geralmente o banco cuida disso.
    await this.fabricanteRepository.deletar(id);
  }
}

module.exports = DeletarFabricanteUseCase;
