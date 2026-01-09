const sequelize = require('../../../shared/infra/database');
const LoteModel = require('../../produtos/infrastructure/persistence/lote.model');
const ProdutoModel = require('../../produtos/infrastructure/persistence/produto.model');
const LancamentoModel = require('../../financeiro/infrastructure/persistence/lancamento.model');
const CompraModel = require('../infrastructure/persistence/compra.model');
const Lancamento = require('../../financeiro/domain/entities/lancamento.entity');
const CriarLancamentoUseCase = require('../../financeiro/application/criarLancamento.usecase');
const LancamentoSequelizeRepository = require('../../financeiro/infrastructure/persistence/LancamentoSequelize.repository');

const CATEGORIA_PAGAMENTO_FORNECEDOR = 3;

class EditarCompraUseCase {
  constructor(compraRepository, produtoRepository, fornecedorRepository) {
    this.compraRepository = compraRepository;
    this.produtoRepository = produtoRepository;
    this.fornecedorRepository = fornecedorRepository;
    
    const lancamentoRepo = new LancamentoSequelizeRepository();
    this.criarLancamentoUseCase = new CriarLancamentoUseCase(lancamentoRepo);
  }

  async execute(idCompra, dadosAtualizados) {
    if (!idCompra) {
      throw new Error('ID da compra é obrigatório para edição.');
    }

    // 1. Busca a compra original com itens
    const compraOriginal = await this.compraRepository.buscarPorId(idCompra);
    if (!compraOriginal) {
      throw new Error('Compra não encontrada.');
    }

    const itensOriginais = compraOriginal.itens || [];
    const itensNovos = dadosAtualizados.itens || [];

    // 2. Calcula diferenças
    const idsOriginais = new Set(itensOriginais.map(i => i.idProduto));
    const idsNovos = new Set(itensNovos.map(i => i.idProduto));
    
    // Itens que serão removidos ou tiveram quantidade reduzida
    const itensParaValidar = [];
    for (const itemOriginal of itensOriginais) {
      const itemNovo = itensNovos.find(n => n.idProduto === itemOriginal.idProduto);
      if (!itemNovo) {
        // Item foi removido completamente - precisa validar estoque
        itensParaValidar.push({ ...itemOriginal, qtdReduzir: itemOriginal.quantidade });
      } else if (itemNovo.quantidade < itemOriginal.quantidade) {
        // Quantidade foi reduzida - precisa validar a diferença
        itensParaValidar.push({ ...itemOriginal, qtdReduzir: itemOriginal.quantidade - itemNovo.quantidade });
      }
    }

    // 3. Valida se é possível reduzir o estoque dos itens que serão removidos/reduzidos
    for (const item of itensParaValidar) {
      const produto = await ProdutoModel.findByPk(item.idProduto);
      if (!produto) continue;

      const estoqueAtual = Number(produto.estoque || 0);
      const qtdReduzir = Number(item.qtdReduzir || 0);

      if (estoqueAtual < qtdReduzir) {
        // Erro: não pode reduzir mais do que tem em estoque
        throw new Error(
          `Não é possível editar. Produto "${produto.nome}" tem estoque atual de ${estoqueAtual}, ` +
          `mas você está tentando reduzir ${qtdReduzir} unidades. Parte já foi vendida.`
        );
      }
    }

    // 4. Inicia transação
    const t = await sequelize.transaction();

    try {
      // 5. Processa as diferenças de estoque e lotes
      
      // 5a. Remove lotes de itens que foram excluídos ou tiveram quantidade reduzida
      for (const item of itensParaValidar) {
        // Atualiza estoque do produto (subtrai)
        const produto = await ProdutoModel.findByPk(item.idProduto, { transaction: t });
        if (produto) {
          const novoEstoque = Math.max(0, Number(produto.estoque || 0) - Number(item.qtdReduzir));
          await produto.update({ estoque: novoEstoque }, { transaction: t });
        }
      }
      
      // Remove lotes antigos da compra
      await LoteModel.destroy({
        where: { idCompra: idCompra },
        transaction: t
      });

      // 5b. Recria lotes com os novos itens
      let novoValorTotal = 0;
      for (const item of itensNovos) {
        await LoteModel.create({
          idProduto: item.idProduto,
          idCompra: idCompra,
          quantidade: item.quantidade,
          validade: item.validade,
          custoUnitario: item.custoUnitario
        }, { transaction: t });

        novoValorTotal += item.quantidade * item.custoUnitario;

        // Verifica se é item novo ou aumentou quantidade
        const itemOriginal = itensOriginais.find(o => o.idProduto === item.idProduto);
        let qtdAdicionar = item.quantidade;
        if (itemOriginal) {
          // Só adiciona a diferença
          qtdAdicionar = item.quantidade - itemOriginal.quantidade;
        }

        if (qtdAdicionar > 0) {
          const produto = await ProdutoModel.findByPk(item.idProduto, { transaction: t });
          if (produto) {
            const novoEstoque = Number(produto.estoque || 0) + Number(qtdAdicionar);
            await produto.update({ estoque: novoEstoque }, { transaction: t });
          }
        }
      }

      // 6. Atualiza dados da compra
      await CompraModel.update({
        idFornecedor: dadosAtualizados.idFornecedor,
        dataCompra: dadosAtualizados.dataCompra,
        notaFiscal: dadosAtualizados.numeroNota,
        observacoes: dadosAtualizados.observacoes,
        valorTotal: novoValorTotal
      }, {
        where: { id: idCompra },
        transaction: t
      });

      // 7. Atualiza lançamentos financeiros (cancela antigos)
      await LancamentoModel.update(
        { status: 'CANCELADO' },
        { where: { idCompra: idCompra }, transaction: t }
      );

      // 8. Cria novos lançamentos com base no novo valor
      const fornecedor = await this.fornecedorRepository.buscarPorId(dadosAtualizados.idFornecedor);
      const qtdParcelas = Number(dadosAtualizados.qtdParcelas) || 1;
      const valorParcela = novoValorTotal / qtdParcelas;
      
      let dataBase = new Date(dadosAtualizados.dataPrimeiroVencimento || new Date());
      if (isNaN(dataBase.getTime())) dataBase = new Date();

      for (let i = 0; i < qtdParcelas; i++) {
        const vencimento = new Date(dataBase);
        if (dadosAtualizados.intervaloParcelas === 'QUINZENAL') {
          vencimento.setDate(vencimento.getDate() + (i * 15));
        } else {
          vencimento.setMonth(vencimento.getMonth() + i);
        }

        let descricao = `${fornecedor?.nome || 'Fornecedor'} - Compra N° ${idCompra}`;
        if (qtdParcelas > 1) {
          descricao += ` (Parc. ${i + 1}/${qtdParcelas})`;
        }

        await LancamentoModel.create({
          descricao,
          valor: valorParcela,
          tipo: 'DESPESA',
          status: dadosAtualizados.statusPagamento || 'PENDENTE',
          idCliente: null,
          idCompra: idCompra,
          dataVencimento: vencimento,
          idCategoria: CATEGORIA_PAGAMENTO_FORNECEDOR
        }, { transaction: t });
      }

      await t.commit();
      
      return { success: true, message: 'Compra atualizada com sucesso.' };
    } catch (error) {
      await t.rollback();
      throw new Error(`Erro ao editar compra: ${error.message}`);
    }
  }
}

module.exports = EditarCompraUseCase;
