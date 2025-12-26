class DeletarFornecedorUseCase {
  constructor(repository) { this.repository = repository; }
  async execute(id) {
    const fornecedor = await this.repository.buscarPorId(id);
    if (!fornecedor) throw new Error('Fornecedor não encontrado.');
    return this.repository.deletar(id);
  }
}
module.exports = DeletarFornecedorUseCase;