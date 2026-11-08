const express = require('express');
const loanController = require('./loan.controller');
const authMiddleware = require('../auth/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', loanController.findAll);
router.post('/', loanController.create);
router.patch('/:id/return', loanController.devolver);

module.exports = router;