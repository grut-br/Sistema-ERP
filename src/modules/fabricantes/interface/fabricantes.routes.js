const express = require('express');
const FabricanteController = require('./fabricantes.controller');

const router = express.Router();
const controller = new FabricanteController();

router.post('/', controller.create);
router.get('/', controller.getAll);

module.exports = router;
