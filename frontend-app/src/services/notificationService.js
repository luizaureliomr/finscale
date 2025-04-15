import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { formatters } from '../components/form/MaskedInput';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave para armazenar as notificações agendadas no AsyncStorage
const SCHEDULED_NOTIFICATIONS_KEY = '@finscale/scheduled_notifications';

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