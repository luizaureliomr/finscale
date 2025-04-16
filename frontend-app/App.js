import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, LogBox, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Importando serviços e configurações
import { app, db, auth } from './src/services/firebaseConfig';
import { ApiService } from './src/services/apiService';

// Ignorar warnings específicos
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native core',
  'Setting a timer for a long period of time',
  'VirtualizedLists should never be nested',
  'Cannot update a component from inside'
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

  // Renderização condicional
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} retry={loadApp} />;
  }

  const MainApp = mainComponent;
  return MainApp ? <MainApp /> : (
    <View style={styles.container}>
      <Text style={styles.errorMessage}>Não foi possível carregar o aplicativo.</Text>
    </View>
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
