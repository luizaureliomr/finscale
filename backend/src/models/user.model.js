const db = require('../config/database');
const bcrypt = require('bcrypt');
const { AppError } = require('../utils/errorHandler');

const userModel = {
  /**
   * Criar um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Usuário criado
   */
  async create(userData) {
    try {
      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const result = await db.query(
        `INSERT INTO users 
          (name, email, crm, password, specialty, photo_url, firebase_uid) 
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, name, email, crm, specialty, photo_url, created_at`,
        [
          userData.name,
          userData.email,
          userData.crm,
          hashedPassword,
          userData.specialty,
          userData.photo_url || null,
          userData.firebase_uid || null
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Código de violação de unicidade do PostgreSQL
        throw new AppError('E-mail ou CRM já cadastrado', 400);
      }
      throw new AppError('Erro ao criar usuário', 500, error.message);
    }
  },
  
  /**
   * Encontrar usuário por email
   * @param {string} email - Email do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  async findByEmail(email) {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      throw new AppError('Erro ao buscar usuário por email', 500, error.message);
    }
  },
  
  /**
   * Encontrar usuário por ID
   * @param {number} id - ID do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  async findById(id) {
    try {
      const result = await db.query(
        'SELECT id, name, email, crm, specialty, photo_url, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      throw new AppError('Erro ao buscar usuário por ID', 500, error.message);
    }
  },
  
  /**
   * Atualizar dados do usuário
   * @param {number} id - ID do usuário
   * @param {Object} userData - Dados a serem atualizados
   * @returns {Promise<Object>} Usuário atualizado
   */
  async update(id, userData) {
    try {
      const allowedFields = ['name', 'specialty', 'photo_url'];
      const fieldsToUpdate = Object.keys(userData).filter(field => 
        allowedFields.includes(field) && userData[field] !== undefined
      );
      
      if (fieldsToUpdate.length === 0) {
        throw new AppError('Nenhum campo válido para atualização', 400);
      }
      
      // Constrói a query de atualização dinamicamente
      const updates = fieldsToUpdate.map((field, index) => `${field} = $${index + 2}`);
      const values = fieldsToUpdate.map(field => userData[field]);
      
      const query = `
        UPDATE users 
        SET ${updates.join(', ')}, updated_at = NOW() 
        WHERE id = $1 
        RETURNING id, name, email, crm, specialty, photo_url, created_at, updated_at
      `;
      
      const result = await db.query(query, [id, ...values]);
      
      if (result.rowCount === 0) {
        throw new AppError('Usuário não encontrado', 404);
      }
      
      return result.rows[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar usuário', 500, error.message);
    }
  },
  
  /**
   * Atualizar senha do usuário
   * @param {number} id - ID do usuário
   * @param {string} newPassword - Nova senha
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const result = await db.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, id]
      );
      
      if (result.rowCount === 0) {
        throw new AppError('Usuário não encontrado', 404);
      }
      
      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao atualizar senha', 500, error.message);
    }
  }
};

module.exports = userModel; 