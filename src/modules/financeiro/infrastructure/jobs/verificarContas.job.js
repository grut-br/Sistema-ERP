const LancamentoSequelizeRepository = require('../persistence/LancamentoSequelize.repository');
const VerificarContasVencendoUseCase = require('../../application/verificarContasVencendo.usecase');

// Importa os componentes do módulo de notificações
const NotificacaoSequelizeRepository = require('../../../notificacoes/infrastructure/persistence/NotificacaoSequelize.repository');
const CriarNotificacaoUseCase = require('../../../notificacoes/application/criarNotificacao.usecase');

async function runVerificacaoContas() {
  const lancamentoRepo = new LancamentoSequelizeRepository();
  const notificacaoRepo = new NotificacaoSequelizeRepository();

  const criarNotificacaoUseCase = new CriarNotificacaoUseCase(notificacaoRepo);

  const verificarContas = new VerificarContasVencendoUseCase(
    lancamentoRepo,
    criarNotificacaoUseCase
  );
  
  await verificarContas.execute({ diasParaVencer: 3 });
}

module.exports = { runVerificacaoContas };