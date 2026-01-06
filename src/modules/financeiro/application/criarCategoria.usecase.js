const CategoriaFinanceira = require('../domain/entities/categoriaFinanceira.entity');

class CriarCategoriaUseCase {
  constructor(categoriaRepository) {
    this.categoriaRepository = categoriaRepository;
  }

  async execute(dados) {
    const categoria = new CategoriaFinanceira(dados);
    return this.categoriaRepository.salvar(categoria);
  }
}

module.exports = CriarCategoriaUseCase;
