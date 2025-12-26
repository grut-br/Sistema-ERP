class BuscarClientePorIdUseCase {
  constructor(clienteRepository) {
    this.clienteRepository = clienteRepository;
  }

  async execute(id) {
    const cliente = await this.clienteRepository.buscarPorId(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado.');
    }
    return cliente;
  }
}

module.exports = BuscarClientePorIdUseCase;