const express = require('express');
const CombosController = require('./combos.controller');
const authMiddleware = require('../../../shared/core/middleware/auth.middleware');

const combosRoutes = express.Router();
const controller = new CombosController();

combosRoutes.use(authMiddleware);
combosRoutes.post('/', controller.create);

module.exports = combosRoutes;