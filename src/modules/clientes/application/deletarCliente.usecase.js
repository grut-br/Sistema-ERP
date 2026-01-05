const sequelize = require('../../../shared/infra/database');
const VendaModel = require('../../vendas/infrastructure/persistence/venda.model');
const EnderecoModel = require('../../enderecos/infrastructure/persistence/endereco.model');
const FidelizacaoModel = require('../../fidelizacao/infrastructure/persistence/fidelizacao.model');
const CreditoClienteModel = require('../../financeiro/infrastructure/persistence/creditoCliente.model');
const ClienteModel = require('../infrastructure/persistence/cliente.model');

class DeletarClienteUseCase {
  constructor(clienteRepository) {
    this.clienteRepository = clienteRepository;
  }

  /**
   * Exclui um cliente de forma segura
   * Verifica se há vendas antes de excluir
   * Remove registros relacionados em transação
   */
  async execute(id) {
    // 1. Verificar se cliente tem vendas
    const vendasCount = await VendaModel.count({ where: { idCliente: id } });
    
    if (vendasCount > 0) {
      throw new Error('Não é possível excluir cliente com histórico de vendas.');
    }

    // 2. Excluir em transação: enderecos, fidelizacao, creditos, cliente
    const t = await sequelize.transaction();
    
    try {
      // Excluir endereços
      await EnderecoModel.destroy({ where: { id_cliente: id }, transaction: t });
      
      // Excluir perfil de fidelidade
      await FidelizacaoModel.destroy({ where: { idCliente: id }, transaction: t });
      
      // Excluir créditos
      await CreditoClienteModel.destroy({ where: { idCliente: id }, transaction: t });
      
      // Excluir cliente
      await ClienteModel.destroy({ where: { id }, transaction: t });
      
      await t.commit();
      
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

module.exports = DeletarClienteUseCase;