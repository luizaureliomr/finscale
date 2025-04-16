const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Rotas de autenticação
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/request-reset', authController.requestPasswordReset);

module.exports = router; 