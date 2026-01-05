const Venda = require('../domain/entities/venda.entity');
const ItemVenda = require('../domain/entities/itemVenda.entity');

// Importações dos outros módulos
const AdicionarPontosUseCase = require('../../fidelizacao/application/adicionarPontos.usecase');
const ResgatarPontosUseCase = require('../../fidelizacao/application/resgatarPontos.usecase');
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
    this.resgatarPontosUseCase = new ResgatarPontosUseCase(fidelizacaoRepo);
    this.criarNotificacaoUseCase = new CriarNotificacaoUseCase(notificacaoRepo);
    this.adicionarCreditoUseCase = new AdicionarCreditoUseCase(creditoRepo);
    this.usarCreditoUseCase = new UsarCreditoUseCase(creditoRepo);
  }

  // Função auxiliar para buscar produto (Recursiva para Kits) - NÃO BLOQUEIA ESTOQUE
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
    }
    // ESTOQUE NEGATIVO: Não bloqueia mais se estoqueTotal < quantidadeNecessaria
    // A baixa real é feita no repository com lógica FEFO flexível
    return produto; // Retorna o produto para usarmos o preço depois
  }

  async execute({ idCliente, idUsuario, itens, pagamentos, destinoTroco, pontosUsados, descontoManual }) {
    if (!pagamentos || pagamentos.length === 0) {
      throw new Error('É necessário fornecer pelo menos um método de pagamento.');
    }
    
    let totalVenda = 0;
    let descontoFidelidade = 0;
    
    // Calcula desconto de fidelidade (R$ 0.05 por ponto)
    if (pontosUsados && pontosUsados > 0 && idCliente) {
      descontoFidelidade = pontosUsados * 0.05;
    }
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

    // 2. Aplica os descontos (fidelidade + manual, limitado ao total)
    const descontoTotal = descontoFidelidade + (descontoManual || 0);
    const descontoReal = Math.min(descontoTotal, totalVenda);
    const totalComDesconto = Math.max(0, totalVenda - descontoReal);

    // 3. Processamento de Pagamentos
    const resultadosPagamento = []; 
    for (const pag of pagamentos) {
        const processador = PagamentoFactory.criar(pag.metodo);
        if (processador) {
            const resultado = processador.processar(pag.valor, pag);
            resultadosPagamento.push(resultado);
        }
    }

    const totalPago = pagamentos.reduce((sum, pag) => sum + pag.valor, 0);
    // Allow overpayment (Change) but ensure it's not less than total WITH DISCOUNT
    if (totalPago < totalComDesconto - 0.01) { // 0.01 tolerance for Float precision
      throw new Error(`Pagamento insuficiente. Total: ${totalComDesconto.toFixed(2)}, Pago: ${totalPago.toFixed(2)}`);
    }

    const novaVenda = new Venda({
      idCliente,
      idUsuario,
      itens: itensVendaParaSalvar,
      totalVenda: totalComDesconto, // Usa o total com desconto
      pagamentos, 
      destinoTroco,
      descontoManual: descontoManual || 0,
      descontoPontos: descontoFidelidade
    });

    return this.vendaRepository.salvar(novaVenda, {
      adicionarPontosUseCase: this.adicionarPontosUseCase,
      resgatarPontosUseCase: this.resgatarPontosUseCase,
      criarLancamentoUseCase: this.criarLancamentoUseCase, 
      criarNotificacaoUseCase: this.criarNotificacaoUseCase,
      produtoRepository: this.produtoRepository,
      adicionarCreditoUseCase: this.adicionarCreditoUseCase,
      usarCreditoUseCase: this.usarCreditoUseCase,
      resultadosPagamento: resultadosPagamento,
      pontosUsados: pontosUsados || 0
    });
  }
}

module.exports = RegistrarVendaUseCase;