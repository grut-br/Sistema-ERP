const FidelizacaoSequelizeRepository = require('../infrastructure/persistence/FidelizacaoSequelize.repository');
const ResgatarPontosUseCase = require('../application/resgatarPontos.usecase');
const ConsultarSaldoUseCase = require('../application/consultarSaldo.usecase');

class FidelizacaoController {
  constructor() {
    const repo = new FidelizacaoSequelizeRepository();
    this.resgatarPontosUseCase = new ResgatarPontosUseCase(repo);
    this.consultarSaldoUseCase = new ConsultarSaldoUseCase(repo);
    this.resgatar = this.resgatar.bind(this);
    this.consultar = this.consultar.bind(this);
  }

  async consultar(req, res) {
    try {
      const { clienteId } = req.params;
      const perfil = await this.consultarSaldoUseCase.execute({ clienteId: Number(clienteId) });
      res.status(200).json(perfil);
    } catch (error) { res.status(404).json({ error: error.message }); }
  }

  async resgatar(req, res) {
    try {
      const { clienteId } = req.params;
      const { pontos } = req.body;
      const perfil = await this.resgatarPontosUseCase.execute({ clienteId: Number(clienteId), pontos });
      res.status(200).json(perfil);
    } catch (error) { res.status(400).json({ error: error.message }); }
  }
}
module.exports = FidelizacaoController;