import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppNavigator } from './navigation/AppNavigator';
// Importar configuração de i18n
import './i18n';
// Importar ThemeProvider
import { ThemeProvider } from './theme/ThemeProvider';
// Importar configuração do Firebase
import './services/firebaseConfig';

// Importar todas as telas
import WelcomeScreen from './screens/auth/WelcomeScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import DashboardScreen from './screens/main/DashboardScreen';
import ProfileScreen from './screens/main/ProfileScreen';
import ShiftsScreen from './screens/main/ShiftsScreen';

// Definir todas as telas como variáveis globais para facilitar o acesso em AppNavigator
global.WelcomeScreen = WelcomeScreen;
global.LoginScreen = LoginScreen;
global.RegisterScreen = RegisterScreen;
global.DashboardScreen = DashboardScreen;
global.ProfileScreen = ProfileScreen;
global.ShiftsScreen = ShiftsScreen;

// Componente principal da aplicação
export default function App() {
  // Logs para debug
  console.log('Inicializando aplicativo principal');
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
} 