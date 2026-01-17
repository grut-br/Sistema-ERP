const IProdutoRepository = require('../../domain/repositories/IProdutoRepository');
const sequelize = require('../../../../shared/infra/database');
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
      // precoCusto field removed to avoid DB consistency issues; calculated in Entity
      lotes: model.lotes ? model.lotes.map(LoteMapper.toDomain) : [],
      codigoBarras: model.codigoBarras,
      urlImagem: model.urlImagem,
      eKit: model.eKit,
      status: model.status,
      estoqueMinimo: model.estoqueMinimo,
      componentes: model.componentes ? model.componentes.map(comp => ({
          idProdutoPai: comp.idProdutoPai,
          idProdutoFilho: comp.idProdutoFilho,
          quantidade: comp.quantidade,
          precoNoCombo: comp.precoNoCombo,
          produto: comp.produtoFilho ? (() => {
              // Calculate weighted average cost from lotes
              const lotes = comp.produtoFilho.lotes || [];
              const totalQtd = lotes.reduce((acc, l) => acc + Number(l.quantidade), 0);
              const totalValor = lotes.reduce((acc, l) => acc + (Number(l.quantidade) * Number(l.custoUnitario || 0)), 0);
              const precoCustoMedio = totalQtd > 0 ? (totalValor / totalQtd) : 0;
              
              return {
                  id: comp.produtoFilho.id,
                  nome: comp.produtoFilho.nome,
                  precoVenda: comp.produtoFilho.precoVenda,
                  precoCusto: precoCustoMedio,
                  urlImagem: comp.produtoFilho.urlImagem,
                  estoque: totalQtd
              };
          })() : null
      })) : []
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
    
    // Start Transaction
    const t = await sequelize.transaction();

    try {
        const novoProdutoModel = await ProdutoModel.create(data, { transaction: t });

        // Se for KIT e tiver composição, salva os componentes
        if (produto.eKit && produto.composicao && produto.composicao.length > 0) {
            const composicaoData = produto.composicao.map(item => ({
                idProdutoPai: novoProdutoModel.id,
                idProdutoFilho: item.idProdutoFilho, 
                quantidade: item.quantidade,
                precoNoCombo: item.precoNoCombo || 0
            }));
            await ComposicaoKitModel.bulkCreate(composicaoData, { transaction: t });
        }

        await t.commit();
        return this.buscarPorId(novoProdutoModel.id);
    } catch (e) {
        await t.rollback();
        throw e;
    }
  }

  async buscarPorId(id) {
    const produtoModel = await ProdutoModel.findByPk(id, {
      include: [
        { model: CategoriaModel, as: 'categoria' },
        { model: FabricanteModel, as: 'fabricante' },
        // Inclui TODOS os lotes (inclusive negativos) para calcular estoque real
        { model: LoteModel, as: 'lotes', required: false },
        { 
            model: ComposicaoKitModel, 
            as: 'componentes',
            include: [{ 
                model: ProdutoModel, 
                as: 'produtoFilho', 
                include: [{ model: LoteModel, as: 'lotes', required: false }] 
            }] 
        }
      ]
    });
    
    if (!produtoModel) return null;

    const produto = ProdutoMapper.toDomain(produtoModel);

    if (produto.eKit && produtoModel.componentes && produtoModel.componentes.length > 0) {
         // CÁLCULO DE ESTOQUE VIRTUAL
         // Para cada componente, calcula estoque total e divide pela qtd necessária
         const limites = produtoModel.componentes.map(comp => {
             const produtoFilho = comp.produtoFilho;
             const estoqueFilho = produtoFilho && produtoFilho.lotes 
                ? produtoFilho.lotes.reduce((sum, l) => sum + l.quantidade, 0)
                : 0;
             return Math.floor(estoqueFilho / comp.quantidade); 
         });
         // O estoque do kit é o menor limitante (Gargalo)
         produto.estoque = Math.min(...limites);
    } else {
         const estoqueTotal = produtoModel.lotes ? produtoModel.lotes.reduce((soma, lote) => soma + lote.quantidade, 0) : 0;
         produto.estoque = estoqueTotal;
    }

    return produto;  
  }

  async listarTodos(filters = {}) {
    const where = {};
    if (filters.status) {
      where.status = filters.status;
    }

    const produtosModel = await ProdutoModel.findAll({
      where,
      include: [
        { model: CategoriaModel, as: 'categoria' },
        { model: FabricanteModel, as: 'fabricante' },
        // Inclui TODOS os lotes (inclusive negativos) para calcular estoque real
        { model: LoteModel, as: 'lotes', required: false },
        // Necessário incluir componentes -> produtoFilho -> lotes para calcular estoque virtual
        { 
            model: ComposicaoKitModel, 
            as: 'componentes',
            include: [{ 
                model: ProdutoModel, 
                as: 'produtoFilho', 
                include: [{ model: LoteModel, as: 'lotes', required: false }] 
            }] 
        }
      ],
      order: [['nome', 'ASC']]
    });

    const produtos = produtosModel.map(model => {
      const produto = ProdutoMapper.toDomain(model);

      if (model.eKit && model.componentes && model.componentes.length > 0) {
         // Lógica de Estoque Virtual (Mesma do buscarPorId)
         const limites = model.componentes.map(comp => {
             const produtoFilho = comp.produtoFilho;
             const estoqueFilho = produtoFilho && produtoFilho.lotes 
                ? produtoFilho.lotes.reduce((sum, l) => sum + l.quantidade, 0)
                : 0;
            return Math.floor(estoqueFilho / comp.quantidade);
         });
         produto.estoque = Math.min(...limites);
      } else {
         const estoqueTotal = model.lotes ? model.lotes.reduce((soma, lote) => soma + lote.quantidade, 0) : 0;
         produto.estoque = estoqueTotal;
      }
      return produto;
    });

    return produtos;
  }

  async atualizar(produto) {
    const data = ProdutoMapper.toPersistence(produto);
    
    // Start Transaction for atomic update
    const t = await sequelize.transaction();
    
    try {
        await ProdutoModel.update(data, {
          where: { id: produto.id },
          transaction: t
        });

        // Se for KIT, atualiza a composição
        if (produto.eKit && produto.composicao) {
            // Deleta composição antiga
            await ComposicaoKitModel.destroy({
                where: { idProdutoPai: produto.id },
                transaction: t
            });
            
            // Insere nova composição (se houver)
            if (produto.composicao.length > 0) {
                const composicaoData = produto.composicao.map(item => ({
                    idProdutoPai: produto.id,
                    idProdutoFilho: item.idProdutoFilho, 
                    quantidade: item.quantidade,
                    precoNoCombo: item.precoNoCombo || 0
                }));
                await ComposicaoKitModel.bulkCreate(composicaoData, { transaction: t });
            }
        }

        await t.commit();
        return this.buscarPorId(produto.id);
    } catch (e) {
        await t.rollback();
        throw e;
    }
  }

  async deletar(id) {
    const produtoModel = await ProdutoModel.findByPk(id);
    if (!produtoModel) {
      throw new Error('Produto não encontrado.');
    }
    try {
      await produtoModel.destroy();
    } catch (error) {
      // Se houver erro de chave estrangeira (vínculos com vendas/compras), inativa o produto
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        await produtoModel.update({ status: 'INATIVO' });
      } else {
        throw error;
      }
    }
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