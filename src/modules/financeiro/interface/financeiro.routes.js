const express = require('express');
const FinanceiroController = require('./financeiro.controller');
const CategoriasController = require('./categorias.controller');
const authMiddleware = require('../../../shared/core/middleware/auth.middleware');

const financeiroRoutes = express.Router();
const controller = new FinanceiroController();
const categoriasController = new CategoriasController();

financeiroRoutes.use(authMiddleware);

// ==========================================
// ROTAS DE CATEGORIAS FINANCEIRAS
// ==========================================
financeiroRoutes.post('/categorias', categoriasController.create);
financeiroRoutes.get('/categorias', categoriasController.getAll);
financeiroRoutes.get('/categorias/:id', categoriasController.getById);
financeiroRoutes.put('/categorias/:id', categoriasController.update);
financeiroRoutes.delete('/categorias/:id', categoriasController.delete);

// ==========================================
// ROTAS DE LANÇAMENTOS (CRUD Padrão)
// ==========================================
financeiroRoutes.post('/', controller.create);
financeiroRoutes.get('/', controller.getAll);
financeiroRoutes.get('/:id', controller.getById);
financeiroRoutes.put('/:id', controller.update);
financeiroRoutes.delete('/:id', controller.delete);

// Ações de Negócio
financeiroRoutes.patch('/:id/pagar', controller.pay);
financeiroRoutes.post('/:id/baixar', controller.baixar);

// Histórico de pagamentos de um lançamento
financeiroRoutes.get('/lancamentos/:id/historico', controller.getHistoricoPagamentos);

// Rota para buscar os "fiados" de um cliente
financeiroRoutes.get('/por-cliente/:clienteId', controller.getByCliente);

module.exports = financeiroRoutes;
