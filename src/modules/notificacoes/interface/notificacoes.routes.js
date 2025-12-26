const express = require('express');
const NotificacaoController = require('./notificacoes.controller');
const authMiddleware = require('../../../shared/core/middleware/auth.middleware');

const notificacaoRoutes = express.Router();
const controller = new NotificacaoController();

// Protege todas as rotas de notificações
notificacaoRoutes.use(authMiddleware);

notificacaoRoutes.get('/', controller.getAll);
notificacaoRoutes.patch('/:id/lida', controller.markAsRead);

module.exports = notificacaoRoutes;