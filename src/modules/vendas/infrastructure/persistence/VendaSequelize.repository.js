const sequelize = require('../../../../shared/infra/database');
const VendaModel = require('./venda.model');
const ItemVendaModel = require('./itemVenda.model');
const PagamentoModel = require('./pagamento.model');
const ProdutoModel = require('../../../produtos/infrastructure/persistence/produto.model');
const LoteModel = require('../../../produtos/infrastructure/persistence/lote.model');
const ClienteModel = require('../../../clientes/infrastructure/persistence/cliente.model');

const Venda = require('../../domain/entities/venda.entity');
const ItemVenda = require('../../domain/entities/itemVenda.entity');
const Lancamento = require('../../../financeiro/domain/entities/lancamento.entity');
const IVendaRepository = require('../../domain/repositories/IVendaRepository');


// Mapper ATUALIZADO
const VendaMapper = {
  toDomain(model) {
    if (!model) return null;

    const itens = model.itens ? model.itens.map(item => new ItemVenda({
      id: item.id,
      idProduto: item.idProduto,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      produto: item.Produto 
    })) : [];
    
    // Mapeia os pagamentos
    const pagamentos = model.pagamentos ? model.pagamentos.map(pag => ({
      id: pag.id,
      metodo: pag.metodo,
      valor: pag.valor,
    })) : [];

    return new Venda({
      id: model.id,
      idCliente: model.idCliente,
      idUsuario: model.idUsuario,
      totalVenda: model.totalVenda,
      dataVenda: model.data_venda, // Corrigido para data_venda do modelo
      status: model.status,
      itens: itens,
      pagamentos: pagamentos, // Adiciona os pagamentos
      cliente: model.Cliente ? model.Cliente.toJSON() : null // Adiciona cliente se existir
    });
  }
};

class VendaSequelizeRepository extends IVendaRepository { 
  
  // Método SALVAR corrigido
  async salvar(venda, useCases = {}) {
    // Desestrutura todos os casos de uso
    const { 
      adicionarPontosUseCase, 
      criarLancamentoUseCase, 
      criarNotificacaoUseCase, 
      produtoRepository,
      resultadosPagamento,
      usarCreditoUseCase,
      adicionarCreditoUseCase
    } = useCases;
    
    if (!produtoRepository) {
      throw new Error('ProdutoRepository é necessário para salvar a venda.');
    }

    const t = await sequelize.transaction(); 

    try {
      // 1. Cria a Venda
      const vendaCriada = await VendaModel.create({
        idCliente: venda.idCliente,
        idUsuario: venda.idUsuario,
        totalVenda: venda.totalVenda,
        status: 'CONCLUIDA',
      }, { transaction: t });

      // 2. Cria os Pagamentos
      const pagamentosParaCriar = venda.pagamentos.map(pag => ({
        idVenda: vendaCriada.id,
        metodo: pag.metodo,
        valor: pag.valor,
      }));
      await PagamentoModel.bulkCreate(pagamentosParaCriar, { transaction: t });

      // 3. Cria os Itens da Venda (Registro Histórico)
      const itensParaCriar = venda.itens.map(item => ({
        idVenda: vendaCriada.id,
        idProduto: item.idProduto,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
      }));
      await ItemVendaModel.bulkCreate(itensParaCriar, { transaction: t });

      // 4. LÓGICA DE ESTOQUE (RECURSIVA PARA KITS + FEFO)
      
      // Função auxiliar para processar a baixa
      const processarBaixaDeEstoque = async (idProduto, quantidadeBaixar) => {
        const produto = await ProdutoModel.findByPk(idProduto, { transaction: t });
        
        if (produto.eKit) {
          // --- SE FOR KIT: Busca componentes e dá baixa neles ---
          const componentes = await produtoRepository.buscarComponentesDoKit(idProduto, { transaction: t });
          for (const comp of componentes) {
            // Recursão: Quantidade vendida * Quantidade do componente no kit
            await processarBaixaDeEstoque(comp.idProduto, quantidadeBaixar * comp.quantidadeNecessaria);
          }
        } else {
          // --- SE FOR PRODUTO FÍSICO: Roda a lógica FEFO ---
          const lotes = await produtoRepository.buscarLotesDisponiveisPorProduto(idProduto, { transaction: t });
          let qtdRestante = quantidadeBaixar;

          // Valida estoque total antes de começar
          const estoqueTotal = lotes.reduce((acc, l) => acc + l.quantidade, 0);
          if (estoqueTotal < qtdRestante) {
             throw new Error(`Estoque insuficiente para o produto "${produto.nome}" (ID ${idProduto}).`);
          }

          // Baixa nos lotes
          for (const lote of lotes) {
            if (qtdRestante === 0) break;
            
            if (lote.quantidade >= qtdRestante) {
              lote.darBaixa(qtdRestante);
              qtdRestante = 0;
            } else {
              qtdRestante -= lote.quantidade;
              lote.darBaixa(lote.quantidade); // Zera o lote
            }
            // Atualiza o lote no banco
            await LoteModel.update(
                { quantidade: lote.quantidade }, 
                { where: { id: lote.id }, transaction: t }
            );
          }
          
          // --- GATILHO DE ESTOQUE BAIXO (Dentro da recursão para funcionar com Kits) ---
          const lotesAtualizados = await produtoRepository.buscarLotesDisponiveisPorProduto(idProduto, { transaction: t });
          const estoqueFinal = lotesAtualizados.reduce((soma, lote) => soma + lote.quantidade, 0);
          const LIMITE_ESTOQUE_BAIXO = 3; // Você pode parametrizar isso depois

          if (criarNotificacaoUseCase && estoqueFinal <= LIMITE_ESTOQUE_BAIXO) {
            await criarNotificacaoUseCase.execute({
              tipo: 'ESTOQUE_BAIXO',
              mensagem: `Estoque baixo para o produto: "${produto.nome}". Restam apenas ${estoqueFinal} unidades.`,
              idReferencia: idProduto,
              referenciaTipo: 'PRODUTO'
            }, { transaction: t });
          }
        }
      };

      // Executa a função recursiva para cada item da venda
      for (const item of venda.itens) {
        await processarBaixaDeEstoque(item.idProduto, item.quantidade);
      }

      // 5. Integração Financeira (FIADO E CREDITO)
      for (const pag of venda.pagamentos) {
        
        // --- CASO 1: FIADO (Gera Conta a Receber) ---
        if (pag.metodo === 'FIADO' && criarLancamentoUseCase) {
          const dadosFiado = new Lancamento({
            descricao: `Fiado referente à Venda #${vendaCriada.id}`,
            valor: pag.valor,
            tipo: 'RECEITA',
            status: 'PENDENTE',
            idCliente: venda.idCliente,
            idVenda: vendaCriada.id,
          });
          await criarLancamentoUseCase.execute(dadosFiado, { transaction: t });
        }

        // --- CASO 2: CRÉDITO (Usa Saldo da Carteira) ---
        if (pag.metodo === 'CREDITO' && usarCreditoUseCase) {
          // Validação extra: Não dá para usar crédito sem identificar o cliente
          if (!venda.idCliente) {
            throw new Error('Venda com pagamento em Crédito exige um cliente identificado.');
          }
          
          await usarCreditoUseCase.execute({
            idCliente: venda.idCliente,
            valor: pag.valor,
            idVenda: vendaCriada.id
          }, { transaction: t });
        }
      }

      // 6. Integração Fidelização (Pontos)
      if (venda.idCliente && adicionarPontosUseCase) {
        await adicionarPontosUseCase.execute({ 
          clienteId: venda.idCliente, 
          valorCompra: venda.totalVenda 
        }, { transaction: t });
      }

      // 7. PROCESSAMENTO DE TROCO ESPECIAL
      if (resultadosPagamento) {
        for (const res of resultadosPagamento) {
          // Verifica se existe troco
          if (res.detalhes && res.detalhes.troco > 0) {
            const valorTroco = res.detalhes.troco;
            const destino = res.detalhes.destinoTroco;

            if (destino === 'PIX' && criarLancamentoUseCase) {
              // Cria DESPESA PAGA (Saiu dinheiro do caixa)
              await criarLancamentoUseCase.execute({
                descricao: `Troco PIX - Venda #${vendaCriada.id}`,
                valor: valorTroco,
                tipo: 'DESPESA',
                status: 'PAGO',
                dataPagamento: new Date(),
                idVenda: vendaCriada.id,
                idCliente: venda.idCliente
              }, { transaction: t });
            } 
            else if (destino === 'CREDITO' && adicionarCreditoUseCase) {
              // Adiciona CRÉDITO na carteira do cliente
              if (!venda.idCliente) throw new Error('Venda sem cliente não pode gerar crédito.');
              
              await adicionarCreditoUseCase.execute({
                idCliente: venda.idCliente,
                valor: valorTroco,
                descricao: `Troco da Venda #${vendaCriada.id}`,
                idVendaOrigem: vendaCriada.id
              }, { transaction: t });
            }
          }
        }
      }

      await t.commit();
      return this.buscarPorId(vendaCriada.id);
    } catch (error) {
      await t.rollback(); 
      console.error('ERRO AO SALVAR VENDA:', error.message); 
      throw new Error(`Erro ao salvar a venda: ${error.message}`);
    }
  }

  // Método BUSCAR POR ID corrigido
  async buscarPorId(id) {
    const vendaModel = await VendaModel.findByPk(id, {
      include: [
        {
          model: ItemVendaModel,
          as: 'itens',
          include: [{ model: ProdutoModel }]
        },
        {
          model: ClienteModel
        },
        {
          model: PagamentoModel, // Inclui os pagamentos
          as: 'pagamentos'
        }
      ]
    });
    return VendaMapper.toDomain(vendaModel);
  }

  // Método LISTAR TODAS corrigido
  async listarTodas() {
    const vendasModel = await VendaModel.findAll({
      order: [['data_venda', 'DESC']],
      include: [
        { model: ClienteModel },
        { model: PagamentoModel, as: 'pagamentos' },
        { 
          model: ItemVendaModel, 
          as: 'itens',
          include: [{ model: ProdutoModel }]
        }
      ]
    });
    return vendasModel.map(VendaMapper.toDomain);
  }

  // Método CANCELAR (ainda sem estorno de fiado/pontos)
  async cancelar(venda, useCases = {}) {
    const { produtoRepository, estornarPontosUseCase, cancelarFiadoUseCase } = useCases;
    
    if (!produtoRepository) {
      throw new Error('ProdutoRepository não foi fornecido para o cancelamento.');
    }

    const t = await sequelize.transaction();
    try {
      // 1. Atualiza o status da venda para 'CANCELADA'
      await VendaModel.update(
        { status: 'CANCELADA' },
        { where: { id: venda.id }, transaction: t }
      );

      // 2. Devolve os itens ao estoque
      for (const item of venda.itens) {
        const produto = await produtoRepository.buscarPorId(item.idProduto, { transaction: t });
        if (produto) {
          produto.ajustarEstoque(item.quantidade);
          await produtoRepository.atualizar(produto, { transaction: t });
        }
      }
      
      // 3. Estorna pontos de fidelidade
      if (venda.idCliente && estornarPontosUseCase) {
        await estornarPontosUseCase.execute({
          clienteId: venda.idCliente,
          valorCompra: venda.totalVenda
        }, { transaction: t });
      }

      // 4. Cancela o lançamento 'FIADO' no financeiro
      if (cancelarFiadoUseCase) {
        await cancelarFiadoUseCase.execute({ vendaId: venda.id }, { transaction: t });
      }

      await t.commit();
    } catch (error) {
      await t.rollback();
      throw new Error(`Erro ao cancelar a venda: ${error.message}`);
    }
  }
}
module.exports = VendaSequelizeRepository;