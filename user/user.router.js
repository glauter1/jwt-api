const { Router } = require('express');
const router = Router();

const userController = require('./user.controller');
const authMiddleware = require('../auth/auth.middleware');
const isAdmin = require('../auth/isAdmin.middleware');

router.use(authMiddleware, isAdmin);

router.post('/', userController.create);
router.get('/', userController.findAll);
router.get('/email/:email', userController.findByEmail);
router.get('/:id', userController.findById);
router.put('/:id', userController.update);
router.patch('/:id/active', userController.setActive);

module.exports = router;