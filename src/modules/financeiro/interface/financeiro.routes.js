const express = require('express');
const FinanceiroController = require('./financeiro.controller');
const authMiddleware = require('../../../shared/core/middleware/auth.middleware');

const financeiroRoutes = express.Router();
const controller = new FinanceiroController();

financeiroRoutes.use(authMiddleware);

// CRUD Padrão
financeiroRoutes.post('/', controller.create);
financeiroRoutes.get('/', controller.getAll);
financeiroRoutes.get('/:id', controller.getById);
financeiroRoutes.put('/:id', controller.update);
financeiroRoutes.delete('/:id', controller.delete);

// Ações de Negócio
financeiroRoutes.patch('/:id/pagar', controller.pay);

// Rota para buscar os "fiados" de um cliente
financeiroRoutes.get('/por-cliente/:clienteId', controller.getByCliente);

module.exports = financeiroRoutes;