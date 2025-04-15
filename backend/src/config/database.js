const { Pool } = require('pg');
const env = require('./env');

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
});

// Teste de conexão
pool.on('connect', () => {
  console.log('PostgreSQL conectado com sucesso!');
});

pool.on('error', (err) => {
  console.error('Erro na conexão com PostgreSQL:', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
}; 