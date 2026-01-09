const Compra = require('../domain/entities/compra.entity');
const ItemCompra = require('../domain/entities/itemCompra.entity');

// Importa os repositórios/casos de uso de outros módulos
const CriarLancamentoUseCase = require('../../financeiro/application/criarLancamento.usecase');
const LancamentoSequelizeRepository = require('../../financeiro/infrastructure/persistence/LancamentoSequelize.repository');

class RegistrarCompraUseCase {
  constructor(compraRepository, produtoRepository, fornecedorRepository) {
    this.compraRepository = compraRepository;
    this.produtoRepository = produtoRepository;
    this.fornecedorRepository = fornecedorRepository;

    // Instancia o caso de uso financeiro
    const lancamentoRepo = new LancamentoSequelizeRepository();
    this.criarLancamentoUseCase = new CriarLancamentoUseCase(lancamentoRepo);
  }

  async execute({ idFornecedor, dataCompra, observacoes, itens, numeroNota, formaPagamento, qtdParcelas, intervaloParcelas, dataPrimeiroVencimento, statusPagamento }) {
    if (!idFornecedor || !itens || itens.length === 0) {
      throw new Error('Fornecedor e pelo menos um item são obrigatórios.');
    }

    // Valida se o fornecedor existe
    const fornecedor = await this.fornecedorRepository.buscarPorId(idFornecedor);
    if (!fornecedor) {
      throw new Error('Fornecedor não encontrado.');
    }

    let valorTotal = 0;
    const itensCompraParaSalvar = [];

    // 1. Validação de produtos e cálculo do total
    for (const item of itens) {
      // Validação dos novos campos obrigatórios
      if (!item.idProduto || !item.quantidade || !item.custoUnitario) {
        throw new Error('idProduto, quantidade e custoUnitario são obrigatórios para todos os itens.');
      }
      
      const produto = await this.produtoRepository.buscarPorId(item.idProduto);
      if (!produto) throw new Error(`Produto com ID ${item.idProduto} não encontrado.`);

      valorTotal += item.custoUnitario * item.quantidade;
      itensCompraParaSalvar.push(new ItemCompra({
        idProduto: item.idProduto,
        quantidade: item.quantidade,
        custoUnitario: item.custoUnitario,
        validade: item.validade,
        produto: produto,
      }));
    }

    // 2. Calcula as parcelas (Contas a Pagar)
    const contasAPagar = [];
    const qtd = Number(qtdParcelas) || 1;
    const valorParcela = valorTotal / qtd; // Simples divisão (pode haver dízima, tratado no banco ou arredondamento)
    
    let dataBase = new Date(dataPrimeiroVencimento || new Date());
    // Garantir que a dataBase não tenha "Invalid Date"
    if (isNaN(dataBase.getTime())) dataBase = new Date();

    for (let i = 0; i < qtd; i++) {
        const vencimento = new Date(dataBase);
        
        if (intervaloParcelas === 'MENSAL') {
            // Adiciona i meses
            vencimento.setMonth(vencimento.getMonth() + i);
        } else if (intervaloParcelas === 'QUINZENAL') {
            // Adiciona i * 15 dias
            vencimento.setDate(vencimento.getDate() + (i * 15));
        }
        
        let descricao = `${fornecedor.nome} - Compra N° ##ID##`;
        if (qtd > 1) {
            descricao += ` (Parc. ${i+1}/${qtd})`;
        }

        contasAPagar.push({
            descricao: descricao,
            valor: valorParcela,
            dataVencimento: vencimento,
            status: statusPagamento || 'PENDENTE',
            fornecedorNome: fornecedor.nome,
            parcela: i+1,
            totalParcelas: qtd
        });
    }

    // 3. Cria a entidade de Compra
    const novaCompra = new Compra({
      idFornecedor,
      dataCompra,
      observacoes,
      notaFiscal: numeroNota,
      itens: itensCompraParaSalvar,
      valorTotal,
    });

    // 4. Passa a compra e os casos de uso para o repositório
    return this.compraRepository.salvar(novaCompra, {
      criarLancamentoUseCase: this.criarLancamentoUseCase,
      contasAPagar // Array com as parcelas geradas
    });
  }
}

module.exports = RegistrarCompraUseCase;