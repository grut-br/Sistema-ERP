const express = require('express');
const UsuarioController = require('./usuarios.controller');
const authMiddleware = require('../../../shared/core/middleware/auth.middleware');

const usuarioRoutes = express.Router();
const controller = new UsuarioController();

// --- Rotas Públicas ---
usuarioRoutes.post('/login', controller.login);// Qualquer um pode tentar fazer login

// --- Rotas Protegidas ---
// A partir daqui, todas as rotas exigirão um token válido
usuarioRoutes.use(authMiddleware);

usuarioRoutes.post('/', controller.create); // Qualquer um pode se cadastrar (criar o primeiro usuário)
usuarioRoutes.get('/', controller.getAll);
usuarioRoutes.get('/:id', controller.getById);
usuarioRoutes.put('/:id', controller.update);
usuarioRoutes.delete('/:id', controller.delete);
usuarioRoutes.patch('/mudar-senha', controller.changePassword);
usuarioRoutes.patch('/:id/atribuir-permissao', controller.assignPermission);

module.exports = usuarioRoutes;