# Configuração do Firebase Cloud Messaging (FCM)

Este guia explica como configurar o Firebase Cloud Messaging para enviar notificações push no aplicativo Finscale.

## Pré-requisitos

- Projeto Firebase já configurado (seguindo o guia firebase-setup.md)
- Projeto React Native configurado

## Passo 1: Ativar o Firebase Cloud Messaging no Console

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto "Finscale"
3. No menu lateral, clique em "Cloud Messaging"
4. Clique em "Começar" (se necessário)

## Passo 2: Configurar o Android

### 1. Adicionar o arquivo google-services.json

1. No console do Firebase, clique em "Project settings" (ícone de engrenagem)
2. Na aba "General", role até a seção "Your apps"
3. Se não houver um app Android registrado, clique no ícone do Android para adicionar um
4. Registre seu app com o package name (ex: `com.finscale.app`)
5. Faça download do arquivo `google-services.json`
6. Coloque-o na pasta `android/app` do seu projeto React Native

### 2. Configurar o build.gradle

No arquivo `android/build.gradle`, adicione:

```gradle
buildscript {
    // ...
    dependencies {
        // ...
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

No arquivo `android/app/build.gradle`, adicione:

```gradle
dependencies {
    // ...
    implementation platform('com.google.firebase:firebase-bom:31.2.3')
    implementation 'com.google.firebase:firebase-messaging'
}

// Adicione ao final do arquivo
apply plugin: 'com.google.gms.google-services'
```

## Passo 3: Configurar o iOS

### 1. Registrar o app iOS

1. No console do Firebase, clique em "Project settings"
2. Na aba "General", role até a seção "Your apps"
3. Se não houver um app iOS registrado, clique no ícone do iOS para adicionar um
4. Registre seu app com o Bundle ID (ex: `com.finscale.app`)
5. Faça download do arquivo `GoogleService-Info.plist`
6. Adicione-o ao seu projeto Xcode (abra a pasta `ios` no Xcode para adicionar o arquivo)

### 2. Habilitar capacidades no Xcode

1. Abra o projeto no Xcode
2. Selecione o projeto no navegador de arquivos
3. Vá para a aba "Signing & Capabilities"
4. Clique em "+ Capability" e adicione:
   - Push Notifications
   - Background Modes (selecione "Remote notifications")

## Passo 4: Instalar as dependências no React Native

Instale as dependências necessárias para FCM:

```bash
# Navegue até a pasta do seu projeto React Native
cd projetos/finscale-frontend

# Instale a biblioteca expo-notifications
npm install expo-notifications expo-device @react-native-firebase/app @react-native-firebase/messaging
```

## Passo 5: Configurar o serviço de notificações no React Native

Crie um arquivo `src/services/notificationService.js`:

```javascript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

// Configurar o comportamento das notificações quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Configuração de notificações
export const configurePushNotifications = async () => {
  if (Device.isDevice) {
    // Verificar permissões existentes
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Se não tivermos permissão ainda, pedir ao usuário
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // Se ainda não tiver permissão, não podemos continuar
    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação não concedida!');
      return false;
    }
    
    // Configuração para Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3498db',
      });
    }
    
    // Obter token para FCM
    let token;
    try {
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
      }
      token = await messaging().getToken();
      console.log('FCM Token:', token);
      
      // Registrar o token no seu backend
      saveTokenToDatabase(token);
      
      // Configurar listeners para quando o app está em background/encerrado
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notificação aberta com o app em background:', remoteMessage);
        // Adicione lógica para navegar para tela específica
      });
      
      // Verificar mensagens iniciais (quando app é aberto por notificação)
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log('Notificação abriu o app do estado fechado:', remoteMessage);
            // Adicione lógica para navegar para tela específica
          }
        });
        
      // Configurar handler para mensagens em foreground
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('Notificação recebida em foreground!', remoteMessage);
        
        // Exibir notificação mesmo com o app em foreground
        Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title,
            body: remoteMessage.notification.body,
            data: remoteMessage.data,
          },
          trigger: null,
        });
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao configurar notificações:', error);
      return false;
    }
  } else {
    console.log('Deve estar usando um dispositivo físico para notificações push');
    return false;
  }
};

// Função para salvar o token no seu backend
const saveTokenToDatabase = async (token) => {
  // TODO: Implemente a lógica para enviar o token para seu backend
  // exemplo:
  // await fetch('https://seu-backend.com/api/users/token', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${userToken}` // token de autenticação do usuário
  //   },
  //   body: JSON.stringify({
  //     token,
  //     platform: Platform.OS
  //   })
  // });
};

// Função para enviar notificação local (teste)
export const sendLocalNotification = async (title, body, data = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // Enviar imediatamente
  });
};

// Função para adicionar um listener de notificações
export const addNotificationListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

// Função para remover um listener
export const removeNotificationListener = (subscription) => {
  Notifications.removeNotificationSubscription(subscription);
};
```

## Passo 6: Implementar a inicialização do serviço no App.js

No seu `App.js` ou componente raiz, adicione:

```javascript
import React, { useEffect } from 'react';
// ... outros imports ...
import { configurePushNotifications } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    // Configurar as notificações push
    configurePushNotifications();
  }, []);
  
  // ... restante do código do App ...
}
```

## Passo 7: Configurar o Backend para Envio de Notificações

### 1. Instalar as dependências no servidor Node.js

```bash
# Navegue até a pasta do backend
cd projetos/finscale-backend

# Instalar firebase-admin para enviar notificações
npm install firebase-admin
```

### 2. Configurar as credenciais de administrador do Firebase

1. No console do Firebase, vá para "Project settings"
2. Na aba "Service accounts", clique em "Generate new private key"
3. Faça download do arquivo JSON gerado
4. Salve este arquivo como `firebase-admin-key.json` na pasta raiz do seu projeto backend
5. Adicione este arquivo ao `.gitignore` para proteger suas credenciais

### 3. Criar serviço para envio de notificações

Crie um arquivo `src/services/notificationService.js` no backend:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-admin-key.json');

// Inicializar app Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
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
};
```

### 4. Criar controlador para envio de notificações

Crie um arquivo `src/controllers/notificationController.js`:

```javascript
const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rota para enviar notificação para um dispositivo
router.post('/send', async (req, res) => {
  try {
    const { token, title, body, data } = req.body;
    
    if (!token || !title || !body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token, título e corpo são obrigatórios' 
      });
    }
    
    const result = await notificationService.sendToDevice(token, title, body, data || {});
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para enviar notificação para múltiplos dispositivos
router.post('/send-multiple', async (req, res) => {
  try {
    const { tokens, title, body, data } = req.body;
    
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0 || !title || !body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Array de tokens, título e corpo são obrigatórios' 
      });
    }
    
    const result = await notificationService.sendToMultipleDevices(tokens, title, body, data || {});
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Erro ao enviar notificações:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para enviar notificação para um tópico
router.post('/send-topic', async (req, res) => {
  try {
    const { topic, title, body, data } = req.body;
    
    if (!topic || !title || !body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tópico, título e corpo são obrigatórios' 
      });
    }
    
    const result = await notificationService.sendToTopic(topic, title, body, data || {});
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Erro ao enviar notificação para tópico:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para inscrever dispositivos em um tópico
router.post('/subscribe', async (req, res) => {
  try {
    const { tokens, topic } = req.body;
    
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0 || !topic) {
      return res.status(400).json({ 
        success: false, 
        error: 'Array de tokens e tópico são obrigatórios' 
      });
    }
    
    const result = await notificationService.subscribeToTopic(tokens, topic);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Erro ao inscrever em tópico:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para desinscrever dispositivos de um tópico
router.post('/unsubscribe', async (req, res) => {
  try {
    const { tokens, topic } = req.body;
    
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0 || !topic) {
      return res.status(400).json({ 
        success: false, 
        error: 'Array de tokens e tópico são obrigatórios' 
      });
    }
    
    const result = await notificationService.unsubscribeFromTopic(tokens, topic);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Erro ao desinscrever de tópico:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### 5. Adicionar o controlador às rotas do backend

Modifique o arquivo `src/routes.js` para incluir o controlador de notificações:

```javascript
const express = require('express');
const router = express.Router();

// Adicione seus controladores aqui
// const authController = require('./controllers/authController');
const notificationController = require('./controllers/notificationController');

// Rotas de autenticação
// router.use('/auth', authController);

// Rotas de notificações
router.use('/notifications', notificationController);

// Outras rotas...

module.exports = router;
```

## Passo 8: Teste de Notificações

Para testar as notificações, você pode:

1. Usar o Console do Firebase para enviar uma notificação de teste
2. Fazer uma requisição para a API do seu backend
3. Usar o Postman ou Insomnia para testar as rotas de notificações do backend

### Exemplo de requisição para teste:

```
POST /api/notifications/send
Content-Type: application/json
Authorization: Bearer seu_token_jwt

{
  "token": "token_do_dispositivo_fcm",
  "title": "Novo Plantão Disponível",
  "body": "Há um novo plantão disponível para você. Clique para ver detalhes.",
  "data": {
    "type": "new_shift",
    "shiftId": "123456"
  }
}
```

## Próximos Passos

1. Implemente o middleware de autenticação no backend
2. Crie um modelo de banco de dados para armazenar os tokens FCM dos usuários
3. Configure eventos no backend para envio automático de notificações (por exemplo, quando um novo plantão for criado)
4. Implemente a lógica de navegação no app quando uma notificação é aberta 