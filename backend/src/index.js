const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const db = require('./config/database');
const { errorMiddleware } = require('./utils/errorHandler');
const logger = require('./utils/logger');
const swaggerDocs = require('./config/swagger');
const { rateLimiterMiddleware } = require('./middlewares/rateLimiter');

// Criar diretório de logs se não existir
const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Inicialização do aplicativo Express
const app = express();

// Middlewares
// Segurança
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - limita numero de requisições
app.use(rateLimiterMiddleware);

// Middleware de logging para requisições HTTP
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.originalUrl} [IP: ${req.ip}]`);
  next();
});

// Documentação da API usando Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rota de teste
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API Finscale funcionando!',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// Importação e uso das rotas
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Essas rotas serão implementadas posteriormente
// app.use('/api/users', require('./routes/users.routes'));
// app.use('/api/institutions', require('./routes/institutions.routes'));
// app.use('/api/shifts', require('./routes/shifts.routes'));

// Middleware para rota não encontrada
app.use('*', (req, res) => {
  logger.warn(`Rota não encontrada: ${req.originalUrl}`);
  res.status(404).json({
    error: true,
    message: `Rota '${req.originalUrl}' não encontrada`
  });
});

// Middleware de tratamento de erros
app.use(errorMiddleware);

// Inicialização do servidor
const PORT = env.PORT;
app.listen(PORT, () => {
  logger.info(`Servidor Finscale rodando na porta ${PORT}`);
  logger.info(`Ambiente: ${env.NODE_ENV}`);
  logger.info(`Documentação da API: http://localhost:${PORT}/api-docs`);
});

// Tratamento de exceções não capturadas
process.on('uncaughtException', (error) => {
  logger.error('ERRO NÃO TRATADO!', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('PROMESSA NÃO TRATADA!', { reason, promise });
});

// Para testes
module.exports = app; 