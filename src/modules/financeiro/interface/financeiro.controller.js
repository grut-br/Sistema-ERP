const LancamentoSequelizeRepository = require('../infrastructure/persistence/LancamentoSequelize.repository');
const HistoricoPagamentoSequelizeRepository = require('../infrastructure/persistence/HistoricoPagamentoSequelize.repository');

// Importa todos os casos de uso
const CriarLancamentoUseCase = require('../application/criarLancamento.usecase');
const ListarLancamentosUseCase = require('../application/listarLancamentos.usecase');
const BuscarLancamentoPorIdUseCase = require('../application/buscarLancamentoPorId.usecase');
const AtualizarLancamentoUseCase = require('../application/atualizarLancamento.usecase');
const DeletarLancamentoUseCase = require('../application/deletarLancamento.usecase');
const PagarLancamentoUseCase = require('../application/pagarLancamento.usecase');
const ListarLancamentosPorClienteUseCase = require('../application/listarLancamentosPorCliente.usecase');
const BaixarLancamentoUseCase = require('../application/baixarLancamento.usecase');

class FinanceiroController {
  constructor() {
    const lancamentoRepo = new LancamentoSequelizeRepository();
    const historicoPagamentoRepo = new HistoricoPagamentoSequelizeRepository();

    // Instancia todos os casos de uso
    this.criarUseCase = new CriarLancamentoUseCase(lancamentoRepo);
    this.listarUseCase = new ListarLancamentosUseCase(lancamentoRepo);
    this.buscarPorIdUseCase = new BuscarLancamentoPorIdUseCase(lancamentoRepo);
    this.atualizarUseCase = new AtualizarLancamentoUseCase(lancamentoRepo);
    this.deletarUseCase = new DeletarLancamentoUseCase(lancamentoRepo);
    this.pagarUseCase = new PagarLancamentoUseCase(lancamentoRepo, historicoPagamentoRepo);
    this.listarPorClienteUseCase = new ListarLancamentosPorClienteUseCase(lancamentoRepo);
    this.baixarUseCase = new BaixarLancamentoUseCase(lancamentoRepo);
    
    // Repositório para histórico
    this.historicoPagamentoRepo = historicoPagamentoRepo;

    // Binds
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.pay = this.pay.bind(this);
    this.getByCliente = this.getByCliente.bind(this);
    this.getHistoricoPagamentos = this.getHistoricoPagamentos.bind(this);
    this.baixar = this.baixar.bind(this);
  }

  async create(req, res) {
    try {
      const lancamento = await this.criarUseCase.execute(req.body);
      res.status(201).json(lancamento);
    } catch (error) { res.status(400).json({ error: error.message }); }
  }

  async getAll(req, res) {
    try {
      const lancamentos = await this.listarUseCase.execute(req.query);
      res.status(200).json(lancamentos);
    } catch (error) { res.status(500).json({ error: error.message }); }
  }

  async getById(req, res) {
    try {
      const lancamento = await this.buscarPorIdUseCase.execute(Number(req.params.id));
      res.status(200).json(lancamento);
    } catch (error) { res.status(404).json({ error: error.message }); }
  }

  async update(req, res) {
    try {
      const lancamento = await this.atualizarUseCase.execute(Number(req.params.id), req.body);
      res.status(200).json(lancamento);
    } catch (error) { res.status(400).json({ error: error.message }); }
  }

  async delete(req, res) {
    try {
      await this.deletarUseCase.execute(Number(req.params.id));
      res.status(204).send();
    } catch (error) { res.status(400).json({ error: error.message }); }
  }

  /**
   * PATCH /financeiro/:id/pagar
   * Registra pagamento (parcial ou total)
   * Body: { valorPago?, formaPagamento?, observacao? }
   */
  async pay(req, res) {
    try {
      const resultado = await this.pagarUseCase.execute(Number(req.params.id), req.body);
      res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
  }

  // Buscar lançamentos por cliente
  async getByCliente(req, res) {
    try {
      const { clienteId } = req.params;
      const lancamentos = await this.listarPorClienteUseCase.execute(Number(clienteId));
      res.status(200).json(lancamentos);
    } catch (error) { res.status(500).json({ error: error.message }); }
  }

  /**
   * GET /financeiro/lancamentos/:id/historico
   * Retorna histórico de pagamentos de um lançamento
   */
  async getHistoricoPagamentos(req, res) {
    try {
      const { id } = req.params;
      const historico = await this.historicoPagamentoRepo.buscarPorLancamentoId(Number(id));
      res.status(200).json(historico);
    } catch (error) { res.status(500).json({ error: error.message }); }
  }

  /**
   * POST /financeiro/:id/baixar
   * Registra baixa de fiado (recebimento)
   * Body: { metodoPagamento: "PIX" | "Dinheiro" | "Cartão" }
   */
  async baixar(req, res) {
    try {
      const { id } = req.params;
      const { metodoPagamento } = req.body;
      const lancamento = await this.baixarUseCase.execute(Number(id), metodoPagamento);
      res.status(200).json(lancamento);
    } catch (error) { res.status(400).json({ error: error.message }); }
  }
}

module.exports = FinanceiroController;
