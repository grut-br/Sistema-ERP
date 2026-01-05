const IProdutoRepository = require('../../domain/repositories/IProdutoRepository');
const ProdutoModel = require('./produto.model');
const Produto = require('../../domain/entities/produto.entity');
const CategoriaModel = require('../../../categorias/infrastructure/persistence/categoria.model');
const FabricanteModel = require('../../../fabricantes/infrastructure/persistence/fabricante.model');
const LoteModel = require('./lote.model');
const Lote = require('../../domain/entities/lote.entity');

const ComposicaoKitModel = require('./composicaoKit.model');

const { Op } = require('sequelize');

const LoteMapper = {
  toDomain: (model) => model ? new Lote(model.toJSON()) : null,
};

const ProdutoMapper = {
  toDomain(model) {
    if (!model) return null;
    return new Produto({
      id: model.id,
      nome: model.nome,
      descricao: model.descricao,
      id_categoria: model.idCategoria,
      categoria: model.categoria,
      id_fabricante: model.idFabricante,
      fabricante: model.fabricante, // Objeto fabricante
      precoVenda: model.precoVenda,
      lotes: model.lotes ? model.lotes.map(LoteMapper.toDomain) : [],
      codigoBarras: model.codigoBarras,
      urlImagem: model.urlImagem,
      eKit: model.eKit,
      status: model.status,
      estoqueMinimo: model.estoqueMinimo,
    });
  },
  toPersistence(entity) {
    return {
      idCategoria: (entity.idCategoria !== undefined) ? entity.idCategoria : entity.id_categoria,
      idFabricante: (entity.idFabricante !== undefined) ? entity.idFabricante : entity.id_fabricante,
      nome: entity.nome,
      descricao: entity.descricao,
      precoCusto: entity.precoCusto,
      precoVenda: entity.precoVenda,
      quantidadeEstoque: entity.quantidadeEstoque,
      validade: entity.dataValidade,
      codigoBarras: entity.codigoBarras,
      urlImagem: entity.urlImagem,
      eKit: entity.eKit,
      status: entity.status,
      estoqueMinimo: entity.estoqueMinimo,

      lotes: entity.lotes ? entity.lotes.map(l => l.toJSON ? l.toJSON() : l) : [],
    };
  }
};

class ProdutoSequelizeRepository extends IProdutoRepository {
  async salvar(produto) {
    const data = ProdutoMapper.toPersistence(produto);
    const novoProdutoModel = await ProdutoModel.create(data);
    return this.buscarPorId(novoProdutoModel.id); // Busca com include para retornar o objeto completo
  }

  async buscarPorId(id) {
    const produtoModel = await ProdutoModel.findByPk(id, {
      include: [
        { model: CategoriaModel, as: 'categoria' },
        { model: FabricanteModel, as: 'fabricante' },
        // Inclui TODOS os lotes (inclusive negativos) para calcular estoque real
        { model: LoteModel, as: 'lotes', required: false }
      ]
    });
    
    if (!produtoModel) return null;

    const estoqueTotal = produtoModel.lotes ? produtoModel.lotes.reduce((soma, lote) => soma + lote.quantidade, 0) : 0;
    const produto = ProdutoMapper.toDomain(produtoModel);
    produto.estoque = estoqueTotal; 

    return produto;  }

  async listarTodos() {
    const produtosModel = await ProdutoModel.findAll({
      include: [
        { model: CategoriaModel, as: 'categoria' },
        { model: FabricanteModel, as: 'fabricante' },
        // Inclui TODOS os lotes (inclusive negativos) para calcular estoque real
        { model: LoteModel, as: 'lotes', required: false }
      ],
      order: [['nome', 'ASC']]
    });

    // Para cada produto, calculamos o estoque total
    const produtos = produtosModel.map(model => {
      const estoqueTotal = model.lotes ? model.lotes.reduce((soma, lote) => soma + lote.quantidade, 0) : 0;
      
      const produto = ProdutoMapper.toDomain(model);
      produto.estoque = estoqueTotal;
      return produto;
    });

    return produtos;
  }

  async atualizar(produto) {
    const data = ProdutoMapper.toPersistence(produto);
    await ProdutoModel.update(data, {
      where: { id: produto.id }
    });
    return this.buscarPorId(produto.id);
  }

  async deletar(id) {
    const produtoModel = await ProdutoModel.findByPk(id);
    if (!produtoModel) {
      throw new Error('Produto não encontrado.');
    }
    await produtoModel.destroy();
  }

  async buscarLotesProximosDoVencimento(dias, options = {}) {
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + dias);

    const lotesModel = await LoteModel.findAll({
      where: {
        quantidade: { [Op.gt]: 0 }, // Apenas lotes com estoque
        validade: {
          [Op.between]: [hoje, dataLimite] // Que vencem entre hoje e a data limite
        }
      },
      include: [
        { model: ProdutoModel } // Inclui o nome do produto
      ],
      order: [['validade', 'ASC']],
      ...options
    });

    // Precisamos do nome do produto, então vamos mapear para um formato útil
    return lotesModel.map(lote => ({
      ...LoteMapper.toDomain(lote),
      produtoNome: lote.Produto ? lote.Produto.nome : 'Produto Desconhecido'
    }));
  }

  async buscarLotesDisponiveisPorProduto(idProduto, options = {}) {
    const lotesModel = await LoteModel.findAll({
      where: {
        idProduto: idProduto,
        quantidade: { [Op.gt]: 0 } // Op.gt = "Greater Than" (Maior que) 0
      },
      order: [['validade', 'ASC']], // <-- A MÁGICA DO FEFO ACONTECE AQUI
      ...options // Para passar a transação
    });
    return lotesModel.map(LoteMapper.toDomain);
  }

  async buscarComponentesDoKit(idKit, options = {}) {
    const componentes = await ComposicaoKitModel.findAll({
      where: { idProdutoPai: idKit },
      include: [{ model: ProdutoModel, as: 'produtoFilho' }],
      ...options
    });
    // Retorna uma lista simples: [{ idProduto: 1, quantidade: 2 }, ...]
    return componentes.map(c => ({
      idProduto: c.idProdutoFilho,
      quantidadeNecessaria: c.quantidade,
      produto: c.produtoFilho // Dados do produto filho
    }));
  }
}

module.exports = ProdutoSequelizeRepository;