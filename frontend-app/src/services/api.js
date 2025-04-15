import { auth } from './firebase';
import { Platform, NetInfo } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave para armazenar solicitações pendentes
const PENDING_REQUESTS_KEY = '@finscale/pending_requests';

// Determinar a URL base da API com base no ambiente
const getApiUrl = () => {
  // Em um dispositivo físico, localhost não funciona
  // Em produção, você usaria um domínio real
  if (__DEV__) {
    // Para dispositivos físicos no desenvolvimento, use o IP da máquina
    // Para emuladores, localhost funciona com redirecionamento de porta
    return Platform.OS === 'web' 
      ? 'http://localhost:3000/api'
      : Platform.OS === 'android' 
        ? 'http://10.0.2.2:3000/api'  // Emulador Android aponta para 10.0.2.2
        : 'http://localhost:3000/api'; // iOS
  } else {
    // URL de produção
    return 'https://api.finscale-app.com/api';
  }
};

// URL base da API
const API_URL = getApiUrl();

// Verificar status da conexão
const isConnected = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected;
  } catch (error) {
    console.warn('Erro ao verificar status da conexão:', error);
    return false;
  }
};

// Armazenar solicitação para processamento posterior
const storeOfflineRequest = async (endpoint, options) => {
  try {
    // Obter solicitações pendentes existentes
    const pendingRequestsJSON = await AsyncStorage.getItem(PENDING_REQUESTS_KEY);
    const pendingRequests = pendingRequestsJSON ? JSON.parse(pendingRequestsJSON) : [];
    
    // Adicionar nova solicitação
    pendingRequests.push({
      endpoint,
      options,
      timestamp: new Date().toISOString()
    });
    
    // Salvar solicitações pendentes atualizadas
    await AsyncStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(pendingRequests));
    
    console.log(`Solicitação armazenada para processamento offline: ${endpoint}`);
    return true;
  } catch (error) {
    console.error('Erro ao armazenar solicitação offline:', error);
    return false;
  }
};

// Processar solicitações pendentes quando online
export const processPendingRequests = async () => {
  if (!(await isConnected())) return false;
  
  try {
    // Obter solicitações pendentes
    const pendingRequestsJSON = await AsyncStorage.getItem(PENDING_REQUESTS_KEY);
    if (!pendingRequestsJSON) return true;
    
    const pendingRequests = JSON.parse(pendingRequestsJSON);
    if (pendingRequests.length === 0) return true;
    
    console.log(`Processando ${pendingRequests.length} solicitações pendentes`);
    
    // Processar cada solicitação pendente
    const results = [];
    for (const request of pendingRequests) {
      try {
        await fetchApi(request.endpoint, request.options);
        results.push({ success: true, endpoint: request.endpoint });
      } catch (error) {
        results.push({ success: false, endpoint: request.endpoint, error: error.message });
      }
    }
    
    // Limpar solicitações pendentes
    await AsyncStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify([]));
    
    return results;
  } catch (error) {
    console.error('Erro ao processar solicitações pendentes:', error);
    return false;
  }
};

// Função auxiliar para fazer requisições à API
const fetchApi = async (endpoint, options = {}) => {
  // Verificar se está conectado
  const connected = await isConnected();
  
  // Se estiver offline e não for uma operação de leitura (GET), armazenar para processamento posterior
  if (!connected && options.method && options.method !== 'GET') {
    await storeOfflineRequest(endpoint, options);
    throw new Error('Dispositivo offline. A operação será processada quando a conexão for restabelecida.');
  }
  
  // Define o cabeçalho de autorização se o usuário estiver autenticado
  const authHeader = auth.currentUser 
    ? { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` } 
    : {};
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers
      },
      ...options
    });

    // Se a resposta não for bem-sucedida, lança um erro
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
    }

    // Retorna os dados da resposta
    return response.json();
  } catch (error) {
    console.error(`Erro ao acessar ${endpoint}:`, error.message);
    throw error;
  }
};

// API de usuários
export const userApi = {
  // Obter perfil do usuário
  getProfile: async () => {
    return fetchApi('/auth/profile');
  },
  
  // Atualizar dados do usuário
  updateProfile: async (userData) => {
    return fetchApi('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }
};

// API de instituições
export const institutionApi = {
  // Listar instituições
  getInstitutions: async () => {
    return fetchApi('/institutions');
  },
  
  // Obter detalhes de uma instituição
  getInstitution: async (id) => {
    return fetchApi(`/institutions/${id}`);
  }
};

// API de plantões
export const shiftApi = {
  // Listar plantões do usuário
  getUserShifts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/shifts/user?${queryString}`);
  },
  
  // Obter detalhes de um plantão
  getShift: async (id) => {
    return fetchApi(`/shifts/${id}`);
  },
  
  // Criar um novo plantão
  createShift: async (shiftData) => {
    return fetchApi('/shifts', {
      method: 'POST',
      body: JSON.stringify(shiftData)
    });
  },
  
  // Atualizar um plantão
  updateShift: async (id, shiftData) => {
    return fetchApi(`/shifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shiftData)
    });
  },
  
  // Excluir um plantão
  deleteShift: async (id) => {
    return fetchApi(`/shifts/${id}`, {
      method: 'DELETE'
    });
  }
};

// API financeira
export const financeApi = {
  // Obter resumo financeiro
  getSummary: async (month) => {
    return fetchApi(`/finance/summary?month=${month}`);
  },
  
  // Listar pagamentos
  getPayments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/finance/payments?${queryString}`);
  }
};

export default {
  user: userApi,
  institution: institutionApi,
  shift: shiftApi,
  finance: financeApi
}; 