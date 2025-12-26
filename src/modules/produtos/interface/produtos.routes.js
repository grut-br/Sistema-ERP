const express = require('express');
const ProdutoController = require('./produtos.controller');

const authMiddleware = require('../../../shared/core/middleware/auth.middleware');

const produtoRoutes = express.Router();
const produtoController = new ProdutoController();

// Middleware de autenticação
produtoRoutes.use(authMiddleware);

produtoRoutes.post('/', produtoController.create);
produtoRoutes.get('/:id', produtoController.getById);
produtoRoutes.get('/', produtoController.getAll);
produtoRoutes.patch('/:id/estoque', produtoController.updateStock);
produtoRoutes.put('/:id', produtoController.update);
produtoRoutes.delete('/:id', produtoController.delete);


module.exports = produtoRoutes;