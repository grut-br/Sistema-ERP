class Cliente {
  constructor({ id, nome, cpf, dataNascimento, telefone, email, genero, enderecos, limiteFiado }) {
    this.id = id;
    this.nome = nome;
    this.cpf = cpf;
    this.dataNascimento = dataNascimento;
    this.telefone = telefone;
    this.email = email;
    this.genero = genero;
    this.enderecos = enderecos || [];
    this.limiteFiado = limiteFiado;

    this.validar();
  }

  validar() {
    if (!this.nome || this.nome.trim() === '') {
      throw new Error('O nome do cliente é obrigatório.');
    }
    if (this.limiteFiado < 0) {
      throw new Error('O limite de fiado não pode ser negativo.');
    }
  }
}

module.exports = Cliente;