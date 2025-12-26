const express = require('express');
const CategoriaController = require('./categorias.controller');

const authMiddleware = require('../../../shared/core/middleware/auth.middleware');

const categoriaRoutes = express.Router();
const controller = new CategoriaController();

// Middleware de autenticação
categoriaRoutes.use(authMiddleware);

categoriaRoutes.post('/', controller.create);
categoriaRoutes.get('/', controller.getAll);
categoriaRoutes.put('/:id', controller.update);
categoriaRoutes.delete('/:id', controller.delete);

module.exports = categoriaRoutes;