class BuscarCategoriaPorIdUseCase {
  constructor(categoriaRepository) {
    this.categoriaRepository = categoriaRepository;
  }

  async execute(id) {
    const categoria = await this.categoriaRepository.buscarPorId(id);
    if (!categoria) throw new Error('Categoria não encontrada.');
    return categoria;
  }
}

module.exports = BuscarCategoriaPorIdUseCase;
