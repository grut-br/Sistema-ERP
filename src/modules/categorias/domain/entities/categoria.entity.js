class Categoria {
  constructor({ id, nome, dataCadastro }) {
    this.id = id;
    this.nome = nome;
    this.dataCadastro = dataCadastro;

    this.validar();
  }

  validar() {
    if (!this.nome || this.nome.trim() === '') {
      throw new Error('O nome da categoria é obrigatório.');
    }
  }
}

module.exports = Categoria;