const express = require('express');
const router = express.Router();
const { authValidators } = require('../middlewares/validators');
const { authRateLimiterMiddleware } = require('../middlewares/rateLimiter');
const { verifyToken } = require('../middlewares/auth.middleware');
const logger = require('../utils/logger');
const { asyncHandler } = require('../utils/errorHandler');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               crm:
 *                 type: string
 *               specialty:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos ou usuário já existe
 *       500:
 *         description: Erro no servidor
 */
router.post('/register', authRateLimiterMiddleware, authValidators.register, asyncHandler(async (req, res) => {
  logger.info(`Tentativa de registro para o email: ${req.body.email}`);
  
  // Implementação temporária
  res.status(200).json({
    message: 'Rota de registro - a ser implementada'
  });
}));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro no servidor
 */
router.post('/login', authRateLimiterMiddleware, authValidators.login, asyncHandler(async (req, res) => {
  logger.info(`Tentativa de login para o email: ${req.body.email}`);
  
  // Implementação temporária
  res.status(200).json({
    message: 'Rota de login - a ser implementada'
  });
}));

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperação de senha
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email de recuperação enviado
 *       404:
 *         description: Email não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.post('/forgot-password', authRateLimiterMiddleware, authValidators.forgotPassword, asyncHandler(async (req, res) => {
  logger.info(`Solicitação de recuperação de senha para: ${req.body.email}`);
  
  // Implementação temporária
  res.status(200).json({
    message: 'Recuperação de senha - a ser implementada'
  });
}));

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Redefinir senha com token
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou expirado
 *       500:
 *         description: Erro no servidor
 */
router.post('/reset-password', authRateLimiterMiddleware, authValidators.resetPassword, asyncHandler(async (req, res) => {
  logger.info('Solicitação de redefinição de senha recebida');
  
  // Implementação temporária
  res.status(200).json({
    message: 'Redefinição de senha - a ser implementada'
  });
}));

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obter perfil do usuário
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro no servidor
 */
router.get('/profile', verifyToken, asyncHandler(async (req, res) => {
  logger.info(`Consultando perfil do usuário ID: ${req.userId}`);
  
  // Implementação temporária
  res.status(200).json({
    message: 'Perfil do usuário - a ser implementada'
  });
}));

module.exports = router; 