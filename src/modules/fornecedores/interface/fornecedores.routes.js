const express = require('express');
const FornecedorController = require('./fornecedores.controller');
const authMiddleware = require('../../../shared/core/middleware/auth.middleware');

const fornecedorRoutes = express.Router();
const controller = new FornecedorController();

// Protege todas as rotas de fornecedores
fornecedorRoutes.use(authMiddleware);

fornecedorRoutes.post('/', controller.create);
fornecedorRoutes.get('/', controller.getAll);
fornecedorRoutes.get('/:id', controller.getById);
fornecedorRoutes.put('/:id', controller.update);
fornecedorRoutes.delete('/:id', controller.delete);

module.exports = fornecedorRoutes;