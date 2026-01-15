const CaixaSessao = require('./models/CaixaSessao.model');
const CaixaMovimentacao = require('./models/CaixaMovimentacao.model');
const { Op } = require('sequelize');

class CaixaSequelizeRepository {
  async buscarSessaoAberta() {
    return await CaixaSessao.findOne({
      where: { status: 'ABERTO' },
      include: [{ model: CaixaMovimentacao, as: 'movimentacoes' }]
    });
  }

  async buscarSessaoPorId(id) {
      return await CaixaSessao.findByPk(id, {
          include: [{ model: CaixaMovimentacao, as: 'movimentacoes' }]
      });
  }

  async abrirSessao(dados) {
    return await CaixaSessao.create(dados);
  }

  async fecharSessao(id, dadosFechamento) {
    const sessao = await CaixaSessao.findByPk(id);
    if (!sessao) throw new Error('Sessão não encontrada');
    return await sessao.update(dadosFechamento);
  }

  async registrarMovimentacao(dados) {
    return await CaixaMovimentacao.create(dados);
  }
}

module.exports = CaixaSequelizeRepository;
