const express = require('express');
const FidelizacaoController = require('./fidelizacao.controller');
const authMiddleware = require('../../../shared/core/middleware/auth.middleware');

const fidelizacaoRoutes = express.Router();
const controller = new FidelizacaoController();

// Todas as rotas de fidelização são protegidas
fidelizacaoRoutes.use(authMiddleware);

// Rotas aninhadas sob 'clientes' para manter o contexto
fidelizacaoRoutes.get('/clientes/:clienteId/fidelizacao', controller.consultar);
fidelizacaoRoutes.post('/clientes/:clienteId/fidelizacao/resgatar', controller.resgatar);

module.exports = fidelizacaoRoutes;