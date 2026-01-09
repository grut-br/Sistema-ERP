const CompraSequelizeRepository = require('../infrastructure/persistence/compraSequelize.repository');
const ProdutoSequelizeRepository = require('../../produtos/infrastructure/persistence/ProdutoSequelize.repository');
const FornecedorSequelizeRepository = require('../../fornecedores/infrastructure/persistence/FornecedorSequelize.repository');
const RegistrarCompraUseCase = require('../application/registrarCompra.usecase');
const BuscarCompraPorIdUseCase = require('../application/buscarCompraPorId.usecase');
const ListarComprasUseCase = require('../application/listarCompras.usecase');
const ExcluirCompraUseCase = require('../application/excluirCompra.usecase');
const EditarCompraUseCase = require('../application/editarCompra.usecase');

class CompraController {
  constructor() {
    const compraRepo = new CompraSequelizeRepository();
    const produtoRepo = new ProdutoSequelizeRepository();
    const fornecedorRepo = new FornecedorSequelizeRepository();

    this.registrarCompraUseCase = new RegistrarCompraUseCase(compraRepo, produtoRepo, fornecedorRepo);
    this.buscarCompraPorIdUseCase = new BuscarCompraPorIdUseCase(compraRepo);
    this.listarComprasUseCase = new ListarComprasUseCase(compraRepo);
    this.excluirCompraUseCase = new ExcluirCompraUseCase(compraRepo);
    this.editarCompraUseCase = new EditarCompraUseCase(compraRepo, produtoRepo, fornecedorRepo);
    
    this.create = this.create.bind(this);
    this.getById = this.getById.bind(this);
    this.getAll = this.getAll.bind(this);
    this.delete = this.delete.bind(this);
    this.update = this.update.bind(this);
  }

  async create(req, res) {
    try {
      const compra = await this.registrarCompraUseCase.execute(req.body);
      res.status(201).json(compra);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async getById(req, res) {
    try {
      const { id } = req.params;
      const compra = await this.buscarCompraPorIdUseCase.execute(Number(id));
      res.status(200).json(compra);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const filters = {
        idFornecedor: req.query.idFornecedor,
        notaFiscal: req.query.notaFiscal,
        search: req.query.search,
        idProduto: req.query.idProduto,
        sort: req.query.sort,
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim
      };
      const compras = await this.listarComprasUseCase.execute(filters);
      res.status(200).json(compras);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await this.excluirCompraUseCase.execute(Number(id));
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const compra = await this.editarCompraUseCase.execute(Number(id), req.body);
      res.status(200).json(compra);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
module.exports = CompraController;