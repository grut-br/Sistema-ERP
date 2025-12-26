class DeletarCategoriaUseCase {
  constructor(repository) { this.repository = repository; }
  async execute(id) {
    const categoria = await this.repository.buscarPorId(id);
    if (!categoria) throw new Error('Categoria não encontrada.');
    return this.repository.deletar(id);
  }
}
module.exports = DeletarCategoriaUseCase;