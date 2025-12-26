const Produto = require('../../produtos/domain/entities/produto.entity');

class CriarComboUseCase {
  constructor(produtoRepository, composicaoRepository, categoriaRepository) {
    this.produtoRepository = produtoRepository;
    this.composicaoRepository = composicaoRepository;
    this.categoriaRepository = categoriaRepository;
  }

  // Removemos 'precoVenda' dos argumentos obrigatórios, pois vamos calcular
  async execute({ nome, descricao, itens, idCategoria }) {
    if (!itens || itens.length === 0) {
      throw new Error('Um combo precisa ter pelo menos um produto.');
    }

    // --- LÓGICA DA OPÇÃO 1: CÁLCULO AUTOMÁTICO ---
    // Nós somamos os itens para definir o preço do combo
    const precoVendaCalculado = itens.reduce((acc, item) => {
      // O 'precoNoCombo' é obrigatório para cada item agora
      if (!item.precoNoCombo) {
        throw new Error('É necessário definir o preço de cada item no combo.');
      }
      return acc + (Number(item.precoNoCombo) * Number(item.quantidade));
    }, 0);
    // ----------------------------------------------

    // Lógica da Categoria Padrão (Mantida igual)
    let categoriaFinal = idCategoria;
    if (!categoriaFinal) {
      const categorias = await this.categoriaRepository.buscarTodas();
      const catPadrao = categorias.find(c => c.nome === 'Kits e Combos');
      if (catPadrao) {
        categoriaFinal = catPadrao.id;
      } else {
        const novaCat = await this.categoriaRepository.salvar({ nome: 'Kits e Combos' });
        categoriaFinal = novaCat.id;
      }
    }

    const novoComboEntity = new Produto({
      nome,
      descricao,
      precoVenda: precoVendaCalculado, // ✅ Usamos o valor calculado pelo sistema
      eKit: true,
      id_categoria: categoriaFinal,
      codigoBarras: null,
      urlImagem: null
    });

    const comboSalvo = await this.produtoRepository.salvar(novoComboEntity);

    const componentesParaSalvar = itens.map(item => ({
      idProdutoPai: comboSalvo.id,
      idProdutoFilho: item.idProduto,
      quantidade: item.quantidade,
      precoNoCombo: item.precoNoCombo
    }));

    await this.composicaoRepository.salvarMuitos(componentesParaSalvar);

    return {
      ...comboSalvo,
      itens: componentesParaSalvar
    };
  }
}

module.exports = CriarComboUseCase;