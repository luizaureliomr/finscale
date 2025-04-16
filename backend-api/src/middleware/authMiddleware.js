const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Middleware para proteger rotas
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Verificar se o token existe no cabeçalho
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Verificar se o token foi enviado
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Acesso não autorizado. Faça login para acessar este recurso.'
      });
    }

    try {
      // Verificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar o usuário pelo ID
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não existe mais.'
        });
      }

      // Adicionar o usuário à requisição
      req.user = user;
      next();
    } catch (error) {
      // Token inválido ou expirado
      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Middleware para verificar permissões de administrador
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para realizar esta ação.'
      });
    }
    next();
  };
}; 