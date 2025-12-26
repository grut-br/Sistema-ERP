const Fornecedor = require('../domain/entities/fornecedor.entity');
class CriarFornecedorUseCase {
  constructor(repository) { this.repository = repository; }
  async execute(dados) {
    const fornecedor = new Fornecedor(dados);
    return this.repository.salvar(fornecedor);
  }
}
module.exports = CriarFornecedorUseCase;