import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ActivityIndicator, View, Text } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Componentes de navegação
import AppNavigator from './src/navigation/AppNavigator';

// Importar as telas que precisam ser acessíveis pelo AppNavigator
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import DashboardScreen from './src/screens/main/DashboardScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import ShiftsScreen from './src/screens/main/ShiftsScreen';

// Telas de espaço reservado para componentes ainda não implementados
const PlaceholderScreen = ({ title }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{title}</Text>
    <Text style={{ marginTop: 10 }}>Esta tela será implementada em breve</Text>
  </View>
);

// Registro global de componentes para o navegador
global.WelcomeScreen = WelcomeScreen;
global.LoginScreen = LoginScreen;
global.RegisterScreen = RegisterScreen;
global.DashboardScreen = DashboardScreen;
global.ProfileScreen = ProfileScreen;
global.ShiftsScreen = ShiftsScreen;

// Componente principal do App com verificação de carregamento
const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
};

// Componente raiz com provider de autenticação
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
});
