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

  async execute({ idFornecedor, dataCompra, observacoes, itens, numeroNota }) {
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
      if (!item.idProduto || !item.quantidade || !item.custoUnitario || !item.validade) {
        throw new Error('idProduto, quantidade, custoUnitario e validade são obrigatórios para todos os itens.');
      }
      
      const produto = await this.produtoRepository.buscarPorId(item.idProduto);
      if (!produto) throw new Error(`Produto com ID ${item.idProduto} não encontrado.`);

      valorTotal += item.custoUnitario * item.quantidade;
      itensCompraParaSalvar.push(new ItemCompra({
        idProduto: item.idProduto,
        quantidade: item.quantidade,
        custoUnitario: item.custoUnitario,
        validade: item.validade, // <-- Novo
        produto: produto,
      }));
    }

    // 2. Cria a entidade de Compra
    const novaCompra = new Compra({
      idFornecedor,
      dataCompra,
      observacoes,
      notaFiscal: numeroNota,
      itens: itensCompraParaSalvar,
      valorTotal,
    });

    // 3. Passa a compra e os casos de uso para o repositório
    return this.compraRepository.salvar(novaCompra, {
      criarLancamentoUseCase: this.criarLancamentoUseCase
    });
  }
}

module.exports = RegistrarCompraUseCase;