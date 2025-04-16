/**
 * Interfaces e tipos para repositórios de dados
 * 
 * Este arquivo define interfaces abstratas que os repositórios de dados
 * devem implementar, permitindo flexibilidade na implementação e 
 * facilitando testes e mudanças de tecnologia.
 */

/**
 * Classe base para implementações de serviços de dados
 * Implementa métodos comuns como tratamento de erros
 */
export class BaseRepository {
  /**
   * Método auxiliar para tratar erros de maneira consistente
   * @param {Error} error - Erro capturado
   * @param {string} action - Descrição da ação que falhou
   * @returns {Object} Objeto de resposta padronizado com indicação de erro
   */
  handleError(error, action) {
    console.error(`Erro ao ${action}:`, error);
    return {
      success: false,
      error: error.message || `Não foi possível ${action.toLowerCase()}.`
    };
  }
}

/**
 * Interface para repositório de gerenciamento de usuários
 * Define métodos que qualquer implementação de repositório de usuário deve seguir
 */
export class UserRepositoryInterface extends BaseRepository {
  /**
   * Realiza login do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Resposta padronizada
   */
  async login(email, password) {
    throw new Error('Método não implementado');
  }

  /**
   * Registra um novo usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {Object} userData - Dados adicionais do usuário
   * @returns {Promise<Object>} Resposta padronizada
   */
  async register(email, password, userData) {
    throw new Error('Método não implementado');
  }

  /**
   * Envia email para recuperação de senha
   * @param {string} email - Email do usuário
   * @returns {Promise<Object>} Resposta padronizada
   */
  async resetPassword(email) {
    throw new Error('Método não implementado');
  }

  /**
   * Atualiza dados do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} userData - Dados para atualizar
   * @returns {Promise<Object>} Resposta padronizada
   */
  async updateUserData(userId, userData) {
    throw new Error('Método não implementado');
  }

  /**
   * Obtém dados do usuário atual
   * @returns {Promise<Object>} Resposta padronizada
   */
  async getCurrentUser() {
    throw new Error('Método não implementado');
  }

  /**
   * Realiza logout do usuário
   * @returns {Promise<Object>} Resposta padronizada
   */
  async logout() {
    throw new Error('Método não implementado');
  }
}

/**
 * Interface para repositório de gerenciamento de plantões
 * Define métodos que qualquer implementação de repositório de plantões deve seguir
 */
export class ShiftRepositoryInterface extends BaseRepository {
  /**
   * Obtém todos os plantões do usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resposta padronizada
   */
  async getAllShifts(userId) {
    throw new Error('Método não implementado');
  }

  /**
   * Obtém plantões com status específico
   * @param {string} userId - ID do usuário
   * @param {string} status - Status dos plantões
   * @returns {Promise<Object>} Resposta padronizada
   */
  async getShiftsByStatus(userId, status) {
    throw new Error('Método não implementado');
  }

  /**
   * Obtém plantões futuros
   * @param {string} userId - ID do usuário
   * @param {number} limit - Limite de resultados
   * @returns {Promise<Object>} Resposta padronizada
   */
  async getUpcomingShifts(userId, limit) {
    throw new Error('Método não implementado');
  }

  /**
   * Adiciona um novo plantão
   * @param {string} userId - ID do usuário
   * @param {Object} shiftData - Dados do plantão
   * @returns {Promise<Object>} Resposta padronizada
   */
  async addShift(userId, shiftData) {
    throw new Error('Método não implementado');
  }

  /**
   * Atualiza um plantão existente
   * @param {string} shiftId - ID do plantão
   * @param {Object} shiftData - Dados do plantão
   * @returns {Promise<Object>} Resposta padronizada
   */
  async updateShift(shiftId, shiftData) {
    throw new Error('Método não implementado');
  }

  /**
   * Remove um plantão
   * @param {string} shiftId - ID do plantão
   * @returns {Promise<Object>} Resposta padronizada
   */
  async deleteShift(shiftId) {
    throw new Error('Método não implementado');
  }

  /**
   * Obtém estatísticas dos plantões
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Resposta padronizada
   */
  async getShiftStats(userId) {
    throw new Error('Método não implementado');
  }
} 