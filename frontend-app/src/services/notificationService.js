import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { formatters } from '../components/form/MaskedInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from 'firebase/app';
import 'firebase/messaging';
import { firebaseConfig } from './firebaseConfig';

// Inicializar Firebase se ainda não inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Chaves para armazenamento
const SCHEDULED_NOTIFICATIONS_KEY = '@finscale/scheduled_notifications';
const FCM_TOKEN_KEY = '@finscale/fcm_token';

// Configurar comportamento padrão para notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  /**
   * Inicializa o serviço de notificações e FCM
   */
  constructor() {
    this.fcmToken = null;
  }

  /**
   * Inicializa o FCM e registra o token
   * @returns {Promise<Object>} Resultado da inicialização FCM
   */
  async initializeFCM() {
    try {
      // Verificar permissões primeiro
      const permissionsResult = await this.requestPermissions();
      if (!permissionsResult.success) {
        return permissionsResult;
      }

      // Verificar se o token já está armazenado localmente
      const savedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      if (savedToken) {
        this.fcmToken = savedToken;
        return { success: true, token: savedToken };
      }

      // Obter novo token FCM
      const messaging = firebase.messaging();
      
      // Para iOS, registrar para notificações remotas
      if (Platform.OS === 'ios') {
        try {
          const authStatus = await messaging.requestPermission();
          const enabled = 
            authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
          
          if (!enabled) {
            return {
              success: false,
              error: 'Permissões de notificação não concedidas no iOS'
            };
          }
        } catch (error) {
          console.error('Erro ao solicitar permissão FCM no iOS:', error);
          return {
            success: false,
            error: error.message
          };
        }
      }

      // Obter token FCM
      try {
        const token = await messaging.getToken();
        if (token) {
          this.fcmToken = token;
          await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
          
          // Enviar token para backend
          await this.registerTokenWithBackend(token);
          
          return { success: true, token };
        } else {
          return {
            success: false,
            error: 'Não foi possível obter token FCM'
          };
        }
      } catch (error) {
        console.error('Erro ao obter token FCM:', error);
        return {
          success: false,
          error: error.message
        };
      }
    } catch (error) {
      console.error('Erro ao inicializar FCM:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Registra token FCM no backend
   * @param {string} token - Token FCM para registrar
   * @returns {Promise<Object>} Resultado do registro
   */
  async registerTokenWithBackend(token) {
    try {
      // TODO: Implementar chamada para API que registra o token no backend
      // Exemplo:
      // const apiService = require('./apiService').default;
      // const response = await apiService.post('/users/fcm-token', { token });
      console.log('Token FCM a ser registrado no backend:', token);
      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar token no backend:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Configura listeners para FCM em diferentes estados do app
   * @param {Function} onMessageCallback - Callback para mensagens recebidas com app aberto
   * @param {Function} onBackgroundMessageCallback - Callback para mensagens em background
   * @returns {Function} Função para remover listeners
   */
  setupFCMListeners(onMessageCallback, onBackgroundMessageCallback) {
    const messaging = firebase.messaging();
    
    // Listener para mensagens com app em foreground
    const unsubscribeOnMessage = messaging.onMessage(async (remoteMessage) => {
      console.log('Mensagem FCM recebida em foreground:', remoteMessage);
      
      // Exibir como notificação local mesmo em foreground
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || 'Nova notificação',
          body: remoteMessage.notification?.body || '',
          data: remoteMessage.data || {},
        },
        trigger: null, // mostrar imediatamente
      });
      
      // Chamar callback se fornecido
      if (typeof onMessageCallback === 'function') {
        onMessageCallback(remoteMessage);
      }
    });
    
    // Configurar handler para mensagens em background
    if (typeof onBackgroundMessageCallback === 'function') {
      messaging.setBackgroundMessageHandler(onBackgroundMessageCallback);
    }
    
    // Listener para quando app é aberto por notificação
    const unsubscribeOnNotificationOpen = messaging.onNotificationOpenedApp((remoteMessage) => {
      console.log('Notificação abriu o app do background:', remoteMessage);
      // Implementar navegação para a tela apropriada baseado nos dados
    });
    
    // Verificar notificação inicial (caso app tenha sido aberto por notificação)
    messaging.getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        console.log('App aberto por notificação inicial:', remoteMessage);
        // Implementar navegação para a tela apropriada baseado nos dados
      }
    });
    
    // Retornar função para remover todos os listeners
    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpen();
    };
  }

  /**
   * Solicita permissões para enviar notificações
   * @returns {Promise<Object>} Resultado da solicitação de permissões
   */
  async requestPermissions() {
    try {
      if (!Device.isDevice) {
        return {
          success: false,
          error: 'Notificações só funcionam em dispositivos físicos',
        };
      }
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1976D2',
        });
      }
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return {
          success: false,
          error: 'Permissão para notificações não foi concedida',
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao solicitar permissões de notificação:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Agenda uma notificação para um plantão
   * @param {Object} shift - Dados do plantão
   * @returns {Promise<Object>} Resultado do agendamento
   */
  async scheduleShiftNotification(shift) {
    try {
      // Verificar permissões
      const permissionsResult = await this.requestPermissions();
      if (!permissionsResult.success) {
        return permissionsResult;
      }
      
      // Calcular tempo de antecedência para notificação (2 horas antes)
      const shiftDate = new Date(shift.date);
      const notificationDate = new Date(shiftDate);
      notificationDate.setHours(notificationDate.getHours() - 2);
      
      // Não agendar se a data da notificação já passou
      if (notificationDate <= new Date()) {
        return {
          success: false,
          error: 'Data do plantão já passou ou é muito próxima para agendar notificação',
        };
      }
      
      // Configurar conteúdo da notificação
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Lembrete de Plantão',
          body: `Seu plantão em ${shift.institution} começa em 2 horas! (${shiftDate.getHours()}:${shiftDate.getMinutes().toString().padStart(2, '0')})`,
          data: { shiftId: shift.id },
        },
        trigger: notificationDate,
      });
      
      return {
        success: true,
        notificationId,
      };
    } catch (error) {
      console.error('Erro ao agendar notificação de plantão:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Cancela uma notificação agendada
   * @param {string} notificationId - ID da notificação a ser cancelada
   * @returns {Promise<Object>} Resultado do cancelamento
   */
  async cancelNotification(notificationId) {
    try {
      if (!notificationId) {
        return {
          success: false,
          error: 'ID de notificação não fornecido',
        };
      }
      
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return { success: true };
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Recupera todas as notificações agendadas
   * @returns {Promise<Object>} Lista de notificações agendadas
   */
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return {
        success: true,
        notifications,
      };
    } catch (error) {
      console.error('Erro ao recuperar notificações agendadas:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Envia uma notificação de teste imediata
   * @returns {Promise<Object>} Resultado do envio da notificação
   */
  async sendTestNotification() {
    try {
      // Verificar permissões
      const permissionsResult = await this.requestPermissions();
      if (!permissionsResult.success) {
        return permissionsResult;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Teste de Notificação',
          body: 'Esta é uma notificação de teste do FinScale',
          data: { test: true },
        },
        trigger: null, // Envia imediatamente
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Configura listener para receber notificações em primeiro plano
   * @param {Function} handler - Função para tratar notificações recebidas
   * @returns {Object} Subscription que deve ser removida quando não for mais necessária
   */
  addNotificationReceivedListener(handler) {
    return Notifications.addNotificationReceivedListener(handler);
  }
  
  /**
   * Configura listener para quando o usuário interagir com uma notificação
   * @param {Function} handler - Função para tratar interações com notificações
   * @returns {Object} Subscription que deve ser removida quando não for mais necessária
   */
  addNotificationResponseReceivedListener(handler) {
    return Notifications.addNotificationResponseReceivedListener(handler);
  }
}

export default new NotificationService(); 