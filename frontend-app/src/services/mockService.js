/**
 * @file mockService.js
 * @description Serviço para geração de dados mockados para testes e desenvolvimento
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Flag para controlar o uso de dados mockados
let useMockData = true;

// Mapas para armazenar dados mockados em memória
const mockDataStore = {
  users: new Map(),
  shifts: new Map(),
  notifications: new Map(),
  statistics: null
};

/**
 * Dados de usuário mockados
 */
const MOCK_USERS = [
  {
    id: 'mock-user-1',
    email: 'teste@exemplo.com',
    password: 'senha123',
    displayName: 'Dr. Teste',
    profession: 'Médico',
    specialization: 'Clínico Geral',
    crm: '12345-SP',
    phoneNumber: '(11) 99999-9999',
    notificationEnabled: true,
    photoURL: 'https://randomuser.me/api/portraits/men/1.jpg',
  }
];

/**
 * Plantões mockados
 */
const MOCK_SHIFTS = [
  {
    id: 'shift-001',
    institution: 'Hospital São Lucas',
    department: 'Pronto Socorro',
    specialty: 'Clínica Médica',
    date: new Date(2023, 9, 15, 8, 0),
    duration: 12,
    value: 1200.00,
    status: 'completed'
  },
  {
    id: 'shift-002',
    institution: 'Hospital Santa Maria',
    department: 'UTI',
    specialty: 'Clínica Médica',
    date: new Date(2023, 9, 18, 20, 0),
    duration: 12,
    value: 1500.00,
    status: 'completed'
  },
  {
    id: 'shift-003',
    institution: 'Hospital São Paulo',
    department: 'Emergência',
    specialty: 'Pediatria',
    date: new Date(2023, 10, 2, 8, 0),
    duration: 6,
    value: 800.00,
    status: 'upcoming'
  },
  {
    id: 'shift-004',
    institution: 'Clínica Saúde Total',
    department: 'Ambulatório',
    specialty: 'Clínica Médica',
    date: new Date(2023, 10, 10, 13, 0),
    duration: 8,
    value: 900.00,
    status: 'available'
  },
  {
    id: 'shift-005',
    institution: 'Hospital São Lucas',
    department: 'UTI COVID',
    specialty: 'Infectologia',
    date: new Date(2023, 10, 15, 8, 0),
    duration: 12,
    value: 1800.00,
    status: 'available'
  }
];

/**
 * Notificações mockadas
 */
const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-001',
    title: 'Novo plantão disponível',
    body: 'Há um novo plantão disponível em Hospital São Lucas',
    date: new Date(2023, 9, 10),
    read: true,
    type: 'shift',
    data: { shiftId: 'shift-001' }
  },
  {
    id: 'notif-002',
    title: 'Pagamento realizado',
    body: 'Seu pagamento no valor de R$ 1.200,00 foi processado',
    date: new Date(2023, 9, 20),
    read: false,
    type: 'payment',
    data: { amount: 1200.00 }
  },
  {
    id: 'notif-003',
    title: 'Lembrete de plantão',
    body: 'Seu plantão no Hospital Santa Maria começa amanhã às 20h',
    date: new Date(2023, 9, 17),
    read: false,
    type: 'reminder',
    data: { shiftId: 'shift-002' }
  }
];

/**
 * Dados de estatísticas mockadas
 */
const MOCK_STATISTICS = {
  totalEarnings: 4300.00,
  totalShifts: 3,
  averageRating: 4.8,
  earnings: [
    { month: 'Jan', value: 0 },
    { month: 'Fev', value: 0 },
    { month: 'Mar', value: 0 },
    { month: 'Abr', value: 0 },
    { month: 'Mai', value: 0 },
    { month: 'Jun', value: 0 },
    { month: 'Jul', value: 0 },
    { month: 'Ago', value: 0 },
    { month: 'Set', value: 0 },
    { month: 'Out', value: 3500 },
    { month: 'Nov', value: 800 },
    { month: 'Dez', value: 0 }
  ],
  shifts: {
    completed: 2,
    upcoming: 1,
    cancelled: 0
  },
  specialties: [
    { name: 'Clínica Médica', count: 3 },
    { name: 'Pediatria', count: 1 },
    { name: 'Infectologia', count: 1 }
  ]
};

/**
 * Inicializa os dados mock no armazenamento
 */
const initMockData = async () => {
  try {
    // Inicializa usuários mock
    MOCK_USERS.forEach(user => {
      mockDataStore.users.set(user.id, user);
      mockDataStore.users.set(user.email, user);
    });

    // Inicializa plantões mock
    MOCK_SHIFTS.forEach(shift => {
      mockDataStore.shifts.set(shift.id, shift);
    });

    // Inicializa notificações mock
    MOCK_NOTIFICATIONS.forEach(notification => {
      mockDataStore.notifications.set(notification.id, notification);
    });

    // Inicializa estatísticas
    mockDataStore.statistics = MOCK_STATISTICS;

    // Salva a preferência de usar dados mock
    await AsyncStorage.setItem('use_mock_data', String(useMockData));
    
    console.log('[MockService] Dados de teste inicializados');
  } catch (error) {
    console.error('[MockService] Erro ao inicializar dados mock:', error);
  }
};

/**
 * Adiciona um atraso simulado para operações assíncronas
 * @param {number} ms - Tempo em milissegundos para o atraso
 * @returns {Promise} Uma promessa que resolve após o atraso
 */
const mockDelay = (ms = 800) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Classe de serviço de mockup para fornecer dados de teste
 */
export class MockService {
  /**
   * Verifica se o modo de dados mockados está ativado
   * @returns {boolean} true se estiver usando dados mockados
   */
  static isEnabled() {
    return useMockData;
  }

  /**
   * Ativa ou desativa o uso de dados mockados
   * @param {boolean} enabled - Se os dados mockados devem ser usados
   */
  static async setEnabled(enabled) {
    useMockData = enabled;
    await AsyncStorage.setItem('use_mock_data', String(enabled));
    console.log(`[MockService] Modo de dados mockados ${enabled ? 'ativado' : 'desativado'}`);
  }

  /**
   * Inicializa o serviço de mockup
   */
  static async initialize() {
    try {
      // Verifica se há uma preferência salva
      const savedPref = await AsyncStorage.getItem('use_mock_data');
      if (savedPref !== null) {
        useMockData = savedPref === 'true';
      }
      
      // Inicializa os dados mockados
      await initMockData();
      
      console.log(`[MockService] Inicializado (modo mock: ${useMockData ? 'ativado' : 'desativado'})`);
    } catch (error) {
      console.error('[MockService] Erro ao inicializar:', error);
    }
  }

  /**
   * Obtém um usuário mock pelo email e senha
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Object|null} Usuário encontrado ou null
   */
  static async getUserByCredentials(email, password) {
    await mockDelay();
    
    const user = mockDataStore.users.get(email);
    
    if (user && user.password === password) {
      // Retorna uma cópia sem a senha
      const { password, ...userData } = user;
      return userData;
    }
    
    return null;
  }

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Usuário registrado
   */
  static async registerUser(userData) {
    await mockDelay();
    
    // Verifica se o email já está em uso
    if (mockDataStore.users.has(userData.email)) {
      throw new Error('Este email já está em uso');
    }
    
    // Cria novo usuário com ID gerado
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData
    };
    
    // Salva nas duas referências
    mockDataStore.users.set(newUser.id, newUser);
    mockDataStore.users.set(newUser.email, newUser);
    
    // Retorna uma cópia sem a senha
    const { password, ...result } = newUser;
    return result;
  }

  /**
   * Obtém todos os plantões disponíveis
   * @returns {Array} Lista de plantões disponíveis
   */
  static async getAvailableShifts() {
    await mockDelay();
    
    return Array.from(mockDataStore.shifts.values())
      .filter(shift => shift.status === 'available')
      .sort((a, b) => a.date - b.date);
  }

  /**
   * Obtém os plantões de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Array} Lista de plantões do usuário
   */
  static async getUserShifts(userId) {
    await mockDelay();
    
    return Array.from(mockDataStore.shifts.values())
      .filter(shift => 
        shift.status === 'completed' || 
        shift.status === 'upcoming' || 
        shift.status === 'cancelled')
      .sort((a, b) => b.date - a.date);
  }

  /**
   * Agenda um plantão para um usuário
   * @param {string} shiftId - ID do plantão
   * @param {string} userId - ID do usuário
   * @returns {Object} Plantão agendado
   */
  static async bookShift(shiftId, userId) {
    await mockDelay();
    
    const shift = mockDataStore.shifts.get(shiftId);
    
    if (!shift) {
      throw new Error('Plantão não encontrado');
    }
    
    if (shift.status !== 'available') {
      throw new Error('Este plantão não está disponível');
    }
    
    // Atualiza o status e adiciona o userId
    shift.status = 'upcoming';
    shift.userId = userId;
    
    // Atualiza o plantão no armazenamento
    mockDataStore.shifts.set(shiftId, shift);
    
    // Cria uma notificação de confirmação
    const notification = {
      id: `notif-${Date.now()}`,
      title: 'Plantão confirmado',
      body: `Seu plantão em ${shift.institution} foi confirmado para ${shift.date.toLocaleDateString()}`,
      date: new Date(),
      read: false,
      type: 'confirmation',
      data: { shiftId }
    };
    
    mockDataStore.notifications.set(notification.id, notification);
    
    return shift;
  }

  /**
   * Cancela um plantão de um usuário
   * @param {string} shiftId - ID do plantão
   * @param {string} userId - ID do usuário
   * @returns {Object} Plantão cancelado
   */
  static async cancelShift(shiftId, userId) {
    await mockDelay();
    
    const shift = mockDataStore.shifts.get(shiftId);
    
    if (!shift) {
      throw new Error('Plantão não encontrado');
    }
    
    if (shift.status !== 'upcoming' || shift.userId !== userId) {
      throw new Error('Você não pode cancelar este plantão');
    }
    
    // Atualiza o status
    shift.status = 'available';
    delete shift.userId;
    
    // Atualiza o plantão no armazenamento
    mockDataStore.shifts.set(shiftId, shift);
    
    // Cria uma notificação de cancelamento
    const notification = {
      id: `notif-${Date.now()}`,
      title: 'Plantão cancelado',
      body: `Seu cancelamento do plantão em ${shift.institution} foi processado`,
      date: new Date(),
      read: false,
      type: 'cancellation',
      data: { shiftId }
    };
    
    mockDataStore.notifications.set(notification.id, notification);
    
    return shift;
  }

  /**
   * Obtém as estatísticas do usuário
   * @returns {Object} Estatísticas do usuário
   */
  static async getUserStatistics() {
    await mockDelay();
    return { ...mockDataStore.statistics };
  }

  /**
   * Obtém as notificações de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Array} Lista de notificações
   */
  static async getUserNotifications(userId) {
    await mockDelay();
    
    return Array.from(mockDataStore.notifications.values())
      .sort((a, b) => b.date - a.date);
  }

  /**
   * Marca uma notificação como lida
   * @param {string} notificationId - ID da notificação
   * @returns {Object} Notificação atualizada
   */
  static async markNotificationAsRead(notificationId) {
    await mockDelay();
    
    const notification = mockDataStore.notifications.get(notificationId);
    
    if (!notification) {
      throw new Error('Notificação não encontrada');
    }
    
    notification.read = true;
    mockDataStore.notifications.set(notificationId, notification);
    
    return notification;
  }

  /**
   * Atualiza os dados de um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} userData - Novos dados do usuário
   * @returns {Object} Usuário atualizado
   */
  static async updateUserData(userId, userData) {
    await mockDelay();
    
    const user = mockDataStore.users.get(userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    // Atualiza os dados do usuário
    const updatedUser = {
      ...user,
      ...userData,
      // Não permite alterar o email ou id
      id: user.id,
      email: user.email
    };
    
    // Atualiza o usuário nos dois mapas
    mockDataStore.users.set(userId, updatedUser);
    mockDataStore.users.set(updatedUser.email, updatedUser);
    
    // Retorna uma cópia sem a senha
    const { password, ...result } = updatedUser;
    return result;
  }
}

// Exporta a classe por padrão
export default MockService; 