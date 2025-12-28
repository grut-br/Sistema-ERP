const express = require('express');
const FabricanteController = require('./fabricantes.controller');

const router = express.Router();
const controller = new FabricanteController();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
