const ComposicaoKitModel = require('../../../produtos/infrastructure/persistence/composicaoKit.model');

class ComposicaoSequelizeRepository {
  async salvarMuitos(listaComponentes) {
    // BulkCreate é ótimo para salvar vários itens de uma vez
    return ComposicaoKitModel.bulkCreate(listaComponentes);
  }
}

module.exports = ComposicaoSequelizeRepository;