const express = require('express');
const router = express.Router();
const caixaController = require('./caixa.controller');

router.post('/abrir', caixaController.abrir);
router.get('/status', caixaController.status);
router.post('/movimentacao', caixaController.movimentar);
router.post('/fechar', caixaController.fechar);

module.exports = router;
