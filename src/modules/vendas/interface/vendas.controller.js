const VendaSequelizeRepository = require('../infrastructure/persistence/VendaSequelize.repository');
const ProdutoSequelizeRepository = require('../../produtos/infrastructure/persistence/ProdutoSequelize.repository');
const RegistrarVendaUseCase = require('../application/registrarVenda.usecase');
const BuscarVendaPorIdUseCase = require('../application/buscarVendaPorId.usecase');
const ListarVendasUseCase = require('../application/listarVendas.usecase');
const CancelarVendaUseCase = require('../application/cancelarVenda.usecase');

class VendaController {
  constructor() {
    const vendaRepo = new VendaSequelizeRepository();
    const produtoRepo = new ProdutoSequelizeRepository();
    this.registrarVendaUseCase = new RegistrarVendaUseCase(vendaRepo, produtoRepo, null);
    this.buscarVendaPorIdUseCase = new BuscarVendaPorIdUseCase(vendaRepo);
    this.listarVendasUseCase = new ListarVendasUseCase(vendaRepo);
    this.cancelarVendaUseCase = new CancelarVendaUseCase(vendaRepo, produtoRepo);
    
    vendaRepo.produtoRepository = produtoRepo;

    this.create = this.create.bind(this);
    this.getById = this.getById.bind(this);
    this.getAll = this.getAll.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  async create(req, res) {
    try {
      // 1. Pega o usuário que o middleware de autenticação identificou
      const usuarioLogado = req.usuario;
      
      // Dica de Debug: Se continuar vindo null, descomente a linha abaixo para ver se o middleware está funcionando
      console.log('USUARIO LOGADO:', usuarioLogado);

      const dadosVenda = {
        ...req.body, 
        idCliente: req.body.clienteId,
        idUsuario: usuarioLogado ? usuarioLogado.id : null
      };

      // 3. Envia o objeto completo para o caso de uso
      const venda = await this.registrarVendaUseCase.execute(dadosVenda);
      
      res.status(201).json(venda);
    } catch (error) {
       console.error('ERRO AO CRIAR VENDA:', error); // Melhorar log para debug
       
       // Se for erro de caixa fechado, mantém 400 (Bad Request)
       // O Frontend espera { error: "mensagem" }
       res.status(400).json({ error: error.message });
    }
  }
  
  async getById(req, res) {
    try {
      const { id } = req.params;
      const venda = await this.buscarVendaPorIdUseCase.execute(Number(id));
      res.status(200).json(venda);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

    async getAll(req, res) {
    try {
      const { dataInicio, dataFim, status, clienteNome, searchId } = req.query;
      
      const filtros = {
        dataInicio,
        dataFim,
        status,
        clienteNome,
        id: searchId // Mapeia searchId para id no filtro
      };

      const vendas = await this.listarVendasUseCase.execute(filtros);
      res.status(200).json(vendas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async cancel(req, res) {
    try {
      const { id } = req.params;
      await this.cancelarVendaUseCase.execute(Number(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
module.exports = VendaController;