const Categoria = require('../domain/entities/categoria.entity');
class CriarCategoriaUseCase {
  constructor(repository) { this.repository = repository; }
  async execute({ nome }) {
    const novaCategoria = new Categoria({ nome });
    return this.repository.salvar(novaCategoria);
  }
}
module.exports = CriarCategoriaUseCase;