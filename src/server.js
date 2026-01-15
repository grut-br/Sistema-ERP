const express = require('express');
const produtoRoutes = require('./modules/produtos/interface/produtos.routes');
const categoriaRoutes = require('./modules/categorias/interface/categorias.routes');
const clienteRoutes = require('./modules/clientes/interface/clientes.routes');
const vendaRoutes = require('./modules/vendas/interface/vendas.routes');
const usuarioRoutes = require('./modules/usuarios/interface/usuarios.routes');
const fidelizacaoRoutes = require('./modules/fidelizacao/interface/fidelizacao.routes');
const financeiroRoutes = require('./modules/financeiro/interface/financeiro.routes');
const fornecedorRoutes = require('./modules/fornecedores/interface/fornecedores.routes');
const compraRoutes = require('./modules/compras/interface/compras.routes');
const notificacaoRoutes = require('./modules/notificacoes/interface/notificacoes.routes');
const combosRoutes = require('./modules/combos/interface/combos.routes');
const caixaRoutes = require('./modules/caixa/interface/caixa.routes');


// Importe as outras rotas aqui quando as criar...
const scheduleJobs = require('./shared/infra/jobs'); 

const app = express();
app.use(express.json()); // Middleware para entender JSON nas requisições

// Conecta as rotas do módulo de produtos ao path base '/produtos'
app.use('/produtos', produtoRoutes);
app.use('/categorias', categoriaRoutes);
app.use('/clientes', clienteRoutes);
app.use('/vendas', vendaRoutes);
app.use('/usuarios', usuarioRoutes);
app.use(fidelizacaoRoutes);
app.use('/financeiro', financeiroRoutes);
app.use('/fornecedores', fornecedorRoutes);
app.use('/compras', compraRoutes);
app.use('/notificacoes', notificacaoRoutes);
app.use('/combos', combosRoutes);
app.use('/caixa', caixaRoutes);
app.use('/fabricantes', require('./modules/fabricantes/interface/fabricantes.routes'));


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  scheduleJobs(); 
});