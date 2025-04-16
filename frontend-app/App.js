import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, LogBox, TouchableOpacity, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
// Importando serviços e configurações
import { app, db, auth } from './src/services/firebaseConfig';
import { ApiService } from './src/services/apiService';
import AppNavigator from './src/navigation/AppNavigator';
import notificationService from './src/services/notificationService';
import { Alert } from 'react-native';

// Ignorar warnings específicos
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native core',
  'Setting a timer for a long period of time',
  'VirtualizedLists should never be nested',
  'Cannot update a component from inside',
  'Setting a timer',
  'AsyncStorage has been extracted',
  'Non-serializable values were found in the navigation state',
]);

// Componente de carregamento
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Carregando aplicativo...</Text>
  </View>
);

// Componente de erro
const ErrorScreen = ({ message, retry }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Erro ao carregar o aplicativo</Text>
    <Text style={styles.errorMessage}>{message || 'Ocorreu um problema inesperado.'}</Text>
    {retry && (
      <TouchableOpacity style={styles.retryButton} onPress={retry}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Componente principal
export default function App() {
  const [mainComponent, setMainComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationInitialized, setNotificationInitialized] = useState(false);

  // Função para carregar o aplicativo
  const loadApp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Inicializa o serviço de API que gerencia mocks
      await ApiService.initialize();
      
      // Carrega dinâmicamente o componente principal
      console.log('Carregando o App interno...');
      const AppModule = require('./src/App').default;
      setMainComponent(() => AppModule);
      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao carregar aplicativo:', err);
      setError(err.message || 'Falha ao carregar os componentes do aplicativo');
      setIsLoading(false);
    }
  };

  // Efeito inicial para carregar o app
  useEffect(() => {
    loadApp();
  }, []);

  // Inicialização de serviços
  useEffect(() => {
    async function initializeNotifications() {
      try {
        // Inicializar FCM
        const fcmResult = await notificationService.initializeFCM();
        if (fcmResult.success) {
          console.log('FCM inicializado com sucesso, token:', fcmResult.token);
          
          // Configurar listeners para notificações FCM
          const unsubscribeFCM = notificationService.setupFCMListeners(
            (message) => {
              console.log('Notificação recebida em foreground:', message);
              // Implementar lógica para tratar notificações em foreground
            },
            async (message) => {
              console.log('Notificação recebida em background:', message);
              // Retornar true para indicar manipulação bem-sucedida
              return Promise.resolve(true);
            }
          );
          
          setNotificationInitialized(true);
          
          // Limpar listeners ao desmontar
          return () => {
            unsubscribeFCM && unsubscribeFCM();
          };
        } else {
          console.error('Erro ao inicializar FCM:', fcmResult.error);
        }
      } catch (error) {
        console.error('Erro ao inicializar serviços:', error);
      }
    }

    initializeNotifications();
  }, []);

  // Enviar notificação de teste ao iniciar (apenas em desenvolvimento)
  useEffect(() => {
    if (__DEV__ && notificationInitialized) {
      setTimeout(() => {
        notificationService.sendTestNotification()
          .then(result => {
            if (!result.success) {
              console.error('Erro ao enviar notificação de teste:', result.error);
            }
          })
          .catch(error => {
            console.error('Erro ao enviar notificação de teste:', error);
          });
      }, 5000); // Atraso de 5 segundos
    }
  }, [notificationInitialized]);

  // Renderização condicional
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} retry={loadApp} />;
  }

  const MainApp = mainComponent;
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <AppNavigator />
    </NavigationContainer>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    fontSize: 16,
    color: '#333'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 10
  },
  errorMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
