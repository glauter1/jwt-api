const express = require('express');
const reportController = require('./report.controller');
const authMiddleware = require('../auth/auth.middleware');
const isAdmin = require('../auth/isAdmin.middleware');

const router = express.Router();

router.use(authMiddleware, isAdmin);

router.get('/dashboard', reportController.dashboard);

module.exports = router;