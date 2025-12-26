class VerificarValidadeProdutosUseCase {
  constructor(produtoRepository, criarNotificacaoUseCase) {
    this.produtoRepository = produtoRepository;
    this.criarNotificacaoUseCase = criarNotificacaoUseCase;
  }

  async execute({ diasParaVencer }) {
    console.log('[Job] Executando verificação de validade de LOTES...');
    
    const lotes = await this.produtoRepository.buscarLotesProximosDoVencimento(diasParaVencer);

    if (lotes.length === 0) {
      console.log('[Job] Nenhum lote próximo do vencimento.');
      return;
    }

    // Cria uma notificação para cada LOTE
    for (const lote of lotes) {
      const mensagem = `Atenção: O Lote #${lote.id} do produto "${lote.produtoNome}" (Produto ID: ${lote.idProduto}) está vencendo. Restam ${lote.quantidade} un. Validade: ${lote.validade}.`;
      
      await this.criarNotificacaoUseCase.execute({
        tipo: 'PRODUTO_VENCENDO',
        mensagem: mensagem,
        idReferencia: lote.idProduto, // Referencia o produto
        referenciaTipo: 'PRODUTO' // Ou podemos mudar para 'LOTE'
      });
    }
    console.log(`[Job] ${lotes.length} notificações de vencimento de lote criadas.`);
  }
}

module.exports = VerificarValidadeProdutosUseCase;