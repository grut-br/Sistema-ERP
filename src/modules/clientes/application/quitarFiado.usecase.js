class QuitarFiadoUseCase {
  constructor(clienteRepository, fiadoRepository) {
    this.clienteRepository = clienteRepository;
    this.fiadoRepository = fiadoRepository; // Futuro
  }

  async execute({ fiadoId, valorPago }) {
    // Lógica futura:
    // 1. Buscar o registro de fiado pelo ID.
    // 2. Abater o valor pago do total da dívida.
    // 3. Marcar como 'quitado' se o valor for zerado.
    console.log(`Quitando ${valorPago} da dívida ${fiadoId}.`);
    // Placeholder:
    return { success: true, message: 'Funcionalidade a ser implementada.' };
  }
}

module.exports = QuitarFiadoUseCase;