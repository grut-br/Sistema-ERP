const ProdutoModel = require('../src/modules/produtos/infrastructure/persistence/produto.model');
const sequelize = require('../src/shared/infra/database');

async function migrate() {
  try {
    console.log('Iniciando migração de status...');
    await sequelize.authenticate();
    console.log('Conexão estabelecida.');

    // Update all products with status 'SEM_ESTOQUE' to 'ATIVO'
    const [results, metadata] = await sequelize.query(
      "UPDATE produtos SET status = 'ATIVO' WHERE status = 'SEM_ESTOQUE'"
    );

    console.log(`Migração concluída. Registros afetados: ${metadata?.affectedRows || results?.affectedRows || 'Desconhecido'}`);
  } catch (error) {
    console.error('Erro na migração:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();
