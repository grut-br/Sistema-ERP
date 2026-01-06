class DeletarCategoriaUseCase {
  constructor(categoriaRepository) {
    this.categoriaRepository = categoriaRepository;
  }

  async execute(id) {
    const categoria = await this.categoriaRepository.buscarPorId(id);
    if (!categoria) throw new Error('Categoria não encontrada.');
    
    // TODO: Verificar se há lançamentos usando esta categoria antes de deletar
    await this.categoriaRepository.deletar(id);
  }
}

module.exports = DeletarCategoriaUseCase;
