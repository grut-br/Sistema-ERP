const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('erp_suplementos', 'root', '#Workbench021', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados:', error);
  }
}

testConnection();

module.exports = sequelize;