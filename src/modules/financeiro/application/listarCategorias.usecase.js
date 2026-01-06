class ListarCategoriasUseCase {
  constructor(categoriaRepository) {
    this.categoriaRepository = categoriaRepository;
  }

  async execute(filtros = {}) {
    return this.categoriaRepository.listarTodas(filtros);
  }
}

module.exports = ListarCategoriasUseCase;
