const { validationResult, body } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

/**
 * Middleware para verificar se a validação teve erros
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      message: 'Erro de validação',
      details: errors.array()
    });
  }
  
  next();
};

/**
 * Validadores para autenticação
 */
const authValidators = {
  register: [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('crm')
      .optional()
      .matches(/^\d{5,6}(-[A-Z]{2})?$/)
      .withMessage('CRM deve estar no formato 12345 ou 12345-UF'),
    body('specialty').optional(),
    validate
  ],
  
  login: [
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória'),
    validate
  ],
  
  forgotPassword: [
    body('email').isEmail().withMessage('E-mail inválido'),
    validate
  ],
  
  resetPassword: [
    body('token').notEmpty().withMessage('Token é obrigatório'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter pelo menos 6 caracteres'),
    validate
  ]
};

/**
 * Validadores para usuários
 */
const userValidators = {
  update: [
    body('name').optional(),
    body('specialty').optional(),
    body('photo_url').optional().isURL().withMessage('URL de foto inválida'),
    validate
  ],
  
  updatePassword: [
    body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Nova senha deve ter pelo menos 6 caracteres'),
    validate
  ]
};

module.exports = {
  validate,
  authValidators,
  userValidators
}; 