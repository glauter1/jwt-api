const express = require('express');
const readerController = require('./reader.controller');

const router = express.Router();

router.get('/', readerController.findAll);
router.get('/:id', readerController.findById);
router.get('/:id/loans', readerController.findLoans);
router.post('/', readerController.create);
router.put('/:id', readerController.update);

module.exports = router;