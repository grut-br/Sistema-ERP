class CancelarFiadoPorVendaUseCase {
  constructor(lancamentoRepository) {
    this.lancamentoRepository = lancamentoRepository;
  }

  async execute({ vendaId }, options = {}) {
    return this.lancamentoRepository.cancelarFiadoPorVendaId(vendaId, options);
  }
}
module.exports = CancelarFiadoPorVendaUseCase;