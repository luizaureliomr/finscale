const { RateLimiterMemory } = require('rate-limiter-flexible');
const logger = require('../utils/logger');

// Limites gerais para todas as rotas
const generalLimiter = new RateLimiterMemory({
  points: 30, // Número de pontos
  duration: 60, // Em 1 minuto
});

// Limites mais estritos para rotas de autenticação (protege contra ataques de força bruta)
const authLimiter = new RateLimiterMemory({
  points: 5, // Número de pontos
  duration: 60, // Em 1 minuto
  blockDuration: 300, // Bloqueia por 5 minutos
});

/**
 * Middleware para aplicar limite de taxa geral
 */
const rateLimiterMiddleware = async (req, res, next) => {
  try {
    await generalLimiter.consume(req.ip);
    next();
  } catch (err) {
    logger.warn(`Rate limit excedido para IP: ${req.ip}`);
    res.status(429).json({
      error: true,
      message: 'Muitas requisições, tente novamente mais tarde'
    });
  }
};

/**
 * Middleware para aplicar limite de taxa em rotas de autenticação
 */
const authRateLimiterMiddleware = async (req, res, next) => {
  try {
    await authLimiter.consume(req.ip);
    next();
  } catch (err) {
    logger.warn(`Rate limit de autenticação excedido para IP: ${req.ip}`);
    res.status(429).json({
      error: true,
      message: 'Muitas tentativas de autenticação, tente novamente mais tarde'
    });
  }
};

module.exports = {
  rateLimiterMiddleware,
  authRateLimiterMiddleware
}; 