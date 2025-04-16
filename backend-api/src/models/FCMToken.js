const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Adiciona ou atualiza um token FCM para um usuário
 * @param {string} userId - ID do usuário
 * @param {string} token - Token FCM
 * @param {string} deviceType - Tipo de dispositivo (android, ios, web)
 * @param {string} deviceName - Nome do dispositivo
 * @returns {Promise<Object>} - Token salvo
 */
async function saveToken(userId, token, deviceType = null, deviceName = null) {
  const client = await pool.connect();
  
  try {
    // Verificar se o token já existe para atualizar em vez de inserir
    const checkResult = await client.query(
      `SELECT * FROM user_fcm_tokens WHERE token = $1`,
      [token]
    );
    
    let result;
    
    if (checkResult.rows.length > 0) {
      // Token já existe, atualizar
      result = await client.query(
        `UPDATE user_fcm_tokens 
         SET user_id = $1, 
             device_type = $2, 
             device_name = $3, 
             is_active = true, 
             last_used = NOW(), 
             updated_at = NOW() 
         WHERE token = $4 
         RETURNING *`,
        [userId, deviceType, deviceName, token]
      );
    } else {
      // Token não existe, inserir novo
      result = await client.query(
        `INSERT INTO user_fcm_tokens (user_id, token, device_type, device_name, is_active, last_used, created_at, updated_at)
         VALUES ($1, $2, $3, $4, true, NOW(), NOW(), NOW())
         RETURNING *`,
        [userId, token, deviceType, deviceName]
      );
    }
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Desativa um token FCM
 * @param {string} token - Token FCM para desativar
 * @returns {Promise<boolean>} - True se desativado com sucesso
 */
async function deactivateToken(token) {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `UPDATE user_fcm_tokens 
       SET is_active = false, 
           updated_at = NOW() 
       WHERE token = $1 
       RETURNING *`,
      [token]
    );
    
    return result.rowCount > 0;
  } finally {
    client.release();
  }
}

/**
 * Obtém tokens ativos para um usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} - Array de tokens ativos
 */
async function getActiveTokensByUser(userId) {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT * FROM user_fcm_tokens 
       WHERE user_id = $1 AND is_active = true 
       ORDER BY last_used DESC`,
      [userId]
    );
    
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Obtém tokens ativos para múltiplos usuários
 * @param {Array} userIds - Array de IDs de usuários
 * @returns {Promise<Array>} - Array de tokens
 */
async function getActiveTokensByUsers(userIds) {
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return [];
  }
  
  const client = await pool.connect();
  
  try {
    // Criar placeholders para os parâmetros da query (ex: $1, $2, $3, ...)
    const placeholders = userIds.map((_, index) => `$${index + 1}`).join(',');
    
    const result = await client.query(
      `SELECT * FROM user_fcm_tokens 
       WHERE user_id IN (${placeholders}) AND is_active = true`,
      userIds
    );
    
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Verifica se uma tabela existe no banco de dados
 * @param {string} tableName - Nome da tabela para verificar
 * @returns {Promise<boolean>} - True se a tabela existir
 */
async function tableExists(tableName) {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name = $1
       )`,
      [tableName]
    );
    
    return result.rows[0].exists;
  } finally {
    client.release();
  }
}

/**
 * Cria a tabela de tokens FCM se não existir
 * @returns {Promise<void>}
 */
async function createTableIfNotExists() {
  const exists = await tableExists('user_fcm_tokens');
  
  if (!exists) {
    const client = await pool.connect();
    
    try {
      await client.query(`
        CREATE TABLE user_fcm_tokens (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          token TEXT NOT NULL UNIQUE,
          device_type VARCHAR(50),
          device_name VARCHAR(255),
          is_active BOOLEAN DEFAULT TRUE,
          last_used TIMESTAMP,
          created_at TIMESTAMP NOT NULL,
          updated_at TIMESTAMP NOT NULL
        );
        
        CREATE INDEX idx_user_fcm_tokens_user_id ON user_fcm_tokens(user_id);
        CREATE INDEX idx_user_fcm_tokens_token ON user_fcm_tokens(token);
      `);
      
      console.log('Tabela user_fcm_tokens criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar tabela user_fcm_tokens:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

// Inicializar tabela ao carregar o modelo
createTableIfNotExists().catch(console.error);

module.exports = {
  saveToken,
  deactivateToken,
  getActiveTokensByUser,
  getActiveTokensByUsers,
  createTableIfNotExists
}; 