const EnderecoModel = require('./endereco.model');

class EnderecoSequelizeRepository {
    /**
     * Salva múltiplos endereços de uma vez (usado na criação de cliente)
     */
    async salvarMuitos(enderecos, transaction) {
        if (!enderecos || enderecos.length === 0) {
            return [];
        }

        const records = enderecos.map(e => ({
            logradouro: e.logradouro,
            numero: e.numero,
            complemento: e.complemento,
            bairro: e.bairro,
            cidade: e.cidade,
            estado: e.estado,
            cep: e.cep,
            titulo: e.titulo,
            id_cliente: e.idCliente
        }));

        return await EnderecoModel.bulkCreate(records, { transaction });
    }

    /**
     * Salva um único endereço
     */
    async salvar(endereco) {
        const record = {
            logradouro: endereco.logradouro,
            numero: endereco.numero,
            complemento: endereco.complemento,
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            estado: endereco.estado,
            cep: endereco.cep,
            titulo: endereco.titulo,
            id_cliente: endereco.idCliente
        };

        const created = await EnderecoModel.create(record);
        return this.toDomain(created);
    }

    /**
     * Busca endereços por cliente ID
     */
    async buscarPorClienteId(clienteId) {
        const records = await EnderecoModel.findAll({
            where: { id_cliente: clienteId },
            order: [['id', 'ASC']]
        });
        return records.map(this.toDomain);
    }

    /**
     * Exclui um endereço por ID
     */
    async deletar(id) {
        await EnderecoModel.destroy({ where: { id } });
    }

    /**
     * Mapper para domínio
     */
    toDomain(model) {
        if (!model) return null;
        const data = model.toJSON ? model.toJSON() : model;
        return {
            id: data.id,
            logradouro: data.logradouro,
            numero: data.numero,
            complemento: data.complemento,
            bairro: data.bairro,
            cidade: data.cidade,
            estado: data.estado,
            cep: data.cep,
            titulo: data.titulo,
            idCliente: data.id_cliente
        };
    }
}

module.exports = EnderecoSequelizeRepository;
