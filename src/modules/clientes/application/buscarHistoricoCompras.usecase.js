/**
 * BuscarHistoricoComprasUseCase
 * Retorna as últimas vendas realizadas para um cliente específico
 */
class BuscarHistoricoComprasUseCase {
  constructor(vendaRepository) {
    this.vendaRepository = vendaRepository;
  }

  /**
   * Busca o histórico de compras de um cliente
   * @param {number} clienteId - ID do cliente
   * @param {number} limite - Quantidade máxima de vendas a retornar (default: 5)
   * @returns {Array} Lista de vendas com data, valor e status
   */
  async execute(clienteId, limite = 5) {
    const vendas = await this.vendaRepository.buscarPorClienteId(clienteId, limite);
    
    return vendas.map(venda => ({
      id: venda.id,
      dataVenda: venda.dataVenda,
      totalVenda: venda.totalVenda,
      status: venda.status
    }));
  }
}

module.exports = BuscarHistoricoComprasUseCase;