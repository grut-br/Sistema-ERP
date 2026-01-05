const ClienteSequelizeRepository = require('../infrastructure/persistence/ClienteSequelize.repository');
const EnderecoSequelizeRepository = require('../../enderecos/infrastructure/persistence/EnderecoSequelize.repository');

// Importa todos os casos de uso CRUD
const CriarClienteUseCase = require('../application/criarCliente.usecase');
const BuscarClientePorIdUseCase = require('../application/buscarClientePorId.usecase');
const ListarClientesUseCase = require('../application/listarClientes.usecase');
const AtualizarClienteUseCase = require('../application/atualizarCliente.usecase');
const DeletarClienteUseCase = require('../application/deletarCliente.usecase');
const ObterInfoFinanceiraUseCase = require('../application/obterInfoFinanceira.usecase');
const BuscarHistoricoComprasUseCase = require('../application/buscarHistoricoCompras.usecase');

const FidelizacaoSequelizeRepository = require('../../fidelizacao/infrastructure/persistence/FidelizacaoSequelize.repository');
const CreditoClienteSequelizeRepository = require('../../financeiro/infrastructure/persistence/CreditoClienteSequelize.repository');
const VendaSequelizeRepository = require('../../vendas/infrastructure/persistence/VendaSequelize.repository');

class ClienteController {
  constructor() {
    const repository = new ClienteSequelizeRepository();
    this.enderecoRepository = new EnderecoSequelizeRepository();
    
    // Instancia cada caso de uso
    this.criarClienteUseCase = new CriarClienteUseCase(repository);
    this.buscarClientePorIdUseCase = new BuscarClientePorIdUseCase(repository);
    this.listarClientesUseCase = new ListarClientesUseCase(repository);
    this.atualizarClienteUseCase = new AtualizarClienteUseCase(repository);
    this.deletarClienteUseCase = new DeletarClienteUseCase(repository);
    
    // Dependencies for Financial Info
    const fidelizacaoRepo = new FidelizacaoSequelizeRepository();
    const creditoRepo = new CreditoClienteSequelizeRepository();
    this.obterInfoFinanceiraUseCase = new ObterInfoFinanceiraUseCase(repository, fidelizacaoRepo, creditoRepo);

    // Dependencies for Purchase History
    const vendaRepo = new VendaSequelizeRepository();
    this.buscarHistoricoComprasUseCase = new BuscarHistoricoComprasUseCase(vendaRepo);

    // Bind dos métodos
    this.create = this.create.bind(this);
    this.getById = this.getById.bind(this);
    this.getFinancialInfo = this.getFinancialInfo.bind(this);
    this.getHistoricoCompras = this.getHistoricoCompras.bind(this);
    this.getAll = this.getAll.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    // Endereços
    this.getEnderecos = this.getEnderecos.bind(this);
    this.addEndereco = this.addEndereco.bind(this);
    this.deleteEndereco = this.deleteEndereco.bind(this);
  }

  /**
   * POST /api/clientes
   * Cria cliente com endereço opcional
   */
  async create(req, res) {
    try {
      const { endereco, ...dadosCliente } = req.body;
      
      // Se tem endereço, envia como array
      const enderecos = endereco ? [endereco] : [];
      
      const clienteSalvo = await this.criarClienteUseCase.execute(dadosCliente, enderecos);
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

  /**
   * GET /api/clientes
   * Query params: search, inadimplente, comCredito, aniversariantes
   */
  async getAll(req, res) {
    try {
      const filtros = {
        search: req.query.search || '',
        inadimplente: req.query.inadimplente,
        comCredito: req.query.comCredito,
        aniversariantes: req.query.aniversariantes
      };
      
      const clientes = await this.listarClientesUseCase.execute(filtros);
      res.status(200).json(clientes);
    } catch (error) { 
      console.error('Error in getAll:', error);
      res.status(500).json({ error: error.message }); 
    }
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
    } catch (error) { 
      res.status(400).json({ error: error.message }); 
    }
  }

  async getFinancialInfo(req, res) {
      try {
          const { id } = req.params;
          const info = await this.obterInfoFinanceiraUseCase.execute(Number(id));
          res.status(200).json(info);
      } catch (error) {
          res.status(404).json({ error: error.message });
      }
  }

  /**
   * GET /api/clientes/:id/historico-compras
   */
  async getHistoricoCompras(req, res) {
      try {
          const { id } = req.params;
          const limite = parseInt(req.query.limite) || 5;
          const historico = await this.buscarHistoricoComprasUseCase.execute(Number(id), limite);
          res.status(200).json(historico);
      } catch (error) {
          res.status(404).json({ error: error.message });
      }
  }

  /**
   * GET /api/clientes/:id/enderecos
   * Lista endereços de um cliente
   */
  async getEnderecos(req, res) {
      try {
          const { id } = req.params;
          const enderecos = await this.enderecoRepository.buscarPorClienteId(Number(id));
          res.status(200).json(enderecos);
      } catch (error) {
          res.status(500).json({ error: error.message });
      }
  }

  /**
   * POST /api/clientes/:id/enderecos
   * Adiciona novo endereço a um cliente
   */
  async addEndereco(req, res) {
      try {
          const { id } = req.params;
          const enderecoData = { ...req.body, idCliente: Number(id) };
          const endereco = await this.enderecoRepository.salvar(enderecoData);
          res.status(201).json(endereco);
      } catch (error) {
          res.status(400).json({ error: error.message });
      }
  }

  /**
   * DELETE /api/clientes/:clienteId/enderecos/:enderecoId
   * Remove um endereço
   */
  async deleteEndereco(req, res) {
      try {
          const { enderecoId } = req.params;
          await this.enderecoRepository.deletar(Number(enderecoId));
          res.status(204).send();
      } catch (error) {
          res.status(400).json({ error: error.message });
      }
  }
}

module.exports = ClienteController;