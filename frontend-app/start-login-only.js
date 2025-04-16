/**
 * Script para iniciar apenas a tela de login
 * Isso ajuda a isolar problemas focando apenas em um componente
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Criar backup do App.js original se não existir
const APP_BACKUP = path.join(__dirname, 'App.js.backup');
const APP_PATH = path.join(__dirname, 'App.js');

if (!fs.existsSync(APP_BACKUP) && fs.existsSync(APP_PATH)) {
  console.log('📦 Criando backup do App.js original...');
  fs.copyFileSync(APP_PATH, APP_BACKUP);
}

// Criar uma versão simplificada do App.js
console.log('🔧 Criando versão simplificada do App.js...');

const simplifiedApp = `
import React from 'react';
import { View, StyleSheet, LogBox } from 'react-native';
import LoginScreen from './src/screens/auth/LoginScreen';

// Ignorar warnings
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native core',
  'Setting a timer for a long period of time'
]);

// Componente simplificado
export default function App() {
  return (
    <View style={styles.container}>
      <LoginScreen onLogin={() => alert('Login simulado com sucesso!')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});
`;

// Escrever a versão simplificada
fs.writeFileSync(APP_PATH, simplifiedApp);

// Iniciar o aplicativo
console.log('🚀 Iniciando aplicativo (apenas login)...');
try {
  execSync('npx expo start --clear', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Erro ao iniciar aplicativo:', error.message);
} finally {
  // Restaurar o App.js original
  if (fs.existsSync(APP_BACKUP)) {
    console.log('🔄 Restaurando App.js original...');
    fs.copyFileSync(APP_BACKUP, APP_PATH);
  }
} 