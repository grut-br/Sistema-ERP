const bcrypt = require('bcryptjs');

class Usuario {
  constructor({ id, nome, email, usuario, senha, tipo }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.usuario = usuario;
    this.senha = senha; // O hash
    this.tipo = tipo;
  }

  async compararSenha(senhaPura) {
    return bcrypt.compare(senhaPura, this.senha);
  }

  toJSON() {
    const { senha, ...user } = this;
    return user;
  }
}

module.exports = Usuario;