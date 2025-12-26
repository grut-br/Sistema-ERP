const CategoriaSequelizeRepository = require('../infrastructure/persistence/CategoriaSequelize.repository');
const CriarCategoriaUseCase = require('../application/criarCategoria.usecase');
const BuscarTodasCategoriasUseCase = require('../application/buscarTodasCategorias.usecase');
const AtualizarCategoriaUseCase = require('../application/atualizarCategoria.usecase');
const DeletarCategoriaUseCase = require('../application/deletarCategoria.usecase');

class CategoriaController {
  constructor() {
    const repo = new CategoriaSequelizeRepository();
    this.criarUseCase = new CriarCategoriaUseCase(repo);
    this.buscarTodasUseCase = new BuscarTodasCategoriasUseCase(repo);
    this.atualizarUseCase = new AtualizarCategoriaUseCase(repo);
    this.deletarUseCase = new DeletarCategoriaUseCase(repo);

    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(req, res) {
    try {
      const novaCategoria = await this.criarUseCase.execute(req.body);
      res.status(201).json(novaCategoria);
    } catch (error) { res.status(400).json({ error: error.message }); }
  }
  async getAll(req, res) {
    try {
      const categorias = await this.buscarTodasUseCase.execute();
      res.status(200).json(categorias);
    } catch (error) { res.status(500).json({ error: error.message }); }
  }
  async update(req, res) {
    try {
      const categoria = await this.atualizarUseCase.execute(Number(req.params.id), req.body);
      res.status(200).json(categoria);
    } catch (error) { res.status(400).json({ error: error.message }); }
  }
  async delete(req, res) {
    try {
      await this.deletarUseCase.execute(Number(req.params.id));
      res.status(204).send();
    } catch (error) { res.status(400).json({ error: error.message }); }
  }
}
module.exports = CategoriaController;