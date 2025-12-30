const CompraSequelizeRepository = require('../infrastructure/persistence/compraSequelize.repository');
const ProdutoSequelizeRepository = require('../../produtos/infrastructure/persistence/ProdutoSequelize.repository');
const FornecedorSequelizeRepository = require('../../fornecedores/infrastructure/persistence/FornecedorSequelize.repository');
const RegistrarCompraUseCase = require('../application/registrarCompra.usecase');
// ... (imports existentes)
const BuscarCompraPorIdUseCase = require('../application/buscarCompraPorId.usecase');
const ListarComprasUseCase = require('../application/listarCompras.usecase');

class CompraController {
  constructor() {
    const compraRepo = new CompraSequelizeRepository();
    const produtoRepo = new ProdutoSequelizeRepository();
    const fornecedorRepo = new FornecedorSequelizeRepository();

    this.registrarCompraUseCase = new RegistrarCompraUseCase(compraRepo, produtoRepo, fornecedorRepo);
    // Instancia os novos casos de uso
    this.buscarCompraPorIdUseCase = new BuscarCompraPorIdUseCase(compraRepo);
    this.listarComprasUseCase = new ListarComprasUseCase(compraRepo);
    
    this.create = this.create.bind(this);
    // Faz o bind dos novos métodos
    this.getById = this.getById.bind(this);
    this.getAll = this.getAll.bind(this);
  }

  async create(req, res) {
    try {
      const compra = await this.registrarCompraUseCase.execute(req.body);
      res.status(201).json(compra);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  // Novo método para buscar por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const compra = await this.buscarCompraPorIdUseCase.execute(Number(id));
      res.status(200).json(compra);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Novo método para buscar todos
  async getAll(req, res) {
    try {
      const filters = {
        idFornecedor: req.query.idFornecedor,
        notaFiscal: req.query.notaFiscal, // Specific NF filter
        search: req.query.search,         // Unified Top bar search
        idProduto: req.query.idProduto,
        sort: req.query.sort,             // 'ASC' | 'DESC'
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim
      };
      const compras = await this.listarComprasUseCase.execute(filters);
      res.status(200).json(compras);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
module.exports = CompraController;