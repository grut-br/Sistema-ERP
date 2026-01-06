const CategoriaFinanceira = require('../domain/entities/categoriaFinanceira.entity');

class AtualizarCategoriaUseCase {
  constructor(categoriaRepository) {
    this.categoriaRepository = categoriaRepository;
  }

  async execute(id, dados) {
    const categoriaExistente = await this.categoriaRepository.buscarPorId(id);
    if (!categoriaExistente) throw new Error('Categoria não encontrada.');

    const categoriaAtualizada = new CategoriaFinanceira({
      id,
      nome: dados.nome || categoriaExistente.nome,
      tipo: dados.tipo || categoriaExistente.tipo,
      cor: dados.cor || categoriaExistente.cor,
    });

    return this.categoriaRepository.atualizar(categoriaAtualizada);
  }
}

module.exports = AtualizarCategoriaUseCase;
