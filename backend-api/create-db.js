const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // Conectar ao banco postgres default
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: 'postgres' // Usar o banco padrão postgres para criar nosso banco
  });

  try {
    console.log('Conectando ao PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL com sucesso!');

    // Verificar se o banco de dados já existe
    const checkResult = await client.query(`
      SELECT datname FROM pg_database WHERE datname = '${process.env.DB_NAME}';
    `);

    if (checkResult.rows.length === 0) {
      console.log(`Criando banco de dados '${process.env.DB_NAME}'...`);
      await client.query(`CREATE DATABASE ${process.env.DB_NAME};`);
      console.log(`✅ Banco de dados '${process.env.DB_NAME}' criado com sucesso!`);
    } else {
      console.log(`ℹ️ Banco de dados '${process.env.DB_NAME}' já existe.`);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.end();
    console.log('📊 Conexão encerrada.');
  }
}

createDatabase(); 