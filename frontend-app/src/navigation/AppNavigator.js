import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// As telas são agora referenciadas por variáveis globais (definidas no App.js)
// WelcomeScreen, LoginScreen, RegisterScreen, DashboardScreen, ProfileScreen, ShiftsScreen
// Adicionando referência à tela de teste Firebase
import FirebaseTestScreen from '../screens/main/FirebaseTestScreen';
// Importando a tela de estatísticas
import StatisticsScreen from '../screens/main/StatisticsScreen';

const Stack = createStackNavigator();

// Pilha de navegação de autenticação
export const AuthNavigator = () => {
  const { login, register } = useAuth();
  
  // Handler para login através do contexto
  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    return result;
  };

  // Handler para registro através do contexto
  const handleRegister = async (email, password, userData) => {
    const result = await register(email, password, userData);
    return result;
  };

  return (
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen 
        name="Welcome" 
        component={props => <global.WelcomeScreen {...props} />} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Login" 
        component={props => <global.LoginScreen {...props} onLogin={handleLogin} />} 
        options={{ title: 'Login' }}
      />
      <Stack.Screen 
        name="Register" 
        component={props => <global.RegisterScreen {...props} onRegister={handleRegister} />} 
        options={{ title: 'Cadastro' }}
      />
    </Stack.Navigator>
  );
};

// Pilha de navegação principal do app
export const MainNavigator = () => {
  const { logout, user, userData } = useAuth();

  // Exibir nome do usuário se disponível, com sanitização e limitação de tamanho
  const getSafeUserName = () => {
    let name = userData?.displayName || user?.displayName || 'Usuário';
    
    // Limitar tamanho para evitar problemas de layout
    if (name.length > 15) {
      name = name.substring(0, 15) + '...';
    }
    
    // Sanitizar texto (remover caracteres indesejados)
    name = name.replace(/[^\w\s]/gi, '');
    
    return name;
  };
  
  const userName = getSafeUserName();
  
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={props => <global.DashboardScreen {...props} userData={userData} />} 
        options={{ 
          title: `Dashboard de ${userName}`,
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Sair</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={props => <global.ProfileScreen {...props} userData={userData} />} 
        options={{ title: 'Meu Perfil' }}
      />
      <Stack.Screen 
        name="Shifts" 
        component={props => <global.ShiftsScreen {...props} userData={userData} />} 
        options={{ title: 'Meus Plantões' }}
      />
      <Stack.Screen 
        name="FirebaseTest" 
        component={FirebaseTestScreen} 
        options={{ title: 'Teste Firebase' }}
      />
      <Stack.Screen 
        name="Statistics" 
        component={StatisticsScreen} 
        options={{ title: 'Estatísticas' }}
      />
    </Stack.Navigator>
  );
};

// Navegador principal do App
export const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator; 