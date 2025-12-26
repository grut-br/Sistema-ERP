class RegistrarFiadoUseCase {
  // No futuro, receberia também fiadoRepository e vendaRepository
  constructor(clienteRepository) {
    this.clienteRepository = clienteRepository;
  }

  async execute({ clienteId, vendaId, valor }) {
    // Lógica futura:
    // 1. Buscar o cliente para verificar o limite de fiado.
    // 2. Criar um novo registro na tabela 'fiados'.
    // 3. Retornar o registro criado.
    console.log(`Registrando fiado de ${valor} para o cliente ${clienteId} referente à venda ${vendaId}.`);
    // Placeholder:
    return { success: true, message: 'Funcionalidade a ser implementada.' };
  }
}

module.exports = RegistrarFiadoUseCase;