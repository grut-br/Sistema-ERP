const CategoriaFinanceiraSequelizeRepository = require('../infrastructure/persistence/CategoriaFinanceiraSequelize.repository');

const CriarCategoriaUseCase = require('../application/criarCategoria.usecase');
const ListarCategoriasUseCase = require('../application/listarCategorias.usecase');
const BuscarCategoriaPorIdUseCase = require('../application/buscarCategoriaPorId.usecase');
const AtualizarCategoriaUseCase = require('../application/atualizarCategoria.usecase');
const DeletarCategoriaUseCase = require('../application/deletarCategoria.usecase');

class CategoriasController {
  constructor() {
    const repo = new CategoriaFinanceiraSequelizeRepository();

    this.criarUseCase = new CriarCategoriaUseCase(repo);
    this.listarUseCase = new ListarCategoriasUseCase(repo);
    this.buscarPorIdUseCase = new BuscarCategoriaPorIdUseCase(repo);
    this.atualizarUseCase = new AtualizarCategoriaUseCase(repo);
    this.deletarUseCase = new DeletarCategoriaUseCase(repo);

    // Binds
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(req, res) {
    try {
      const categoria = await this.criarUseCase.execute(req.body);
      res.status(201).json(categoria);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { tipo } = req.query;
      const categorias = await this.listarUseCase.execute({ tipo });
      res.status(200).json(categorias);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const categoria = await this.buscarPorIdUseCase.execute(Number(req.params.id));
      res.status(200).json(categoria);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const categoria = await this.atualizarUseCase.execute(Number(req.params.id), req.body);
      res.status(200).json(categoria);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      await this.deletarUseCase.execute(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = CategoriasController;
