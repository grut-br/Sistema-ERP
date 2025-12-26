const express = require('express');
const ClienteController = require('./clientes.controller');

const authMiddleware = require('../../../shared/core/middleware/auth.middleware');

const clienteRoutes = express.Router();
const controller = new ClienteController();

// Middleware de autenticação
clienteRoutes.use(authMiddleware);

clienteRoutes.post('/', controller.create);
clienteRoutes.get('/', controller.getAll);
clienteRoutes.get('/:id', controller.getById);
clienteRoutes.put('/:id', controller.update);
clienteRoutes.delete('/:id', controller.delete);

module.exports = clienteRoutes;