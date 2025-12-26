const express = require('express');
const VendaController = require('./vendas.controller');

const authMiddleware = require('../../../shared/core/middleware/auth.middleware');

const vendaRoutes = express.Router();
const controller = new VendaController();

// Middleware de autenticação
vendaRoutes.use(authMiddleware);

vendaRoutes.post('/', controller.create);
vendaRoutes.get('/:id', controller.getById);
vendaRoutes.get('/', controller.getAll);
vendaRoutes.patch('/:id/cancelar', controller.cancel);

module.exports = vendaRoutes;