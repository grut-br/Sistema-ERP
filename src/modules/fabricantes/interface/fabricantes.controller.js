const FabricanteSequelizeRepository = require('../infrastructure/persistence/FabricanteSequelize.repository');
const CriarFabricanteUseCase = require('../application/criarFabricante.usecase');
const BuscarTodosFabricantesUseCase = require('../application/buscarTodosFabricantes.usecase');

class FabricanteController {
  constructor() {
    const repo = new FabricanteSequelizeRepository();
    this.criarUseCase = new CriarFabricanteUseCase(repo);
    this.buscarTodosUseCase = new BuscarTodosFabricantesUseCase(repo);
    
    // Bind methods to ensure 'this' context
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
  }

  async create(req, res) {
    try {
      const fabricante = await this.criarUseCase.execute(req.body);
      res.status(201).json(fabricante);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const fabricantes = await this.buscarTodosUseCase.execute();
      res.status(200).json(fabricantes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = FabricanteController;
