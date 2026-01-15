const CaixaSequelizeRepository = require('../infrastructure/persistence/CaixaSequelize.repository');
const AbrirCaixaUseCase = require('../application/abrirCaixa.usecase');
const ObterStatusCaixaUseCase = require('../application/obterStatusCaixa.usecase');
const FecharCaixaUseCase = require('../application/fecharCaixa.usecase');
const RegistrarMovimentacaoCaixaUseCase = require('../application/registrarMovimentacao.usecase');

const caixaRepository = new CaixaSequelizeRepository();
const abrirCaixaUseCase = new AbrirCaixaUseCase(caixaRepository);
const obterStatusCaixaUseCase = new ObterStatusCaixaUseCase(caixaRepository);
const fecharCaixaUseCase = new FecharCaixaUseCase(caixaRepository);
const registrarMovimentacaoCaixaUseCase = new RegistrarMovimentacaoCaixaUseCase(caixaRepository);

class CaixaController {
  async abrir(req, res) {
    try {
      const { saldo_inicial, id_usuario } = req.body;
      const sessao = await abrirCaixaUseCase.execute({ 
          idUsuario: id_usuario || req.headers['x-user-id'] || 1, // Fallback purely for dev if auth missing
          saldoInicial: saldo_inicial
      });
      res.status(201).json(sessao);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async status(req, res) {
    try {
      const status = await obterStatusCaixaUseCase.execute();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async movimentar(req, res) {
    try {
      const { id_sessao, tipo, valor, descricao, forma_pagamento } = req.body;
      const mov = await registrarMovimentacaoCaixaUseCase.execute({
        idSessao: id_sessao,
        tipo,
        valor,
        descricao,
        formaPagamento: forma_pagamento
      });
      res.status(201).json(mov);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async fechar(req, res) {
    try {
      const { id_sessao, saldo_final_informado } = req.body;
      const resultado = await fecharCaixaUseCase.execute({
        idSessao: id_sessao,
        saldoFinalInformado: saldo_final_informado
      });
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CaixaController();
