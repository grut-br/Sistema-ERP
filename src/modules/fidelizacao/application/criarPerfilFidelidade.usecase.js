const Fidelizacao = require('../domain/entities/fidelizacao.entity');
class CriarPerfilFidelidadeUseCase {
  constructor(repository) { this.repository = repository; }
  async execute({ clienteId }) {
    const perfil = new Fidelizacao({ idCliente: clienteId, pontosSaldo: 0 });
    return this.repository.salvar(perfil);
  }
}
module.exports = CriarPerfilFidelidadeUseCase;