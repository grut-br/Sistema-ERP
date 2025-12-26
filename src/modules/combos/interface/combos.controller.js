const ProdutoSequelizeRepository = require('../../produtos/infrastructure/persistence/ProdutoSequelize.repository');
const ComposicaoSequelizeRepository = require('../infrastructure/persistence/ComposicaoSequelize.repository');
// 1. Importe o repositório de categorias
const CategoriaSequelizeRepository = require('../../categorias/infrastructure/persistence/CategoriaSequelize.repository');
const CriarComboUseCase = require('../application/criarCombo.usecase');

class CombosController {
  constructor() {
    const produtoRepo = new ProdutoSequelizeRepository();
    const composicaoRepo = new ComposicaoSequelizeRepository();
    // 2. Instancie o repo de categorias
    const categoriaRepo = new CategoriaSequelizeRepository();
    
    // 3. Passe os 3 repositórios para o UseCase
    this.criarComboUseCase = new CriarComboUseCase(produtoRepo, composicaoRepo, categoriaRepo);
    
    this.create = this.create.bind(this);
  }

  async create(req, res) {
    try {
      const combo = await this.criarComboUseCase.execute(req.body);
      res.status(201).json(combo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
module.exports = CombosController;