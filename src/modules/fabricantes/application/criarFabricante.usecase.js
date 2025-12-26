const Fabricante = require('../domain/entities/fabricante.entity');

class CriarFabricanteUseCase {
  constructor(fabricanteRepository) {
    this.fabricanteRepository = fabricanteRepository;
  }

  async execute({ nome }) {
    if (!nome) throw new Error('Nome é obrigatório');
    const fabricante = new Fabricante({ nome });
    return await this.fabricanteRepository.salvar(fabricante);
  }
}

module.exports = CriarFabricanteUseCase;
