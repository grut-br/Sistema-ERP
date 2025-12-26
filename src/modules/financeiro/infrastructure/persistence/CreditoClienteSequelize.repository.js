const CreditoClienteModel = require('./creditoCliente.model');
const { sequelize } = require('../../../../shared/infra/database'); // Importe o sequelize para somar

class CreditoClienteSequelizeRepository {
  
  async adicionar(dadosCredito, options = {}) {
    return CreditoClienteModel.create(dadosCredito, options);
  }

  // Método vital: Calcula quanto o cliente tem disponível
  async buscarSaldoCliente(idCliente, options = {}) {
    const creditos = await CreditoClienteModel.findAll({
      where: { idCliente },
      ...options
    });

    // Soma entradas e subtrai saídas
    let saldo = 0;
    creditos.forEach(c => {
      if (c.tipo === 'ENTRADA') saldo += Number(c.valor);
      if (c.tipo === 'SAIDA') saldo -= Number(c.valor);
    });

    return saldo;
  }
}

module.exports = CreditoClienteSequelizeRepository;