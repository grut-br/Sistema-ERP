
const Produto = require('./src/modules/produtos/domain/entities/produto.entity.js');

// Mock Mapper logic from Repository
const ProdutoMapper = {
    toPersistence(entity) {
        return {
            idCategoria: (entity.idCategoria !== undefined) ? entity.idCategoria : entity.id_categoria,
            idFabricante: (entity.idFabricante !== undefined) ? entity.idFabricante : entity.id_fabricante,
            nome: entity.nome,
            precoVenda: entity.precoVenda,
        };
    }
};

async function testUpdateTypes() {
    console.log('--- Testing Update Logic ---');

    // 1. Simulate fetching existing product (id_categoria = 1)
    const produtoExistente = new Produto({
        id: 46,
        nome: 'Produto Teste',
        id_categoria: 1, // Database has snake_case usually or mapped
        precoVenda: 10.00,
        status: 'ATIVO',
        lotes: []
    });

    console.log('Original Entity:', produtoExistente);

    // 2. Simulate Payload from Frontend (idCategoria = 2)
    const dadosParaAtualizar = {
        nome: 'Produto Editado',
        idCategoria: 2, // CamelCase
        precoVenda: 20.00,
    };

    // 3. Apply Update (UseCase logic)
    Object.assign(produtoExistente, dadosParaAtualizar);

    console.log('Updated Entity (after assign):', produtoExistente);
    console.log('produtoExistente.idCategoria:', produtoExistente.idCategoria);
    console.log('produtoExistente.id_categoria:', produtoExistente.id_categoria);

    // 4. Persistence Mapping
    const dataToSave = ProdutoMapper.toPersistence(produtoExistente);

    console.log('Data to Persistence:', dataToSave);

    if (dataToSave.idCategoria === 2) {
        console.log('SUCCESS: idCategoria updated correctly to 2.');
    } else {
        console.log('FAILURE: idCategoria is ' + dataToSave.idCategoria);
    }
}

testUpdateTypes();
