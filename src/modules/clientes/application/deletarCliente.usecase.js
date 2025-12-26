class DeletarClienteUseCase {
  constructor(clienteRepository) {
    this.clienteRepository = clienteRepository;
  }

  async execute(id) {
    // A validação se o cliente existe pode ser delegada ao repositório
    // ou verificada aqui, como nos outros casos de uso.
    return this.clienteRepository.deletar(id);
  }
}

module.exports = DeletarClienteUseCase;