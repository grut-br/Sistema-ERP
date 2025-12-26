const EnderecoModel = require('./endereco.model');

class EnderecoSequelizeRepository {
    async salvarMuitos(enderecos, transaction) {
        if (!enderecos || enderecos.length === 0) {
            return [];
        }

        // Map domain entities to persistence objects if needed, 
        // but assuming simple object structure compatibility for bulkCreate.
        // If 'enderecos' are Domain Entities, we might need a mapper. 
        // For now, assuming they come as objects compatible with the model.
        // Let's be safe and map them.

        // Actually, usually bulkCreate expects array of objects with keys matching model attributes.

        const records = enderecos.map(e => ({
            logradouro: e.logradouro,
            numero: e.numero,
            complemento: e.complemento,
            bairro: e.bairro,
            cidade: e.cidade,
            estado: e.estado,
            cep: e.cep,
            titulo: e.titulo,
            id_cliente: e.idCliente // Mapping camelCase entity to snake_case DB column convention if needed, or if model handles it.
            // In model we defined 'id_cliente'.
        }));

        await EnderecoModel.bulkCreate(records, { transaction });
    }
}

module.exports = EnderecoSequelizeRepository;
