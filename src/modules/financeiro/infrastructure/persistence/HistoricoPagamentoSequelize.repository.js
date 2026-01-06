const HistoricoPagamentoModel = require('./historicoPagamento.model');

class HistoricoPagamentoSequelizeRepository {
  async salvar(dados, options = {}) {
    return HistoricoPagamentoModel.create({
      idLancamento: dados.idLancamento,
      valor: dados.valor,
      formaPagamento: dados.formaPagamento || 'DINHEIRO',
      observacao: dados.observacao,
      dataPagamento: dados.dataPagamento || new Date(),
    }, options);
  }

  async buscarPorLancamentoId(idLancamento) {
    return HistoricoPagamentoModel.findAll({
      where: { idLancamento },
      order: [['data_pagamento', 'DESC']]
    });
  }
}

module.exports = HistoricoPagamentoSequelizeRepository;
