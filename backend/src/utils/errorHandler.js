/**
 * Classe para padronizar os erros da API
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para capturar e tratar todos os erros
 */
const errorMiddleware = (err, req, res, next) => {
  const { statusCode = 500, message, details } = err;
  
  // Log do erro
  console.error(`[${new Date().toISOString()}] Error:`, err);
  
  // Formata a resposta de erro
  return res.status(statusCode).json({
    error: true,
    message: statusCode === 500 ? 'Erro interno do servidor' : message,
    details: process.env.NODE_ENV === 'production' ? undefined : details || err.stack
  });
};

/**
 * Função para tratar erros assíncronos
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
  AppError,
  errorMiddleware,
  asyncHandler
}; 