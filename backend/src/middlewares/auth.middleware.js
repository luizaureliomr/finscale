const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { admin } = require('../config/firebase');

/**
 * Middleware para verificar autenticação JWT
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: true,
        message: 'Token de autenticação não fornecido'
      });
    }

    // Formato do cabeçalho: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({
        error: true,
        message: 'Formato de token inválido'
      });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        error: true,
        message: 'Formato de token inválido'
      });
    }

    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          error: true,
          message: 'Token inválido ou expirado'
        });
      }

      // Se o token for válido, salva o id do usuário para uso nas rotas
      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Erro ao verificar token de autenticação'
    });
  }
};

/**
 * Middleware para verificar autenticação Firebase
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: true,
        message: 'Token de autenticação não fornecido'
      });
    }

    // Formato do cabeçalho: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({
        error: true,
        message: 'Formato de token inválido'
      });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        error: true,
        message: 'Formato de token inválido'
      });
    }

    // Verifica o token do Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Salva o ID do usuário autenticado para uso nas rotas
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;
    
    next();
  } catch (error) {
    return res.status(401).json({
      error: true,
      message: 'Token inválido ou expirado'
    });
  }
};

module.exports = {
  verifyToken,
  verifyFirebaseToken
}; 