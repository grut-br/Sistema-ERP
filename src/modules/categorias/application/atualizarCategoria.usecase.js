class AtualizarCategoriaUseCase {
  constructor(repository) { this.repository = repository; }
  async execute(id, { nome }) {
    const categoria = await this.repository.buscarPorId(id);
    if (!categoria) throw new Error('Categoria não encontrada.');
    categoria.nome = nome;
    categoria.validar();
    return this.repository.atualizar(categoria);
  }
}
module.exports = AtualizarCategoriaUseCase;