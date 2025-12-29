const sequelize = require('../../../../shared/infra/database');
const ICompraRepository = require('../../domain/repositories/ICompraRepository');
const CompraModel = require('./compra.model');
// const ItemCompraModel = require('./itemCompra.model'); // REMOVED
const ProdutoModel = require('../../../produtos/infrastructure/persistence/produto.model');
const LoteModel = require('../../../produtos/infrastructure/persistence/lote.model');
const Lancamento = require('../../../financeiro/domain/entities/lancamento.entity');

// ... (imports existentes)
const Compra = require('../../domain/entities/compra.entity');
const ItemCompra = require('../../domain/entities/itemCompra.entity');
const FornecedorModel = require('../../../fornecedores/infrastructure/persistence/fornecedor.model');

const CompraMapper = {
  toDomain(model) {
    if (!model) return null;

    const itens = model.itens ? model.itens.map(item => new ItemCompra({
      id: item.id,
      idProduto: item.idProduto,
      quantidade: item.quantidade,
      custoUnitario: item.custoUnitario,
      validade: item.validade,
      produto: item.Produto 
    })) : [];

    return new Compra({
      id: model.id,
      idFornecedor: model.idFornecedor,
      dataCompra: model.dataCompra,
      valorTotal: model.valorTotal,
      observacoes: model.observacoes,
      notaFiscal: model.notaFiscal,
      itens: itens,
      fornecedor: model.Fornecedor
    });
  }
};

class CompraSequelizeRepository extends ICompraRepository {
  
  async salvar(compra, useCases = {}) {
    const { criarLancamentoUseCase } = useCases;
    const t = await sequelize.transaction();

    try {
      // 1. Cria o registro na tabela 'compras'
      const compraCriada = await CompraModel.create({
        idFornecedor: compra.idFornecedor,
        dataCompra: compra.dataCompra,
        valorTotal: compra.valorTotal,
        observacoes: compra.observacoes,
        notaFiscal: compra.notaFiscal,
      }, { transaction: t });

      // 2. Itens agora são salvos na tabela 'lotes' (Passo 3)
      // Removemos a gravação em 'itens_compra'
      // const itensParaCriar = compra.itens.map(item => ({
      //   idCompra: compraCriada.id,
      //   idProduto: item.idProduto,
      //   quantidade: item.quantidade,
      //   custoUnitario: item.custoUnitario,
      // }));
      // await ItemCompraModel.bulkCreate(itensParaCriar, { transaction: t });

      // 3. Atualiza o estoque de cada produto (ADICIONA)
      for (const item of compra.itens) {
        // Em vez de ATUALIZAR 'produtos', nós CRIAMOS 'lotes'
        await LoteModel.create({
          idProduto: item.idProduto,
          idCompra: compraCriada.id,
          quantidade: item.quantidade,
          validade: item.validade,
          custoUnitario: item.custoUnitario
        }, { transaction: t });

        // ATUALIZAÇÃO DO ESTOQUE NO PRODUTO
        const produto = await ProdutoModel.findByPk(item.idProduto, { transaction: t });
        if (produto) {
          const novoEstoque = Number(produto.estoque || 0) + Number(item.quantidade);
          await produto.update({ estoque: novoEstoque }, { transaction: t });
        }
      }

      // 4. Integração Financeira (Cria a Conta a Pagar)
      if (criarLancamentoUseCase) {
        const dadosContaPagar = new Lancamento({
          descricao: `Compra de Fornecedor - Pedido #${compraCriada.id}`,
          valor: compra.valorTotal,
          tipo: 'DESPESA',
          status: 'PENDENTE',
          idCliente: null, // Não é um cliente
          dataVencimento: new Date(), // Idealmente viria da 'compra'
        });
        await criarLancamentoUseCase.execute(dadosContaPagar, { transaction: t });
      }

      await t.commit(); // Confirma a transação
      return compraCriada; // Retorna a compra criada
    } catch (error) {
      await t.rollback(); // Desfaz tudo em caso de erro
      throw new Error(`Erro ao salvar a compra: ${error.message}`);
    }
  }

  async buscarPorId(id) {
    const compraModel = await CompraModel.findByPk(id, {
      include: [
        {
          model: LoteModel,
          as: 'itens',
          include: [{ model: ProdutoModel }] // Lote também tem relação com Produto
        },
        {
          model: FornecedorModel // Inclui os dados do fornecedor
        }
      ]
    });
    return CompraMapper.toDomain(compraModel);
  }

  async listarTodas() {
    const comprasModel = await CompraModel.findAll({
      order: [['dataCompra', 'DESC']],
      include: [{ model: FornecedorModel }] // Inclui fornecedor na lista
    });
    return comprasModel.map(CompraMapper.toDomain);
  }
}
module.exports = CompraSequelizeRepository;