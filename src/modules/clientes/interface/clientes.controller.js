const ClienteSequelizeRepository = require('../infrastructure/persistence/ClienteSequelize.repository');

// Importa todos os casos de uso CRUD
const CriarClienteUseCase = require('../application/criarCliente.usecase');
const BuscarClientePorIdUseCase = require('../application/buscarClientePorId.usecase');
const BuscarTodosClientesUseCase = require('../application/buscarTodosClientes.usecase');
const AtualizarClienteUseCase = require('../application/atualizarCliente.usecase');
const DeletarClienteUseCase = require('../application/deletarCliente.usecase');

class ClienteController {
  constructor() {
    const repository = new ClienteSequelizeRepository();
    
    // Instancia cada caso de uso
    this.criarClienteUseCase = new CriarClienteUseCase(repository);
    this.buscarClientePorIdUseCase = new BuscarClientePorIdUseCase(repository);
    this.buscarTodosClientesUseCase = new BuscarTodosClientesUseCase(repository);
    this.atualizarClienteUseCase = new AtualizarClienteUseCase(repository);
    this.deletarClienteUseCase = new DeletarClienteUseCase(repository);

    // Bind dos métodos
    this.create = this.create.bind(this);
    this.getById = this.getById.bind(this);
    this.getAll = this.getAll.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(req, res) {
    try {
      console.log('ClienteController.create called with body:', req.body);
      const clienteSalvo = await this.criarClienteUseCase.execute(req.body);
      console.log('Cliente saved successfully:', clienteSalvo);
      res.status(201).json(clienteSalvo);
    } catch (error) { 
      console.error('Error in ClienteController.create:', error);
      res.status(400).json({ error: error.message }); 
    }
  }

  async getById(req, res) {
    try {
        const cliente = await this.buscarClientePorIdUseCase.execute(Number(req.params.id));
        res.status(200).json(cliente);
    } catch (error) { res.status(404).json({ error: error.message }); }
  }

  async getAll(req, res) {
    try {
      const clientes = await this.buscarTodosClientesUseCase.execute();
      res.status(200).json(clientes);
    } catch (error) { res.status(500).json({ error: error.message }); }
  }

  async update(req, res) {
    try {
      const clienteAtualizado = await this.atualizarClienteUseCase.execute(Number(req.params.id), req.body);
      res.status(200).json(clienteAtualizado);
    } catch (error) { res.status(400).json({ error: error.message }); }
  }

  async delete(req, res) {
    try {
      await this.deletarClienteUseCase.execute(Number(req.params.id));
      res.status(204).send();
    } catch (error) { res.status(400).json({ error: error.message }); }
  }
}

module.exports = ClienteController;