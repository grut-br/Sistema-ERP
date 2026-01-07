const LancamentoSequelizeRepository = require('../../financeiro/infrastructure/persistence/LancamentoSequelize.repository');
const BuscarPendenciasClienteUseCase = require('../../financeiro/application/buscarPendenciasCliente.usecase');
const BaixarLancamentoUseCase = require('../../financeiro/application/baixarLancamento.usecase');
const PagarTodasPendenciasUseCase = require('../application/pagarTodasPendencias.usecase');
const sequelize = require('../../../shared/infra/database');

/**
 * Controller para operações financeiras relacionadas a clientes
 */
class ClienteFinanceiroController {
  constructor() {
    const lancamentoRepo = new LancamentoSequelizeRepository();
    
    this.buscarPendenciasUseCase = new BuscarPendenciasClienteUseCase(lancamentoRepo);
    this.baixarLancamentoUseCase = new BaixarLancamentoUseCase(lancamentoRepo);
    this.pagarTodasPendenciasUseCase = new PagarTodasPendenciasUseCase(lancamentoRepo, sequelize);

    // Binds
    this.getPendencias = this.getPendencias.bind(this);
    this.baixarLancamento = this.baixarLancamento.bind(this);
    this.pagarTodasPendencias = this.pagarTodasPendencias.bind(this);
  }

  /**
   * GET /api/clientes/:id/pendencias
   * Retorna todas as pendências financeiras de um cliente
   */
  async getPendencias(req, res) {
    try {
      const { id } = req.params;
      const pendencias = await this.buscarPendenciasUseCase.execute(Number(id));
      res.status(200).json(pendencias);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/lancamentos/:id/baixar
   * Registra o recebimento de um lançamento (baixa de fiado)
   * Body: { metodoPagamento: "PIX" | "Dinheiro" | "Cartão", valorAPagar?: number }
   */
  async baixarLancamento(req, res) {
    try {
      console.log('[CONTROLLER] ===== INÍCIO =====');
      console.log('[CONTROLLER] req.body RAW:', JSON.stringify(req.body));
      console.log('[CONTROLLER] req.params:', req.params);
      
      const { id } = req.params;
      const { metodoPagamento, valorAPagar } = req.body;
      
      console.log('[CONTROLLER] Depois do destructuring:', { id, metodoPagamento, valorAPagar, tipo: typeof valorAPagar });
      
      const lancamento = await this.baixarLancamentoUseCase.execute(Number(id), metodoPagamento, valorAPagar);
      res.status(200).json(lancamento);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/clientes/:id/pendencias/pagar-todas
   * Paga todas as pendências do cliente distribuindo o valor via FIFO
   * Body: { valorPagamento: number, metodoPagamento: string }
   */
  async pagarTodasPendencias(req, res) {
    try {
      const { id } = req.params;
      const { valorPagamento, metodoPagamento } = req.body;
      
      const resultado = await this.pagarTodasPendenciasUseCase.execute(
        Number(id),
        valorPagamento,
        metodoPagamento
      );
      
      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = ClienteFinanceiroController;
