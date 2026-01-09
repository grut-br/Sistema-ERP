const sequelize = require('../../../shared/infra/database');
const LoteModel = require('../../produtos/infrastructure/persistence/lote.model');
const ProdutoModel = require('../../produtos/infrastructure/persistence/produto.model');
const LancamentoModel = require('../../financeiro/infrastructure/persistence/lancamento.model');
const CompraModel = require('../infrastructure/persistence/compra.model');

class ExcluirCompraUseCase {
  constructor(compraRepository) {
    this.compraRepository = compraRepository;
  }

  async execute(idCompra) {
    if (!idCompra) {
      throw new Error('ID da compra é obrigatório.');
    }

    // 1. Busca a compra com seus itens (lotes)
    const compra = await this.compraRepository.buscarPorId(idCompra);
    if (!compra) {
      throw new Error('Compra não encontrada.');
    }

    // 2. Valida se o estoque permite exclusão
    // Para cada item da compra, verifica se o estoque atual >= quantidade que entrou
    const lotes = await LoteModel.findAll({
      where: { idCompra: idCompra }
    });

    for (const lote of lotes) {
      const produto = await ProdutoModel.findByPk(lote.idProduto);
      if (!produto) continue;

      const estoqueAtual = Number(produto.estoque || 0);
      const qtdEntrada = Number(lote.quantidade || 0);

      if (estoqueAtual < qtdEntrada) {
        throw new Error(
          `Não é possível estornar. Parte dos produtos desta nota já foi vendida. ` +
          `Produto "${produto.nome}" tem estoque atual de ${estoqueAtual}, mas a entrada foi de ${qtdEntrada}.`
        );
      }
    }

    // 3. Inicia transação para garantir atomicidade
    const t = await sequelize.transaction();

    try {
      // 4. Reverte o estoque de cada produto
      for (const lote of lotes) {
        const produto = await ProdutoModel.findByPk(lote.idProduto, { transaction: t });
        if (produto) {
          const novoEstoque = Number(produto.estoque || 0) - Number(lote.quantidade || 0);
          await produto.update({ estoque: Math.max(0, novoEstoque) }, { transaction: t });
        }
      }

      // 5. Remove os lotes vinculados à compra
      await LoteModel.destroy({
        where: { idCompra: idCompra },
        transaction: t
      });

      // 6. Marca os lançamentos como CANCELADO
      await LancamentoModel.update(
        { status: 'CANCELADO' },
        { 
          where: { idCompra: idCompra },
          transaction: t 
        }
      );

      // 7. Remove o registro da compra
      await CompraModel.destroy({
        where: { id: idCompra },
        transaction: t
      });

      await t.commit();
      
      return { success: true, message: 'Compra estornada com sucesso.' };
    } catch (error) {
      await t.rollback();
      throw new Error(`Erro ao estornar compra: ${error.message}`);
    }
  }
}

module.exports = ExcluirCompraUseCase;
