const cron = require('node-cron');
const { runVerificacaoValidade } = require('../../../modules/produtos/infrastructure/jobs/notificarValidade.job.js');
// 1. Importe o novo job financeiro
const { runVerificacaoContas } = require('../../../modules/financeiro/infrastructure/jobs/verificarContas.job.js');

function scheduleJobs() {
  console.log('Agendando tarefas diárias...');
  
  // Job de produtos (ex: roda todo dia às 8:00 da manhã)
  cron.schedule('0 8 * * *', runVerificacaoValidade, {
    timezone: "America/Sao_Paulo"
  });

  // 2. Agende o novo job (ex: roda todo dia às 8:05 da manhã)
  cron.schedule('5 8 * * *', runVerificacaoContas, {
    timezone: "America/Sao_Paulo"
  });

  console.log('Tarefas agendadas com sucesso.');
}

module.exports = scheduleJobs;