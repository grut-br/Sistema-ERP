class AtualizarClienteUseCase {
  constructor(clienteRepository) {
    this.clienteRepository = clienteRepository;
  }

  async execute(id, dadosParaAtualizar) {
    const cliente = await this.clienteRepository.buscarPorId(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado.');
    }

    // Sanitize data
    if (dadosParaAtualizar.dataNascimento === '' || dadosParaAtualizar.dataNascimento === 'Invalid date') {
        dadosParaAtualizar.dataNascimento = null;
    }
    if (dadosParaAtualizar.email === '') dadosParaAtualizar.email = null;
    if (dadosParaAtualizar.cpf === '') dadosParaAtualizar.cpf = null; // Fix: convert empty CPF to null to avoid unique constraint error
    if (dadosParaAtualizar.genero === '' || dadosParaAtualizar.genero === 'NAO_INFORMAR') {
        dadosParaAtualizar.genero = null;
    }

    Object.assign(cliente, dadosParaAtualizar);
    cliente.validar();

    return this.clienteRepository.atualizar(cliente);
  }
}

module.exports = AtualizarClienteUseCase;