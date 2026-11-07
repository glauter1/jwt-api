const express = require('express');
const categoryController = require('./category.controller');

const router = express.Router();

router.get('/', categoryController.findAll);
router.get('/:id', categoryController.findById);
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.remove);

module.exports = router;