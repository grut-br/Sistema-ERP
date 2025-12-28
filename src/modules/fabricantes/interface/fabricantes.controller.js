const FabricanteSequelizeRepository = require('../infrastructure/persistence/FabricanteSequelize.repository');
const CriarFabricanteUseCase = require('../application/criarFabricante.usecase');

const BuscarTodosFabricantesUseCase = require('../application/buscarTodosFabricantes.usecase');
const AtualizarFabricanteUseCase = require('../application/atualizarFabricante.usecase');
const DeletarFabricanteUseCase = require('../application/deletarFabricante.usecase');

class FabricanteController {
  constructor() {
    const repo = new FabricanteSequelizeRepository();
    this.criarUseCase = new CriarFabricanteUseCase(repo);
    this.buscarTodosUseCase = new BuscarTodosFabricantesUseCase(repo);
    this.atualizarUseCase = new AtualizarFabricanteUseCase(repo);
    this.deletarUseCase = new DeletarFabricanteUseCase(repo);
    
    // Bind methods to ensure 'this' context
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
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

  async update(req, res) {
    try {
      const fabricante = await this.atualizarUseCase.execute(Number(req.params.id), req.body);
      res.status(200).json(fabricante);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      await this.deletarUseCase.execute(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      // Check for foreign key constraint error
      if (error.name === 'SequelizeForeignKeyConstraintError') {
         return res.status(409).json({ error: 'Não é possível excluir este fabricante pois ele possui produtos associados.' });
      }
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = FabricanteController;
