const IClienteRepository = require('../../domain/repositories/IClienteRepository');
const ClienteModel = require('./cliente.model');
const Cliente = require('../../domain/entities/cliente.entity');

const Endereco = require('../../../enderecos/domain/entities/endereco.entity');
const EnderecoModel = require('../../../enderecos/infrastructure/persistence/endereco.model');
const FidelizacaoModel = require('../../../fidelizacao/infrastructure/persistence/fidelizacao.model');
const CreditoClienteModel = require('../../../financeiro/infrastructure/persistence/creditoCliente.model');
const LancamentoModel = require('../../../financeiro/infrastructure/persistence/lancamento.model');
const { Op, fn, col, literal } = require('sequelize');

const ClienteMapper = {
  toDomain: (model) => {
    if (!model) return null;
    const data = model.toJSON ? model.toJSON() : model;

    let enderecos = [];
    if (data.enderecos && Array.isArray(data.enderecos)) {
      enderecos = data.enderecos.map(e => new Endereco({
        id: e.id,
        logradouro: e.logradouro,
        numero: e.numero,
        complemento: e.complemento,
        bairro: e.bairro,
        cidade: e.cidade,
        estado: e.estado,
        cep: e.cep,
        titulo: e.titulo,
        idCliente: e.id_cliente
      }));
    }

    // Map Fidelizacao points
    const pontos = data.Fidelizacao ? data.Fidelizacao.pontosSaldo : 0;

    return new Cliente({
      ...data,
      dataNascimento: data.data_nascimento || data.dataNascimento,
      limiteFiado: data.limite_fiado || data.limiteFiado,
      enderecos: enderecos,
      pontos: pontos
    });
  },
  toPersistence: (entity) => ({
    nome: entity.nome,
    cpf: entity.cpf,
    dataNascimento: entity.dataNascimento,
    genero: entity.genero,
    telefone: entity.telefone,
    email: entity.email,
    limiteFiado: entity.limiteFiado
  })
};

class ClienteSequelizeRepository extends IClienteRepository {
  async salvar(cliente, transaction = null) {
    const data = ClienteMapper.toPersistence(cliente);
    const options = transaction ? { transaction } : {};
    const newModel = await ClienteModel.create(data, options);
    return ClienteMapper.toDomain(newModel);
  }

  async buscarPorId(id) {
    const model = await ClienteModel.findByPk(id, {
        include: [
            { model: FidelizacaoModel },
            { model: EnderecoModel, as: 'enderecos' }
        ]
    });
    return ClienteMapper.toDomain(model);
  }

  async buscarTodos() {
    const models = await ClienteModel.findAll({
        include: [
            { model: FidelizacaoModel },
            { model: EnderecoModel, as: 'enderecos' }
        ],
        order: [['nome', 'ASC']]
    });
    return models.map(ClienteMapper.toDomain);
  }

  /**
   * Busca todos os clientes com dados enriquecidos para o dashboard
   * @param {Object} filtros - Filtros opcionais (inadimplente, comCredito, aniversariantes, status, search)
   * @returns {Array} Lista de clientes com saldoPontos, saldoCredito, temPendencia, endereco
   */
  async buscarTodosEnriquecidos(filtros = {}) {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1; // 1-12
    
    // 1. Busca todos os clientes com includes básicos
    const whereClause = {};
    
    // Filtro de busca por nome ou CPF
    if (filtros.search) {
      whereClause[Op.or] = [
        { nome: { [Op.like]: `%${filtros.search}%` } },
        { cpf: { [Op.like]: `%${filtros.search}%` } }
      ];
    }

    const clientes = await ClienteModel.findAll({
      where: whereClause,
      include: [
        { model: FidelizacaoModel },
        { model: EnderecoModel, as: 'enderecos' }
      ],
      order: [['nome', 'ASC']]
    });

    // 2. Para cada cliente, calcular dados adicionais
    const clientesEnriquecidosPromises = clientes.map(async (cliente) => {
      const clienteData = cliente.toJSON();
      
      // Saldo de Pontos (já vem do Fidelizacao include)
      const saldoPontos = clienteData.Fidelizacao?.pontosSaldo || 0;
      
      // Saldo de Crédito (soma ENTRADA - soma SAIDA)
      const creditosEntrada = await CreditoClienteModel.sum('valor', {
        where: { idCliente: cliente.id, tipo: 'ENTRADA' }
      }) || 0;
      const creditosSaida = await CreditoClienteModel.sum('valor', {
        where: { idCliente: cliente.id, tipo: 'SAIDA' }
      }) || 0;
      const saldoCredito = Number(creditosEntrada) - Number(creditosSaida);
      
      // Tem Pendência (lançamento PENDENTE com vencimento < hoje)
      const pendenciasCount = await LancamentoModel.count({
        where: {
          idCliente: cliente.id,
          status: 'PENDENTE',
          dataVencimento: { [Op.lt]: hoje }
        }
      });
      const temPendencia = pendenciasCount > 0;
      
      // Endereço principal (primeiro endereço)
      const enderecoPrincipal = clienteData.enderecos?.[0] || null;
      const cidade = enderecoPrincipal?.cidade || '';
      const bairro = enderecoPrincipal?.bairro || '';
      
      // É aniversariante do mês
      let aniversarianteDoMes = false;
      if (clienteData.dataNascimento || clienteData.data_nascimento) {
        const dataNasc = new Date(clienteData.dataNascimento || clienteData.data_nascimento);
        aniversarianteDoMes = (dataNasc.getMonth() + 1) === mesAtual;
      }
      
      return {
        id: cliente.id,
        nome: clienteData.nome,
        cpf: clienteData.cpf,
        telefone: clienteData.telefone,
        email: clienteData.email,
        genero: clienteData.genero,
        dataNascimento: clienteData.dataNascimento || clienteData.data_nascimento,
        limiteFiado: Number(clienteData.limiteFiado || clienteData.limite_fiado || 0),
        // Dados enriquecidos
        saldoPontos: Number(saldoPontos),
        saldoCredito: Number(saldoCredito),
        temPendencia,
        cidade,
        bairro,
        aniversarianteDoMes
      };
    });
    
    let clientesEnriquecidos = await Promise.all(clientesEnriquecidosPromises);
    
    // 3. Aplicar filtros booleanos
    if (filtros.inadimplente === 'true' || filtros.inadimplente === true) {
      clientesEnriquecidos = clientesEnriquecidos.filter(c => c.temPendencia);
    }
    
    if (filtros.comCredito === 'true' || filtros.comCredito === true) {
      clientesEnriquecidos = clientesEnriquecidos.filter(c => c.saldoCredito > 0);
    }
    
    if (filtros.aniversariantes === 'true' || filtros.aniversariantes === true) {
      clientesEnriquecidos = clientesEnriquecidos.filter(c => c.aniversarianteDoMes);
    }
    
    return clientesEnriquecidos;
  }

  async atualizar(cliente) {
    const data = ClienteMapper.toPersistence(cliente);
    await ClienteModel.update(data, { where: { id: cliente.id } });
    const updatedModel = await this.buscarPorId(cliente.id);
    return ClienteMapper.toDomain(updatedModel);
  }

  async deletar(id) {
    await ClienteModel.destroy({ where: { id } });
  }
}
module.exports = ClienteSequelizeRepository;