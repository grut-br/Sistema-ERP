class AtualizarClienteUseCase {
  constructor(clienteRepository) {
    this.clienteRepository = clienteRepository;
  }

  async execute(id, dadosParaAtualizar) {
    const cliente = await this.clienteRepository.buscarPorId(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado.');
    }

    Object.assign(cliente, dadosParaAtualizar);
    cliente.validar();

    return this.clienteRepository.atualizar(cliente);
  }
}

module.exports = AtualizarClienteUseCase;