/**
 * Definição centralizada de todas as rotas da API
 * Facilita a manutenção e gerenciamento dos endpoints
 */

/**
 * URL base da API
 */
export const API_BASE_URL = 'https://api.finscale.com/v1';

/**
 * Objeto que contém todas as rotas da API agrupadas por domínio
 */
export const API_ROUTES = {
  /**
   * Rotas de autenticação
   */
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    refreshToken: '/auth/refresh-token',
    logout: '/auth/logout'
  },

  /**
   * Rotas de usuário e perfil
   */
  user: {
    profile: '/user/profile',
    updateProfile: '/user/profile',
    changePassword: '/user/change-password',
    uploadProfileImage: '/user/profile/image',
    notificationSettings: '/user/notification-settings'
  },

  /**
   * Rotas de plantões
   */
  shifts: {
    available: '/shifts/available',
    book: '/shifts/book',
    cancel: '/shifts/cancel',
    userShifts: '/shifts/user',
    shiftDetails: (shiftId) => `/shifts/${shiftId}`
  },

  /**
   * Rotas de hospitais
   */
  hospitals: {
    list: '/hospitals',
    details: (hospitalId) => `/hospitals/${hospitalId}`,
    reviews: (hospitalId) => `/hospitals/${hospitalId}/reviews`
  },

  /**
   * Rotas de estatísticas
   */
  statistics: {
    earnings: '/statistics/earnings',
    shiftsCompleted: '/statistics/shifts-completed',
    hoursWorked: '/statistics/hours-worked'
  },

  /**
   * Rotas de notificações
   */
  notifications: {
    list: '/notifications',
    markAsRead: '/notifications/mark-read',
    settings: '/notifications/settings'
  },

  /**
   * Rotas de pagamentos
   */
  payments: {
    history: '/payments/history',
    details: (paymentId) => `/payments/${paymentId}`,
    bankInfo: '/payments/bank-info',
    updateBankInfo: '/payments/bank-info'
  }
};

/**
 * Função auxiliar para construir URLs completas da API
 * @param {string} route - Rota da API sem a URL base
 * @returns {string} URL completa da API
 */
export const getFullApiUrl = (route) => {
  if (!route) return API_BASE_URL;
  
  // Remove barras duplicadas se a rota já começar com /
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
  return `${API_BASE_URL}${normalizedRoute}`;
};

/**
 * Códigos de erro da API
 */
export const API_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
};

/**
 * Mensagens de erro padronizadas
 */
export const API_ERROR_MESSAGES = {
  [API_ERROR_CODES.UNAUTHORIZED]: 'Sessão expirada. Por favor, faça login novamente.',
  [API_ERROR_CODES.FORBIDDEN]: 'Você não tem permissão para acessar este recurso.',
  [API_ERROR_CODES.NOT_FOUND]: 'O recurso solicitado não foi encontrado.',
  [API_ERROR_CODES.VALIDATION_ERROR]: 'Os dados fornecidos são inválidos.',
  [API_ERROR_CODES.SERVER_ERROR]: 'Ocorreu um erro no servidor. Tente novamente mais tarde.',
  [API_ERROR_CODES.NETWORK_ERROR]: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
  [API_ERROR_CODES.TIMEOUT_ERROR]: 'A requisição excedeu o tempo limite. Tente novamente mais tarde.'
}; 