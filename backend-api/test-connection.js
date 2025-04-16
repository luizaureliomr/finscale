require('dotenv').config();
const { Sequelize } = require('sequelize');

// Criar instância do Sequelize com as configurações do .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
  }
);

// Testar a conexão
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    
    // Verificar se o banco existe
    const [results] = await sequelize.query('SELECT current_database();');
    console.log(`📊 Banco de dados conectado: ${results[0].current_database}`);
    
    // Listar tabelas (se houver)
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (tables.length > 0) {
      console.log('📋 Tabelas encontradas:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log('ℹ️ Nenhuma tabela encontrada no banco de dados.');
      console.log('   Você pode criar tabelas automaticamente executando:');
      console.log('   node src/server.js');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

testConnection(); 