class Produto {
  constructor({ id, nome, descricao, id_categoria, idCategoria, categoria, precoCusto, precoVenda, quantidadeEstoque, estoqueMinimo, dataValidade, codigoBarras, urlImagem, eKit, id_fabricante, idFabricante, fabricante, status, lotes }) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
    this.id_categoria = id_categoria || idCategoria; // Aceita snake_case ou camelCase
    this.categoria = categoria; // Armazena o objeto completo da categoria (ex: { id: 1, nome: 'Proteína' })
    this.id_fabricante = id_fabricante || idFabricante;
    this.fabricante = fabricante; // Objeto fabricante { id, nome }
    this.precoCusto = precoCusto;
    this.precoVenda = precoVenda;
    this.quantidadeEstoque = quantidadeEstoque;
    this.estoqueMinimo = estoqueMinimo;
    this.dataValidade = dataValidade;
    this.codigoBarras = codigoBarras;
    this.urlImagem = urlImagem;
    this.eKit = !!eKit;
    // this.fabricante string removed, now using object above
    this.status = status || 'ATIVO';

    this.lotes = lotes || [];
    this.estoque = this.lotes.reduce((acc, lote) => acc + (lote.quantidade || 0), 0);

    // Calculate Weighted Average Cost
    const totalEstoque = this.lotes.reduce((acc, lote) => acc + Number(lote.quantidade), 0);
    const valorTotal = this.lotes.reduce((acc, lote) => acc + (Number(lote.quantidade) * Number(lote.custoUnitario || 0)), 0);
    
    // If we have lots, calculate average. Otherwise, use provided precoCusto (from DB cache) or 0
    if (totalEstoque > 0) {
      this.precoCusto = valorTotal / totalEstoque;
    } else {
      this.precoCusto = Number(precoCusto) || 0;
    }


    this.validar();
  }

  validar() {
    // Validamos apenas o essencial para o cadastro: Nome e Preço de Venda.
    // Preço de Custo e Estoque são gerenciados via Lotes.
    if (!this.nome || this.precoVenda <= 0) {
      throw new Error('Dados do produto inválidos. Nome e Preço de Venda são obrigatórios.');
    }
  }
}

module.exports = Produto;