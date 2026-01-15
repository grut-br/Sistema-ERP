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
const CaixaSequelizeRepository = require('../../caixa/infrastructure/persistence/CaixaSequelize.repository');

const PagamentoFactory = require('../domain/factories/PagamentoFactory');

class RegistrarVendaUseCase {
  constructor(vendaRepository, produtoRepository, clienteRepository) {
    this.vendaRepository = vendaRepository;
    this.produtoRepository = produtoRepository;

    const fidelizacaoRepo = new FidelizacaoSequelizeRepository();
    const lancamentoRepo = new LancamentoSequelizeRepository();
    const notificacaoRepo = new NotificacaoSequelizeRepository();
    const creditoRepo = new CreditoClienteSequelizeRepository();
    const caixaRepo = new CaixaSequelizeRepository();
    
    this.caixaRepository = caixaRepo;
    
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
    
    // [STRICT] Validação de Caixa
    const temPagamentoDinheiro = pagamentos.some(p => p.metodo === 'DINHEIRO');
    // Troco logic validation is trickier before calculation, depends on total. 
    // But usually if payment is DINHEIRO, we assume potential interaction with physical cash.
    // If payment is PIX and needs change, we assume change might be PIX or CAIXA. 
    // User rule: "Se o pagamento for em 'DINHEIRO' (ou se houver troco em dinheiro)"
    // Let's check sessao first.
    
    const sessaoAberta = await this.caixaRepository.buscarSessaoAberta();
    
    if (temPagamentoDinheiro && !sessaoAberta) {
         throw new Error('O Caixa está fechado. É necessário abrir o caixa para realizar vendas em dinheiro.');
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

    // [STRICT] Check Change vs Closed Box
    const troco = totalPago - totalComDesconto;
    if (troco > 0.01 && (!destinoTroco || destinoTroco === 'CAIXA' || destinoTroco === 'DINHEIRO') && !sessaoAberta) {
       // If giving change in CASH and box is closed.
       // Even if payment was PIX, if change is CASH, we need open box.
       throw new Error('O Caixa está fechado. É necessário abrir o caixa para realizar troco em dinheiro.');
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

    const vendaSalva = await this.vendaRepository.salvar(novaVenda, {
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

    // 4. Registrar Movimentações no Caixa (Se houver sessao)
    if (sessaoAberta) {
         // Entrada Dinheiro
         const valorDinheiro = pagamentos.filter(p => p.metodo === 'DINHEIRO').reduce((acc, p) => acc + p.valor, 0);
         if (valorDinheiro > 0) {
             await this.caixaRepository.registrarMovimentacao({
                 id_sessao: sessaoAberta.id,
                 id_venda: vendaSalva.id, // Venda already saved hopefully has ID
                 tipo: 'ENTRADA',
                 valor: valorDinheiro,
                 forma_pagamento: 'DINHEIRO',
                 descricao: `Venda #${vendaSalva.id}`
             });
         }
         
         // Saída Troco
         if (troco > 0.01 && (!destinoTroco || destinoTroco === 'CAIXA' || destinoTroco === 'DINHEIRO')) {
              await this.caixaRepository.registrarMovimentacao({
                 id_sessao: sessaoAberta.id,
                 id_venda: vendaSalva.id,
                 tipo: 'SAIDA',
                 valor: troco,
                 forma_pagamento: 'DINHEIRO',
                 descricao: `Troco Venda #${vendaSalva.id}`
             });
         }
    }

    return vendaSalva;
  }
}

module.exports = RegistrarVendaUseCase;