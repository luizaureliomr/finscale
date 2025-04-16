/**
 * @file apiService-noaxios.js
 * @description Serviço centralizado para comunicação com a API do backend (sem dependência do axios)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MockService } from './mockService';

// Configuração base da API
const API_CONFIG = {
  baseURL: 'https://api.finscale.com.br/v1', // Substitua pela URL real da sua API
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Token storage keys
const AUTH_TOKEN_KEY = '@Finscale:auth_token';
const REFRESH_TOKEN_KEY = '@Finscale:refresh_token';

/**
 * Wrapper para o fetch API com timeout
 * @param {string} url - URL para a requisição
 * @param {Object} options - Opções para fetch
 * @returns {Promise<Response>} Resposta do fetch
 */
const fetchWithTimeout = async (url, options = {}) => {
  const { timeout = API_CONFIG.timeout } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

/**
 * Função para fazer requisições HTTP
 * @param {string} url - URL relativa
 * @param {Object} options - Opções da requisição
 * @returns {Promise<Object>} Resposta processada
 */
const request = async (url, options = {}) => {
  try {
    // Adicionar token de autenticação se disponível
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const headers = {
      ...API_CONFIG.headers,
      ...options.headers
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    // Preparar URL completa
    const fullUrl = url.startsWith('http') 
      ? url 
      : `${API_CONFIG.baseURL}${url.startsWith('/') ? url : `/${url}`}`;
    
    // Fazer a requisição
    const response = await fetchWithTimeout(fullUrl, {
      ...options,
      headers
    });
    
    // Verificar se a resposta é ok (status 2xx)
    if (!response.ok) {
      // Tratar erro de autenticação (401)
      if (response.status === 401) {
        // Tentar renovar o token e refazer a requisição
        try {
          const newToken = await ApiService.refreshToken();
          if (newToken) {
            // Atualizar o token e tentar novamente
            headers.Authorization = `Bearer ${newToken}`;
            const retryResponse = await fetchWithTimeout(fullUrl, {
              ...options,
              headers
            });
            
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
          }
          
          // Se chegou aqui, falhou mesmo após renovar o token
          await ApiService.logout();
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        } catch (refreshError) {
          await ApiService.logout();
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
      }
      
      // Outros erros
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || response.statusText || `Erro ${response.status}`);
    }
    
    // Processar resposta
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('A requisição excedeu o tempo limite. Tente novamente.');
    }
    
    if (error.message === 'Network request failed') {
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }
    
    throw error;
  }
};

/**
 * Classe de serviço para comunicação com a API
 */
export class ApiService {
  /**
   * Inicializa o serviço de API
   */
  static async initialize() {
    try {
      // Inicializa o serviço de mockup
      await MockService.initialize();
      
      console.log('[ApiService] Inicializado com sucesso');
    } catch (error) {
      console.error('[ApiService] Erro ao inicializar:', error);
    }
  }

  /**
   * Tenta renovar o token de autenticação
   * @returns {Promise<string|null>} Novo token ou null se falhou
   */
  static async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        return null;
      }
      
      const response = await fetchWithTimeout(
        `${API_CONFIG.baseURL}/auth/refresh-token`, 
        {
          method: 'POST',
          headers: API_CONFIG.headers,
          body: JSON.stringify({ refreshToken })
        }
      );
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      const { token, refreshToken: newRefreshToken } = data;
      
      // Salva os novos tokens
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      
      return token;
    } catch (error) {
      console.error('[ApiService] Erro ao renovar token:', error);
      return null;
    }
  }

  /**
   * Realiza login do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário logado
   */
  static async login(email, password) {
    // Verifica se devemos usar dados mockados
    if (await MockService.isEnabled()) {
      return MockService.getUserByCredentials(email, password);
    }
    
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      const { token, refreshToken, user } = data;
      
      // Salva os tokens
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      
      return user;
    } catch (error) {
      throw new Error(error.message || 'Não foi possível realizar o login');
    }
  }

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do novo usuário
   * @returns {Promise<Object>} Dados do usuário criado
   */
  static async register(userData) {
    // Verifica se devemos usar dados mockados
    if (await MockService.isEnabled()) {
      return MockService.registerUser(userData);
    }
    
    try {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      const { token, refreshToken, user } = data;
      
      // Salva os tokens
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      
      return user;
    } catch (error) {
      throw new Error(error.message || 'Não foi possível registrar o usuário');
    }
  }

  /**
   * Realiza logout do usuário
   */
  static async logout() {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        // Se estiver usando dados reais, notifica o backend
        if (!(await MockService.isEnabled())) {
          await request('/auth/logout', { method: 'POST' });
        }
      }
      
      // Remove os tokens
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      
      return true;
    } catch (error) {
      console.error('[ApiService] Erro ao fazer logout:', error);
      // Ainda assim, remove os tokens locais
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      return true;
    }
  }

  /**
   * Verifica se há um usuário logado
   * @returns {Promise<boolean>} true se houver um token de autenticação
   */
  static async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('[ApiService] Erro ao verificar autenticação:', error);
      return false;
    }
  }

  /**
   * Obtém os dados do usuário atual
   * @returns {Promise<Object|null>} Dados do usuário ou null se não autenticado
   */
  static async getCurrentUser() {
    // Verifica se devemos usar dados mockados
    if (await MockService.isEnabled()) {
      // Para fins de mock, retornaremos sempre o primeiro usuário
      const mockUsers = await MockService.getUserByCredentials('teste@exemplo.com', 'senha123');
      return mockUsers;
    }
    
    try {
      return await request('/users/me');
    } catch (error) {
      console.error('[ApiService] Erro ao obter usuário atual:', error);
      return null;
    }
  }

  /**
   * Atualiza os dados do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} userData - Novos dados do usuário
   * @returns {Promise<Object>} Dados atualizados do usuário
   */
  static async updateUser(userId, userData) {
    // Verifica se devemos usar dados mockados
    if (await MockService.isEnabled()) {
      return MockService.updateUserData(userId, userData);
    }
    
    try {
      return await request(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    } catch (error) {
      throw new Error(error.message || 'Não foi possível atualizar o usuário');
    }
  }

  /**
   * Solicita redefinição de senha
   * @param {string} email - Email do usuário
   * @returns {Promise<boolean>} true se a solicitação foi enviada com sucesso
   */
  static async requestPasswordReset(email) {
    // No modo mock, sempre retorna sucesso
    if (await MockService.isEnabled()) {
      return true;
    }
    
    try {
      await request('/auth/request-reset', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      return true;
    } catch (error) {
      throw new Error(error.message || 'Não foi possível solicitar a redefinição de senha');
    }
  }

  /**
   * Obtém a lista de plantões disponíveis
   * @returns {Promise<Array>} Lista de plantões disponíveis
   */
  static async getAvailableShifts() {
    // Verifica se devemos usar dados mockados
    if (await MockService.isEnabled()) {
      return MockService.getAvailableShifts();
    }
    
    try {
      return await request('/shifts/available');
    } catch (error) {
      throw new Error(error.message || 'Não foi possível obter os plantões disponíveis');
    }
  }

  /**
   * Obtém os plantões de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} Lista de plantões do usuário
   */
  static async getUserShifts(userId) {
    // Verifica se devemos usar dados mockados
    if (await MockService.isEnabled()) {
      return MockService.getUserShifts(userId);
    }
    
    try {
      return await request(`/users/${userId}/shifts`);
    } catch (error) {
      throw new Error(error.message || 'Não foi possível obter os plantões do usuário');
    }
  }

  /**
   * Agenda um plantão para um usuário
   * @param {string} shiftId - ID do plantão
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Plantão agendado
   */
  static async bookShift(shiftId, userId) {
    // Verifica se devemos usar dados mockados
    if (await MockService.isEnabled()) {
      return MockService.bookShift(shiftId, userId);
    }
    
    try {
      return await request(`/shifts/${shiftId}/book`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
    } catch (error) {
      throw new Error(error.message || 'Não foi possível agendar o plantão');
    }
  }

  /**
   * Cancela um plantão de um usuário
   * @param {string} shiftId - ID do plantão
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Plantão cancelado
   */
  static async cancelShift(shiftId, userId) {
    // Verifica se devemos usar dados mockados
    if (await MockService.isEnabled()) {
      return MockService.cancelShift(shiftId, userId);
    }
    
    try {
      return await request(`/shifts/${shiftId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
    } catch (error) {
      throw new Error(error.message || 'Não foi possível cancelar o plantão');
    }
  }

  /**
   * Obtém as estatísticas do usuário
   * @param {string} userId - ID do usuário
   * @param {string} period - Período das estatísticas (week, month, year)
   * @returns {Promise<Object>} Estatísticas do usuário
   */
  static async getUserStatistics(userId, period = 'year') {
    // Verifica se devemos usar dados mockados
    if (await MockService.isEnabled()) {
      return MockService.getUserStatistics();
    }
    
    try {
      return await request(`/users/${userId}/statistics?period=${period}`);
    } catch (error) {
      throw new Error(error.message || 'Não foi possível obter as estatísticas');
    }
  }

  /**
   * Obtém as notificações de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} Lista de notificações
   */
  static async getUserNotifications(userId) {
    // Verifica se devemos usar dados mockados
    if (await MockService.isEnabled()) {
      return MockService.getUserNotifications(userId);
    }
    
    try {
      return await request(`/users/${userId}/notifications`);
    } catch (error) {
      throw new Error(error.message || 'Não foi possível obter as notificações');
    }
  }

  /**
   * Marca uma notificação como lida
   * @param {string} notificationId - ID da notificação
   * @returns {Promise<Object>} Notificação atualizada
   */
  static async markNotificationAsRead(notificationId) {
    // Verifica se devemos usar dados mockados
    if (await MockService.isEnabled()) {
      return MockService.markNotificationAsRead(notificationId);
    }
    
    try {
      return await request(`/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
    } catch (error) {
      throw new Error(error.message || 'Não foi possível marcar a notificação como lida');
    }
  }
}

// Exporta a classe por padrão
export default ApiService; 