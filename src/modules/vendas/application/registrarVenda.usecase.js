const Venda = require('../domain/entities/venda.entity');
const ItemVenda = require('../domain/entities/itemVenda.entity');

// Importações dos outros módulos
const AdicionarPontosUseCase = require('../../fidelizacao/application/adicionarPontos.usecase');
const FidelizacaoSequelizeRepository = require('../../fidelizacao/infrastructure/persistence/FidelizacaoSequelize.repository');
const CriarLancamentoUseCase = require('../../financeiro/application/criarLancamento.usecase');
const LancamentoSequelizeRepository = require('../../financeiro/infrastructure/persistence/LancamentoSequelize.repository');
const CriarNotificacaoUseCase = require('../../notificacoes/application/criarNotificacao.usecase');
const NotificacaoSequelizeRepository = require('../../notificacoes/infrastructure/persistence/NotificacaoSequelize.repository');
const CreditoClienteSequelizeRepository = require('../../financeiro/infrastructure/persistence/CreditoClienteSequelize.repository');
const AdicionarCreditoUseCase = require('../../financeiro/application/adicionarCredito.usecase');
const UsarCreditoUseCase = require('../../financeiro/application/usarCredito.usecase');

const PagamentoFactory = require('../domain/factories/PagamentoFactory');

class RegistrarVendaUseCase {
  constructor(vendaRepository, produtoRepository, clienteRepository) {
    this.vendaRepository = vendaRepository;
    this.produtoRepository = produtoRepository;

    const fidelizacaoRepo = new FidelizacaoSequelizeRepository();
    const lancamentoRepo = new LancamentoSequelizeRepository();
    const notificacaoRepo = new NotificacaoSequelizeRepository();
    const creditoRepo = new CreditoClienteSequelizeRepository();
    
    this.criarLancamentoUseCase = new CriarLancamentoUseCase(lancamentoRepo);
    this.adicionarPontosUseCase = new AdicionarPontosUseCase(fidelizacaoRepo);
    this.criarNotificacaoUseCase = new CriarNotificacaoUseCase(notificacaoRepo);
    this.adicionarCreditoUseCase = new AdicionarCreditoUseCase(creditoRepo);
    this.usarCreditoUseCase = new UsarCreditoUseCase(creditoRepo);
  }

  // Função auxiliar para validar estoque (Recursiva para Kits)
  async validarEstoque(idProduto, quantidadeNecessaria) {
    const produto = await this.produtoRepository.buscarPorId(idProduto);
    if (!produto) throw new Error(`Produto com ID ${idProduto} não encontrado.`);

    if (produto.eKit) {
      // SE FOR KIT: Busca componentes e valida cada um
      const componentes = await this.produtoRepository.buscarComponentesDoKit(idProduto);
      for (const comp of componentes) {
        // Valida o componente multiplicando pela quantidade necessária
        await this.validarEstoque(comp.idProduto, quantidadeNecessaria * comp.quantidadeNecessaria);
      }
    } else {
      // SE FOR PRODUTO FÍSICO: Valida os lotes
      const lotesDisponiveis = await this.produtoRepository.buscarLotesDisponiveisPorProduto(idProduto);
      const estoqueTotal = lotesDisponiveis.reduce((soma, lote) => soma + lote.quantidade, 0);

      if (estoqueTotal < quantidadeNecessaria) {
        throw new Error(`Estoque insuficiente para o produto "${produto.nome}". Disponível: ${estoqueTotal}, Pedido: ${quantidadeNecessaria}`);
      }
    }
    return produto; // Retorna o produto para usarmos o preço depois
  }

  async execute({ idCliente, idUsuario, itens, pagamentos }) {
    if (!pagamentos || pagamentos.length === 0) {
      throw new Error('É necessário fornecer pelo menos um método de pagamento.');
    }
    
    let totalVenda = 0;
    const itensVendaParaSalvar = [];

    // 1. Validação de Estoque e Cálculo de Preço
    for (const item of itens) {
      // Chama a nossa nova função recursiva
      const produto = await this.validarEstoque(item.idProduto, item.quantidade);

      totalVenda += produto.precoVenda * item.quantidade;
      itensVendaParaSalvar.push(new ItemVenda({
        idProduto: item.idProduto,
        quantidade: item.quantidade,
        precoUnitario: produto.precoVenda,
        produto: produto,
      }));
    }

    // 2. Processamento de Pagamentos
    const resultadosPagamento = []; 
    for (const pag of pagamentos) {
        const processador = PagamentoFactory.criar(pag.metodo);
        if (processador) {
            const resultado = processador.processar(pag.valor, pag);
            resultadosPagamento.push(resultado);
        }
    }

    const totalPago = pagamentos.reduce((sum, pag) => sum + pag.valor, 0);
    if (totalPago.toFixed(2) !== totalVenda.toFixed(2)) {
      throw new Error('A soma dos pagamentos não corresponde ao total da venda.');
    }

    const novaVenda = new Venda({
      idCliente,
      idUsuario,
      itens: itensVendaParaSalvar,
      totalVenda,
      pagamentos, 
    });

    return this.vendaRepository.salvar(novaVenda, {
      adicionarPontosUseCase: this.adicionarPontosUseCase,
      criarLancamentoUseCase: this.criarLancamentoUseCase, 
      criarNotificacaoUseCase: this.criarNotificacaoUseCase,
      produtoRepository: this.produtoRepository,
      adicionarCreditoUseCase: this.adicionarCreditoUseCase,
      usarCreditoUseCase: this.usarCreditoUseCase,
      resultadosPagamento: resultadosPagamento 
    });
  }
}

module.exports = RegistrarVendaUseCase;