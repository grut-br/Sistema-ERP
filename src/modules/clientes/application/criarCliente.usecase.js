const Cliente = require('../domain/entities/cliente.entity');
const CriarPerfilFidelidadeUseCase = require('../../fidelizacao/application/criarPerfilFidelidade.usecase');
const FidelizacaoSequelizeRepository = require('../../fidelizacao/infrastructure/persistence/FidelizacaoSequelize.repository');
const EnderecoSequelizeRepository = require('../../enderecos/infrastructure/persistence/EnderecoSequelize.repository');
const sequelize = require('../../../shared/infra/database');

class CriarClienteUseCase {
  constructor(clienteRepository) {
    this.clienteRepository = clienteRepository;
    this.enderecoRepository = new EnderecoSequelizeRepository();

    const fidelizacaoRepo = new FidelizacaoSequelizeRepository();
    this.criarPerfilFidelidade = new CriarPerfilFidelidadeUseCase(fidelizacaoRepo);
  }

  async execute(dadosCliente, enderecos = []) {
    const t = await sequelize.transaction();

    try {
      // 1. Create Cliente
      const novoCliente = new Cliente(dadosCliente);
      const clienteSalvo = await this.clienteRepository.salvar(novoCliente, t);

      // 2. Create Endereços
      if (enderecos && enderecos.length > 0) {
        const enderecosComId = enderecos.map(end => ({
          ...end,
          idCliente: clienteSalvo.id
        }));
        await this.enderecoRepository.salvarMuitos(enderecosComId, t);
      }

      await t.commit(); // Commit transaction

      // 3. Create Fidelidade Profile (outside transaction as requested/implied separation or to avoid fidelity errors rolling back client)
      if (clienteSalvo) {
        await this.criarPerfilFidelidade.execute({ clienteId: clienteSalvo.id });
      }

      return clienteSalvo;

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}
module.exports = CriarClienteUseCase;