import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import { AuthProvider } from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import LanguageSelector from './components/LanguageSelector';
import theme from './theme';

// Importar configuração de i18n
import './i18n';

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <View style={styles.container}>
          <View style={styles.languageSelectorContainer}>
            <LanguageSelector />
          </View>
          <AppNavigator />
        </View>
      </AuthProvider>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  languageSelectorContainer: {
    position: 'absolute',
    top: 40,
    right: 15,
    zIndex: 100,
  },
});

export default App; 