const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const dotenv = require('dotenv');
const routes = require('./routes');

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');

// Inicializar app Express
const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar rotas
app.use('/api', routes);

// Rota básica
app.get('/', (req, res) => {
  res.json({ message: 'API Finscale funcionando!' });
});

// Rotas da API
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/shifts`, shiftRoutes);
app.use(`${API_PREFIX}/statistics`, statisticsRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Rota para erros 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Conectar ao banco de dados
    await connectDB();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
      console.log(`API disponível em http://localhost:${PORT}${API_PREFIX}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 