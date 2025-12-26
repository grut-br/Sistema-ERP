const LancamentoSequelizeRepository = require('../infrastructure/persistence/LancamentoSequelize.repository');

// Importa todos os casos de uso
const CriarLancamentoUseCase = require('../application/criarLancamento.usecase');
const ListarLancamentosUseCase = require('../application/listarLancamentos.usecase');
const BuscarLancamentoPorIdUseCase = require('../application/buscarLancamentoPorId.usecase');
const AtualizarLancamentoUseCase = require('../application/atualizarLancamento.usecase');
const DeletarLancamentoUseCase = require('../application/deletarLancamento.usecase');
const PagarLancamentoUseCase = require('../application/pagarLancamento.usecase');
const ListarLancamentosPorClienteUseCase = require('../application/listarLancamentosPorCliente.usecase');

class FinanceiroController {
  constructor() {
    const repo = new LancamentoSequelizeRepository();

    // Instancia todos os casos de uso
    this.criarUseCase = new CriarLancamentoUseCase(repo);
    this.listarUseCase = new ListarLancamentosUseCase(repo);
    this.buscarPorIdUseCase = new BuscarLancamentoPorIdUseCase(repo);
    this.atualizarUseCase = new AtualizarLancamentoUseCase(repo);
    this.deletarUseCase = new DeletarLancamentoUseCase(repo);
    this.pagarUseCase = new PagarLancamentoUseCase(repo);
    this.listarPorClienteUseCase = new ListarLancamentosPorClienteUseCase(repo);

    // Binds
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.pay = this.pay.bind(this);
    this.getByCliente = this.getByCliente.bind(this);
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

  async pay(req, res) {
    try {
      const lancamentoPago = await this.pagarUseCase.execute(Number(req.params.id));
      res.status(200).json(lancamentoPago);
    } catch (error) { res.status(400).json({ error: error.message }); }
  }

  // Novo método para buscar por cliente
  async getByCliente(req, res) {
    try {
      const { clienteId } = req.params;
      const lancamentos = await this.listarPorClienteUseCase.execute(Number(clienteId));
      res.status(200).json(lancamentos);
    } catch (error) { res.status(500).json({ error: error.message }); }
  }
}
module.exports = FinanceiroController;