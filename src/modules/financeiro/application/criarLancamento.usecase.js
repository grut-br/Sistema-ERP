const Lancamento = require('../domain/entities/lancamento.entity');

class CriarLancamentoUseCase {
  constructor(lancamentoRepository) {
    this.lancamentoRepository = lancamentoRepository;
  }

  // Agora recebe um segundo argumento opcional 'options'
  async execute(dadosLancamento, options = {}) {
    const lancamento = new Lancamento(dadosLancamento);
    // Passa o 'options' (que contém a transação) para o repositório
    return this.lancamentoRepository.salvar(lancamento, options);
  }
}

module.exports = CriarLancamentoUseCase;