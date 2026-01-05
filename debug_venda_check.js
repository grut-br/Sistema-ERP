
const fs = require('fs');
const sequelize = require('./src/shared/infra/database');
const VendaSequelizeRepository = require('./src/modules/vendas/infrastructure/persistence/VendaSequelize.repository');
const ProdutoSequelizeRepository = require('./src/modules/produtos/infrastructure/persistence/ProdutoSequelize.repository');

async function log(msg) {
    fs.appendFileSync('debug_output.txt', msg + '\n');
    console.log(msg);
}

async function debug() {
  try {
    // Clear previous log
    fs.writeFileSync('debug_output.txt', '');
    
    await sequelize.authenticate();
    await log('Valid database connection');

    const vendaRepo = new VendaSequelizeRepository();
    const produtoRepo = new ProdutoSequelizeRepository();
    vendaRepo.produtoRepository = produtoRepo;

    const vendas = await vendaRepo.listarTodas();
    await log(`Found ${vendas.length} vendas.`);
    
    if (vendas.length > 0) {
        const lastVenda = vendas[0]; 
        await log('Latest Venda ID: ' + lastVenda.id);
        
        // Check raw model query
        const VendaModel = require('./src/modules/vendas/infrastructure/persistence/venda.model');
        const ClienteModel = require('./src/modules/clientes/infrastructure/persistence/cliente.model');
        
        const rawVenda = await VendaModel.findByPk(lastVenda.id, {
            include: [{ model: ClienteModel, as: 'cliente' }]
        });
        
        await log('RAW Sequelize Result - id_cliente: ' + (rawVenda ? rawVenda.idCliente : 'N/A'));
        if (rawVenda && rawVenda.cliente) {
             await log('RAW Sequelize Result - cliente.nome: ' + rawVenda.cliente.nome);
             await log('RAW Sequelize Result - cliente (full): ' + JSON.stringify(rawVenda.cliente.toJSON(), null, 2));
        } else {
             await log('RAW Sequelize Result - cliente is NULL');
        }

        const domainVenda = await vendaRepo.buscarPorId(lastVenda.id);
        await log('Domain Result - cliente: ' + JSON.stringify(domainVenda.cliente, null, 2));
    }

  } catch (err) {
    await log('Debug Error: ' + err.message);
    await log(err.stack);
  }
}

debug();
