const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Caminho para o arquivo de credenciais
const serviceAccountPath = path.resolve(__dirname, '../../firebase-admin-key.json');

// Verificar se arquivo de credenciais existe
let serviceAccount;
try {
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
  } else {
    console.warn('Arquivo de credenciais Firebase Admin não encontrado!');
    console.warn('Crie o arquivo firebase-admin-key.json na raiz do projeto backend para habilitar notificações push.');
    // Tentar inicializar com credenciais de variáveis de ambiente se disponíveis
    if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
      } catch (error) {
        console.error('Erro ao processar credenciais Firebase de variável de ambiente:', error);
      }
    }
  }
} catch (error) {
  console.error('Erro ao carregar credenciais Firebase Admin:', error);
}

// Inicializar Firebase Admin SDK
let firebaseAdminInitialized = false;

if (serviceAccount && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK inicializado com sucesso!');
    firebaseAdminInitialized = true;
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin SDK:', error);
  }
}

/**
 * Envia notificação para um token específico
 * @param {string} token - Token FCM do dispositivo
 * @param {string} title - Título da notificação
 * @param {string} body - Corpo da notificação
 * @param {object} data - Dados adicionais para a notificação
 * @returns {Promise<object>} - Resultado do envio
 */
const sendToDevice = async (token, title, body, data = {}) => {
  if (!firebaseAdminInitialized) {
    return {
      success: false,
      error: 'Firebase Admin não inicializado. Verifique as credenciais.'
    };
  }
  
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      token,
    };

    const response = await admin.messaging().send(message);
    console.log('Notificação enviada com sucesso:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envia notificação para múltiplos tokens
 * @param {string[]} tokens - Array de tokens FCM
 * @param {string} title - Título da notificação
 * @param {string} body - Corpo da notificação
 * @param {object} data - Dados adicionais para a notificação
 * @returns {Promise<object>} - Resultado do envio
 */
const sendToMultipleDevices = async (tokens, title, body, data = {}) => {
  if (!firebaseAdminInitialized) {
    return {
      success: false,
      error: 'Firebase Admin não inicializado. Verifique as credenciais.'
    };
  }
  
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(
      `Notificações enviadas: ${response.successCount} sucesso, ${response.failureCount} falhas`
    );
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
    };
  } catch (error) {
    console.error('Erro ao enviar notificações:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envia notificação para um tópico
 * @param {string} topic - Nome do tópico
 * @param {string} title - Título da notificação
 * @param {string} body - Corpo da notificação
 * @param {object} data - Dados adicionais para a notificação
 * @returns {Promise<object>} - Resultado do envio
 */
const sendToTopic = async (topic, title, body, data = {}) => {
  if (!firebaseAdminInitialized) {
    return {
      success: false,
      error: 'Firebase Admin não inicializado. Verifique as credenciais.'
    };
  }
  
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      topic,
    };

    const response = await admin.messaging().send(message);
    console.log('Notificação enviada para tópico com sucesso:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Erro ao enviar notificação para tópico:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Inscreve tokens em um tópico
 * @param {string[]} tokens - Array de tokens FCM
 * @param {string} topic - Nome do tópico
 * @returns {Promise<object>} - Resultado da inscrição
 */
const subscribeToTopic = async (tokens, topic) => {
  if (!firebaseAdminInitialized) {
    return {
      success: false,
      error: 'Firebase Admin não inicializado. Verifique as credenciais.'
    };
  }
  
  try {
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    console.log('Tokens inscritos no tópico com sucesso:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Erro ao inscrever no tópico:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Desinscreve tokens de um tópico
 * @param {string[]} tokens - Array de tokens FCM
 * @param {string} topic - Nome do tópico
 * @returns {Promise<object>} - Resultado da desinscrição
 */
const unsubscribeFromTopic = async (tokens, topic) => {
  if (!firebaseAdminInitialized) {
    return {
      success: false,
      error: 'Firebase Admin não inicializado. Verifique as credenciais.'
    };
  }
  
  try {
    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
    console.log('Tokens desinscritos do tópico com sucesso:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Erro ao desinscrever do tópico:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendToDevice,
  sendToMultipleDevices,
  sendToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  isInitialized: () => firebaseAdminInitialized
}; 