// Importações dos novos repositórios e casos de uso
const ProdutoSequelizeRepository = require('../../produtos/infrastructure/persistence/ProdutoSequelize.repository');
const FidelizacaoSequelizeRepository = require('../../fidelizacao/infrastructure/persistence/FidelizacaoSequelize.repository');
const LancamentoSequelizeRepository = require('../../financeiro/infrastructure/persistence/LancamentoSequelize.repository');
const EstornarPontosUseCase = require('../../fidelizacao/application/estornarPontos.usecase');
const CancelarFiadoPorVendaUseCase = require('../../financeiro/application/cancelarFiadoPorVenda.usecase');

class CancelarVendaUseCase {
  constructor(vendaRepository) {
    this.vendaRepository = vendaRepository;
    // Instancia todas as dependências necessárias
    this.produtoRepository = new ProdutoSequelizeRepository();
    const fidelizacaoRepo = new FidelizacaoSequelizeRepository();
    const lancamentoRepo = new LancamentoSequelizeRepository();
    
    this.estornarPontosUseCase = new EstornarPontosUseCase(fidelizacaoRepo);
    this.cancelarFiadoUseCase = new CancelarFiadoPorVendaUseCase(lancamentoRepo);
  }

  async execute(vendaId) {
    const venda = await this.vendaRepository.buscarPorId(vendaId);
    if (!venda) {
      throw new Error('Venda não encontrada.');
    }
    if (venda.status === 'CANCELADA') {
      throw new Error('Esta venda já foi cancelada.');
    }

    // Passa a venda e os casos de uso para o repositório
    return this.vendaRepository.cancelar(venda, {
      produtoRepository: this.produtoRepository,
      estornarPontosUseCase: this.estornarPontosUseCase,
      cancelarFiadoUseCase: this.cancelarFiadoUseCase
    });
  }
}
module.exports = CancelarVendaUseCase;