const express = require('express');
const bookController = require('./book.controller');

const router = express.Router();

router.get('/', bookController.findAll);
router.get('/:id', bookController.findById);
router.post('/', bookController.create);
router.put('/:id', bookController.update);
router.delete('/:id', bookController.remove);

module.exports = router;