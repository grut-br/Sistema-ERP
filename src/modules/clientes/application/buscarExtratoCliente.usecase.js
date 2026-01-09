/**
 * Use Case: Buscar Extrato do Cliente
 * Retorna uma linha do tempo unificada de Vendas (Dívidas) e Pagamentos
 */
const HistoricoPagamentoModel = require('../../financeiro/infrastructure/persistence/historicoPagamento.model');
const { Op } = require('sequelize');

class BuscarExtratoClienteUseCase {
  constructor(lancamentoRepository) {
    this.lancamentoRepository = lancamentoRepository;
  }

  async execute(clienteId) {
    if (!clienteId) {
      throw new Error('ID do cliente é obrigatório');
    }

    // 1. Buscar todos os lançamentos do cliente (Vendas/Dívidas)
    // Filtramos apenas os do tipo RECEITA (que geram dívida para o cliente pagar)
    const lancamentos = await this.lancamentoRepository.buscarPorClienteId(clienteId);
    const dividas = lancamentos.filter(l => l.tipo === 'RECEITA');

    if (dividas.length === 0) {
      return [];
    }

    // 2. Buscar histórico de pagamentos vinculados a essas dívidas
    const lancamentoIds = dividas.map(d => d.id);
    
    const pagamentos = await HistoricoPagamentoModel.findAll({
      where: {
        idLancamento: {
          [Op.in]: lancamentoIds
        }
      },
      order: [['dataPagamento', 'ASC']]
    });

    // 3. Unificar e formatar a lista
    const extrato = [];

    // Adiciona as dívidas (Vendas)
    dividas.forEach(divida => {
      extrato.push({
        id: `divida-${divida.id}`,
        tipo: 'VENDA',
        data: divida.criadoEm || divida.dataVencimento, // Fallback se criadoEm não existir
        valor: divida.valor,
        descricao: divida.descricao,
        status: divida.status,
        origemId: divida.idVenda || divida.id // ID da Venda (para link) ou do Lançamento (fallback)
      });
    });

    // Adiciona os pagamentos
    pagamentos.forEach(pagto => {
      extrato.push({
        id: `pagto-${pagto.id}`,
        tipo: 'PAGAMENTO',
        data: pagto.dataPagamento,
        valor: pagto.valor, // Negativo? Visualmente sim, mas aqui mandamos absoluto
        descricao: pagto.observacao || 'Pagamento Recebido',
        formaPagamento: pagto.formaPagamento,
        origemId: pagto.id // ID original do pagamento
      });
    });

    // 4. Ordenar cronologicamente (Mais antigo para mais novo ou vice-versa?)
    // O pedido diz: "Lista cronológica". Geralmente do mais recente para o mais antigo é melhor para ver o saldo atual.
    // O exemplo mostra: Venda (31/12), Pagamento (02/01). Isso é Ascendente.
    // Vamos ordenar ASC (Antigo -> Novo) para calcular saldo se precisasse, mas visualmente pode ser DESC.
    // O usuário desenhou:
    // 🔽 Venda #47 (31/12)
    // 🔼 Pagamento (02/01)
    // Isso sugere ordem cronológica visivel. Padrão extrato bancário.
    
    extrato.sort((a, b) => new Date(b.data) - new Date(a.data)); // DESC (Mais recente no topo)

    return extrato;
  }
}

module.exports = BuscarExtratoClienteUseCase;
