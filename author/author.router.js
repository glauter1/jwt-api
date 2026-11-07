const express = require('express');
const authorController = require('./author.controller');

const router = express.Router();

router.get('/', authorController.findAll);
router.get('/:id', authorController.findById);
router.post('/', authorController.create);
router.put('/:id', authorController.update);
router.delete('/:id', authorController.remove);

module.exports = router;