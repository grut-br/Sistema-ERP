const express = require('express');
const CompraController = require('./compras.controller');
const authMiddleware = require('../../../shared/core/middleware/auth.middleware');

const compraRoutes = express.Router();
const controller = new CompraController();

// Protege todas as rotas de compras
compraRoutes.use(authMiddleware);

compraRoutes.post('/', controller.create);
compraRoutes.get('/', controller.getAll);
compraRoutes.get('/:id', controller.getById);
compraRoutes.put('/:id', controller.update);
compraRoutes.delete('/:id', controller.delete);

module.exports = compraRoutes;