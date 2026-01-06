/**
 * Entidade de Categoria Financeira
 * Usada para classificar receitas e despesas em relatórios
 */
class CategoriaFinanceira {
  constructor({ id, nome, tipo, cor }) {
    this.id = id;
    this.nome = nome;
    this.tipo = tipo;
    this.cor = cor || '#6B7280';

    this.validar();
  }

  validar() {
    if (!this.nome || this.nome.trim() === '') {
      throw new Error('Nome da categoria é obrigatório.');
    }
    if (!this.tipo || !['RECEITA', 'DESPESA'].includes(this.tipo)) {
      throw new Error('Tipo deve ser RECEITA ou DESPESA.');
    }
    // Valida formato de cor hexadecimal
    if (this.cor && !/^#[0-9A-Fa-f]{6}$/.test(this.cor)) {
      throw new Error('Cor deve estar no formato hexadecimal (#RRGGBB).');
    }
  }
}

module.exports = CategoriaFinanceira;
