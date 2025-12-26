const FornecedorSequelizeRepository = require('../infrastructure/persistence/FornecedorSequelize.repository');
const CriarFornecedorUseCase = require('../application/criarFornecedor.usecase');
const BuscarTodosFornecedoresUseCase = require('../application/buscarTodosFornecedores.usecase');
const BuscarFornecedorPorIdUseCase = require('../application/buscarFornecedorPorId.usecase');
const AtualizarFornecedorUseCase = require('../application/atualizarFornecedor.usecase');
const DeletarFornecedorUseCase = require('../application/deletarFornecedor.usecase');

class FornecedorController {
  constructor() {
    const repo = new FornecedorSequelizeRepository();
    this.criarUseCase = new CriarFornecedorUseCase(repo);
    this.buscarTodosUseCase = new BuscarTodosFornecedoresUseCase(repo);
    this.buscarPorIdUseCase = new BuscarFornecedorPorIdUseCase(repo);
    this.atualizarUseCase = new AtualizarFornecedorUseCase(repo);
    this.deletarUseCase = new DeletarFornecedorUseCase(repo);

    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(req, res) {
    try {
      const fornecedor = await this.criarUseCase.execute(req.body);
      res.status(201).json(fornecedor);
    } catch (error) { res.status(400).json({ error: error.message }); }
  }
  async getAll(req, res) {
    try {
      const fornecedores = await this.buscarTodosUseCase.execute();
      res.status(200).json(fornecedores);
    } catch (error) { res.status(500).json({ error: error.message }); }
  }
  async getById(req, res) {
    try {
      const fornecedor = await this.buscarPorIdUseCase.execute(Number(req.params.id));
      res.status(200).json(fornecedor);
    } catch (error) { res.status(404).json({ error: error.message }); }
  }
  async update(req, res) {
    try {
      const fornecedor = await this.atualizarUseCase.execute(Number(req.params.id), req.body);
      res.status(200).json(fornecedor);
    } catch (error) { res.status(400).json({ error: error.message }); }
  }
  async delete(req, res) {
    try {
      await this.deletarUseCase.execute(Number(req.params.id));
      res.status(204).send();
    } catch (error) { res.status(400).json({ error: error.message }); }
  }
}
module.exports = FornecedorController;