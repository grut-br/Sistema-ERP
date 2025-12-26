class Notificacao {
  constructor({ id, tipo, mensagem, idReferencia, referenciaTipo, status, data_criacao }) {
    this.id = id;
    this.tipo = tipo;
    this.mensagem = mensagem;
    this.idReferencia = idReferencia;
    this.referenciaTipo = referenciaTipo;
    this.status = status || 'PENDENTE';
    this.dataCriacao = data_criacao; // Mapeia do 'data_criacao' do banco
  }

  marcarComoLida() {
    if (this.status === 'LIDA') {
      throw new Error('Notificação já foi lida.');
    }
    this.status = 'LIDA';
  }
}

module.exports = Notificacao;