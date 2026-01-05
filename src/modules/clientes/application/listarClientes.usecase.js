/**
 * ListarClientesUseCase
 * Retorna lista de clientes com dados enriquecidos para o dashboard
 */
class ListarClientesUseCase {
  constructor(clienteRepository) {
    this.clienteRepository = clienteRepository;
  }

  /**
   * Lista clientes com dados calculados de saúde financeira e engajamento
   * @param {Object} filtros - Filtros opcionais
   * @param {string} filtros.search - Busca por nome ou CPF
   * @param {boolean} filtros.inadimplente - Apenas clientes com pendência
   * @param {boolean} filtros.comCredito - Apenas clientes com crédito em loja
   * @param {boolean} filtros.aniversariantes - Apenas aniversariantes do mês
   * @returns {Array} Lista de clientes enriquecidos
   */
  async execute(filtros = {}) {
    return this.clienteRepository.buscarTodosEnriquecidos(filtros);
  }
}

module.exports = ListarClientesUseCase;
