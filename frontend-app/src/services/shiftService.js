import { FirebaseShiftRepository } from '../repositories/firebaseShiftRepository';

/**
 * Serviço para gerenciamento de plantões
 * Utiliza o padrão Facade para simplificar a interface com os repositórios
 */
class ShiftService {
  constructor() {
    // Inicializa com o repositório Firebase
    this.repository = new FirebaseShiftRepository();
  }

  /**
   * Obtém todos os plantões do usuário
   * @returns {Promise<Object>} Resposta padronizada
   */
  async getAllShifts() {
    return this.repository.getAllShifts();
  }

  /**
   * Obtém plantões com status específico
   * @param {string} status - Status dos plantões
   * @returns {Promise<Object>} Resposta padronizada
   */
  async getShiftsByStatus(status) {
    return this.repository.getShiftsByStatus(status);
  }

  /**
   * Obtém plantões futuros
   * @param {number} limit - Limite de resultados
   * @returns {Promise<Object>} Resposta padronizada
   */
  async getUpcomingShifts(limit = 5) {
    return this.repository.getUpcomingShifts(limit);
  }

  /**
   * Adiciona um novo plantão
   * @param {Object} shiftData - Dados do plantão
   * @returns {Promise<Object>} Resposta padronizada
   */
  async addShift(shiftData) {
    return this.repository.addShift(shiftData);
  }

  /**
   * Atualiza um plantão existente
   * @param {string} shiftId - ID do plantão
   * @param {Object} shiftData - Dados para atualizar
   * @returns {Promise<Object>} Resposta padronizada
   */
  async updateShift(shiftId, shiftData) {
    return this.repository.updateShift(shiftId, shiftData);
  }

  /**
   * Remove um plantão
   * @param {string} shiftId - ID do plantão
   * @returns {Promise<Object>} Resposta padronizada
   */
  async deleteShift(shiftId) {
    return this.repository.deleteShift(shiftId);
  }

  /**
   * Obtém estatísticas dos plantões
   * @returns {Promise<Object>} Resposta padronizada
   */
  async getShiftStats() {
    return this.repository.getShiftStats();
  }
}

// Exporta como singleton para reutilização
export default new ShiftService(); 