// Casos de uso de negócio
const AtualizarEstoqueUseCase = require('../application/atualizarEstoque.usecase');
const VerificarValidadeProdutosUseCase = require('../application/verificarValidadeProdutos.usecase');

// Casos de uso CRUD
const CriarProdutoUseCase = require('../application/criarProduto.usecase');
const AtualizarProdutoUseCase = require('../application/atualizarProduto.usecase');
const DeletarProdutoUseCase = require('../application/deletarProduto.usecase');
const BuscarProdutoPorIdUseCase = require('../application/buscarProdutoPorId.usecase');
const BuscarTodosProdutosUseCase = require('../application/buscarTodosProdutos.usecase');

// Infraestrutura
const ProdutoSequelizeRepository = require('../infrastructure/persistence/ProdutoSequelize.repository');

class ProdutoController {
  constructor() {
    const repository = new ProdutoSequelizeRepository();
    
    // Instancia todos os casos de uso
    this.criarProdutoUseCase = new CriarProdutoUseCase(repository);
    this.buscarProdutoPorIdUseCase = new BuscarProdutoPorIdUseCase(repository);
    this.buscarTodosProdutosUseCase = new BuscarTodosProdutosUseCase(repository);
    this.atualizarProdutoUseCase = new AtualizarProdutoUseCase(repository);
    this.deletarProdutoUseCase = new DeletarProdutoUseCase(repository);
    this.atualizarEstoqueUseCase = new AtualizarEstoqueUseCase(repository);

    // Bind dos métodos
    this.create = this.create.bind(this);
    this.getById = this.getById.bind(this);
    this.getAll = this.getAll.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.updateStock = this.updateStock.bind(this);
  }

  //criar produto
  async create(req, res) {
    console.log('DADOS RECEBIDOS NO CONTROLLER:', req.body); // Deixei o log para depuração
    try {
      const produtoCriado = await this.criarProdutoUseCase.execute(req.body);
      return res.status(201).json(produtoCriado);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }
  }

  //buscar por id
  async getById(req, res) {
    try {
      const { id } = req.params; // Pega o ID dos parâmetros da URL
      const produto = await this.buscarProdutoPorIdUseCase.execute(id);
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }
      return res.status(200).json(produto);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  //buscar todos
  async getAll(req, res) {
    try {
      const produtos = await this.buscarTodosProdutosUseCase.execute();
      return res.status(200).json(produtos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  //atualizar estoque
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantidade } = req.body; // quantidade pode ser positiva ou negativa

      if (typeof quantidade !== 'number') {
        return res.status(400).json({ error: 'A quantidade deve ser um número.' });
      }

      const produtoAtualizado = await this.atualizarEstoqueUseCase.execute({ 
        produtoId: Number(id), 
        quantidade 
      });

      return res.status(200).json(produtoAtualizado);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }
  }

  //atualizar
  async update(req, res) {
    try {
      const { id } = req.params;
      const dadosParaAtualizar = req.body;
      
      const produtoAtualizado = await this.atualizarProdutoUseCase.execute(Number(id), dadosParaAtualizar);
      
      return res.status(200).json(produtoAtualizado);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }
  }

  //deletar
  async delete(req, res) {
    try {
      const { id } = req.params;
      await this.deletarProdutoUseCase.execute(Number(id));
      
      // Retorna uma resposta de sucesso sem conteúdo
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = ProdutoController;