class AtualizarFornecedorUseCase {
  constructor(repository) { this.repository = repository; }
  async execute(id, dados) {
    const fornecedor = await this.repository.buscarPorId(id);
    if (!fornecedor) throw new Error('Fornecedor não encontrado.');
    Object.assign(fornecedor, dados);
    fornecedor.validar();
    return this.repository.atualizar(fornecedor);
  }
}
module.exports = AtualizarFornecedorUseCase;