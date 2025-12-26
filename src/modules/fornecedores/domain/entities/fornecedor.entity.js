class Fornecedor {
  constructor({ id, nome, cnpj, telefone, email, endereco }) {
    this.id = id;
    this.nome = nome;
    this.cnpj = cnpj;
    this.telefone = telefone;
    this.email = email;
    this.endereco = endereco;

    this.validar();
  }

  validar() {
    if (!this.nome || this.nome.trim() === '') {
      throw new Error('O nome do fornecedor é obrigatório.');
    }
  }
}

module.exports = Fornecedor;