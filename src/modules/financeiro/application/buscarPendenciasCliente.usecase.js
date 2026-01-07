/**
 * Use Case: Buscar Pendências de Cliente
 * Retorna todos os lançamentos financeiros pendentes (fiado) de um cliente específico
 */
class BuscarPendenciasClienteUseCase {
  constructor(lancamentoRepository) {
    this.lancamentoRepository = lancamentoRepository;
  }

  async execute(clienteId) {
    if (!clienteId) {
      throw new Error('ID do cliente é obrigatório');
    }

    // Busca todos os lançamentos do cliente
    const lancamentos = await this.lancamentoRepository.buscarPorClienteId(clienteId);
    
    // Filtra apenas pendências do tipo RECEITA (fiado)
    const pendencias = lancamentos.filter(l => 
      l.status === 'PENDENTE' && l.tipo === 'RECEITA'
    );

    // Ordena por data de vencimento (mais antigos primeiro)
    pendencias.sort((a, b) => {
      if (!a.dataVencimento) return 1;
      if (!b.dataVencimento) return -1;
      return new Date(a.dataVencimento) - new Date(b.dataVencimento);
    });

    return pendencias;
  }
}

module.exports = BuscarPendenciasClienteUseCase;
