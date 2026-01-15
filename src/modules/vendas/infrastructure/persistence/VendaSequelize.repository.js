const sequelize = require('../../../../shared/infra/database');
const { Op } = require('sequelize');
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

// IDs das categorias padrão (conforme seed do banco)
// 1: Venda de Produtos (RECEITA)
// 2: Fiado Cliente (RECEITA)
// 3: Pagamento Fornecedor (DESPESA)
const CATEGORIA_VENDA_PRODUTOS = 7; // Ajustado conforme DB (Vendas)
const CATEGORIA_FIADO_CLIENTE = 1; // Ajustado conforme DB (Fiado Cliente é ID 1)


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
      dataVenda: model.data_venda,
      status: model.status,
      itens: itens,
      pagamentos: pagamentos,
      cliente: model.cliente ? model.cliente.toJSON() : null,
      descontoManual: parseFloat(model.descontoManual) || 0,
      descontoPontos: parseFloat(model.descontoPontos) || 0,
      creditoGerado: parseFloat(model.creditoGerado) || 0,
      troco: parseFloat(model.troco) || 0,
      destinoTroco: model.destinoTroco
    });
  }
};

class VendaSequelizeRepository extends IVendaRepository { 
  
  // Método SALVAR corrigido
  async salvar(venda, useCases = {}) {
    // Desestrutura todos os casos de uso
    const { 
      adicionarPontosUseCase, 
      resgatarPontosUseCase,
      criarLancamentoUseCase, 
      criarNotificacaoUseCase, 
      produtoRepository,
      resultadosPagamento,
      usarCreditoUseCase,
      adicionarCreditoUseCase,
      pontosUsados
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
        descontoManual: venda.descontoManual || 0,
        descontoPontos: venda.descontoPontos || 0,
        troco: venda.troco || 0,
        destinoTroco: venda.destinoTroco,
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
          const lotes = await produtoRepository.buscarLotesDisponiveisPorProduto(idProduto, { transaction: t });
          let qtdRestante = quantidadeBaixar;

          // Baixa nos lotes disponíveis (FEFO - First Expire First Out)
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
          
          // --- LÓGICA DE ESTOQUE NEGATIVO ---
          // Se ainda restar quantidade pendente, negativar o último lote ou criar um novo
          if (qtdRestante > 0) {
            // Busca todos os lotes (incluindo zerados) para pegar o mais recente
            const todosLotes = await LoteModel.findAll({
              where: { idProduto },
              order: [['id', 'DESC']],
              transaction: t
            });
            
            let loteParaNegativar = todosLotes[0]; // Último lote criado
            
            if (!loteParaNegativar) {
              // Cria um "Lote Inicial" se não existir nenhum
              loteParaNegativar = await LoteModel.create({
                idProduto,
                quantidade: 0,
                validade: null,
                custoUnitario: 0
              }, { transaction: t });
            }
            
            // Subtrai a quantidade pendente (permite valor negativo)
            await LoteModel.update(
              { quantidade: sequelize.literal(`quantidade - ${qtdRestante}`) },
              { where: { id: loteParaNegativar.id }, transaction: t }
            );
          }
          
          // --- GATILHO DE ESTOQUE NEGATIVO/BAIXO ---
          // Busca todos os lotes para calcular estoque real (inclui negativos)
          const todosLotesAtualizados = await LoteModel.findAll({
            where: { idProduto },
            transaction: t
          });
          const estoqueFinal = todosLotesAtualizados.reduce((soma, lote) => soma + lote.quantidade, 0);
          const LIMITE_ESTOQUE_BAIXO = 3;

          if (criarNotificacaoUseCase && estoqueFinal <= LIMITE_ESTOQUE_BAIXO) {
            // Usa ESTOQUE_BAIXO para ambos os casos (valor negativo é indicado na mensagem)
            const msgNotif = estoqueFinal < 0 
              ? `ESTOQUE NEGATIVO: "${produto.nome}" está devendo ${Math.abs(estoqueFinal)} unidades.`
              : `Estoque baixo para o produto: "${produto.nome}". Restam apenas ${estoqueFinal} unidades.`;
            
            await criarNotificacaoUseCase.execute({
              tipo: 'ESTOQUE_BAIXO',
              mensagem: msgNotif,
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
            idCategoria: CATEGORIA_FIADO_CLIENTE, // Categoria automática
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
      // 6a. Primeiro resgata os pontos usados (se houver)
      if (venda.idCliente && resgatarPontosUseCase && pontosUsados > 0) {
        await resgatarPontosUseCase.execute({
          clienteId: venda.idCliente,
          pontos: pontosUsados
        }, { transaction: t });
      }
      
      // 6b. Depois adiciona novos pontos pela compra
      if (venda.idCliente && adicionarPontosUseCase) {
        await adicionarPontosUseCase.execute({ 
          clienteId: venda.idCliente, 
          valorCompra: venda.totalVenda 
        }, { transaction: t });
      }

      // 7. PROCESSAMENTO DE TROCO
      const totalPago = venda.pagamentos.reduce((acc, p) => acc + p.valor, 0);
      const troco = totalPago - vendaCriada.totalVenda;

      if (troco > 0) {
          // Opção 1: Salvar como CRÉDITO na loja
          if (venda.destinoTroco === 'CREDITO') {
              if (adicionarCreditoUseCase && venda.idCliente) {
                  await adicionarCreditoUseCase.execute({
                      idCliente: venda.idCliente,
                      valor: troco,
                      descricao: `Troco da Venda #${vendaCriada.id}`,
                      idVendaOrigem: vendaCriada.id
                  }, { transaction: t });
              }
          }
          // Opção 2: Devolver via PIX (Gera uma DESPESA/SAÍDA no financeiro)
          else if (venda.destinoTroco === 'PIX') {
              if (criarLancamentoUseCase) {
                  const despesaTroco = new Lancamento({
                      descricao: `Troco PIX referente à Venda #${vendaCriada.id}`,
                      valor: troco,
                      tipo: 'DESPESA',
                      status: 'PAGO', // Saiu do caixa imediatamente
                      dataPagamento: new Date(),
                      idVenda: vendaCriada.id,
                  });
                  await criarLancamentoUseCase.execute(despesaTroco, { transaction: t });
              }
          }
          // Opção 3: DINHEIRO (Padrão) - Não faz nada extra, o caixa físico reflete a saída.
      }
      // Mantendo compatibilidade com resultadosPagamento se houver lógica específica lá no futuro
      if (resultadosPagamento) {
          // ... (outras lógicas de processamento de retorno se necessário)
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
          model: ClienteModel,
          as: 'cliente'
        },
        {
          model: PagamentoModel, // Inclui os pagamentos
          as: 'pagamentos'
        }
      ]
    });
    return VendaMapper.toDomain(vendaModel);
  }



  // Método LISTAR TODAS corrigido com filtros
  async listarTodas(filtros = {}) {
    const where = {};
    const whereCliente = {};

    // Filtro por Data
    if (filtros.dataInicio || filtros.dataFim) {
      where.data_venda = {};
      if (filtros.dataInicio) where.data_venda[Op.gte] = filtros.dataInicio;
      if (filtros.dataFim) where.data_venda[Op.lte] = filtros.dataFim;
    }

    // Filtro por Status
    if (filtros.status) {
      where.status = filtros.status;
    }

    // Filtro por Nome do Cliente
    if (filtros.clienteNome) {
      whereCliente.nome = { [Op.like]: `%${filtros.clienteNome}%` };
    }

    // Filtro por ID (exato)
    if (filtros.id) {
       where.id = filtros.id;
    }

    const vendasModel = await VendaModel.findAll({
      where,
      order: [['data_venda', 'DESC']],
      include: [
        { 
            model: ClienteModel,
            as: 'cliente',
            where: Object.keys(whereCliente).length > 0 ? whereCliente : undefined,
            required: Object.keys(whereCliente).length > 0
        },
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

  /**
   * Busca vendas de um cliente específico (para histórico de compras)
   * @param {number} clienteId - ID do cliente
   * @param {number} limite - Quantidade máxima de vendas a retornar
   * @returns {Array} Lista de vendas do cliente
   */
  async buscarPorClienteId(clienteId, limite = 5) {
    const vendasModel = await VendaModel.findAll({
      where: { idCliente: clienteId },
      order: [['data_venda', 'DESC']],
      limit: limite,
      include: [
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

      // 2. Devolve os itens ao estoque (LOTE)
      for (const item of venda.itens) {
        // Busca o lote mais adequado para devolução (ex: o com validade mais distante ou último criado)
        const lote = await LoteModel.findOne({
            where: { idProduto: item.idProduto },
            order: [['validade', 'DESC'], ['id', 'DESC']],
            transaction: t
        });

        if (lote) {
            await lote.increment('quantidade', { by: item.quantidade, transaction: t });
        } else {
            // Se não houver lote, cria um para receber a devolução (Fallback)
             await LoteModel.create({
                 idProduto: item.idProduto,
                 quantidade: item.quantidade,
                 custoUnitario: item.precoUnitario, // Usa preço de venda como custo aprox ou 0
                 validade: null
             }, { transaction: t });
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