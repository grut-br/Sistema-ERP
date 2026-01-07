const express = require('express');
const ClienteController = require('./clientes.controller');
const ClienteFinanceiroController = require('./clienteFinanceiro.controller');

const authMiddleware = require('../../../shared/core/middleware/auth.middleware');

const clienteRoutes = express.Router();
const controller = new ClienteController();
const financeiroController = new ClienteFinanceiroController();

// Middleware de autenticação
clienteRoutes.use(authMiddleware);

clienteRoutes.post('/', controller.create);
clienteRoutes.get('/', controller.getAll);
clienteRoutes.get('/:id/info-financeira', controller.getFinancialInfo);
clienteRoutes.get('/:id/pendencias', financeiroController.getPendencias);
clienteRoutes.post('/:id/pendencias/pagar-todas', financeiroController.pagarTodasPendencias);
clienteRoutes.get('/:id/historico-compras', controller.getHistoricoCompras);
clienteRoutes.get('/:id/enderecos', controller.getEnderecos);
clienteRoutes.post('/:id/enderecos', controller.addEndereco);
clienteRoutes.delete('/:clienteId/enderecos/:enderecoId', controller.deleteEndereco);
clienteRoutes.get('/:id', controller.getById);
clienteRoutes.put('/:id', controller.update);
clienteRoutes.delete('/:id', controller.delete);

module.exports = clienteRoutes;