class Endereco {
    constructor({ id, logradouro, numero, complemento, bairro, cidade, estado, cep, titulo, idCliente }) {
        this.id = id;
        this.logradouro = logradouro;
        this.numero = numero;
        this.complemento = complemento;
        this.bairro = bairro;
        this.cidade = cidade;
        this.estado = estado;
        this.cep = cep;
        this.titulo = titulo;
        this.idCliente = idCliente;
    }
}

module.exports = Endereco;
