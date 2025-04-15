const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const db = require('./config/database');
const { errorMiddleware } = require('./utils/errorHandler');

// Inicialização do aplicativo Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API Finscale funcionando!',
    version: '1.0.0'
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
  console.log(`Servidor Finscale rodando na porta ${PORT}`);
  console.log(`Ambiente: ${env.NODE_ENV}`);
});

// Para testes
module.exports = app; 