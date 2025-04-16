/**
 * Script para substituir temporariamente o App.js principal
 * para testar e corrigir o erro do tema
 */

const fs = require('fs');
const path = require('path');

// Verificar se App.js.bak já existe (backup do original)
const appJsPath = path.join(__dirname, '..', 'App.js');
const appJsBakPath = path.join(__dirname, '..', 'App.js.bak');

if (!fs.existsSync(appJsBakPath) && fs.existsSync(appJsPath)) {
  console.log('📦 Criando backup do App.js original...');
  fs.copyFileSync(appJsPath, appJsBakPath);
}

// Conteúdo do App.js simplificado
const simpleAppJs = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LoginScreen from './src/screens/auth/LoginScreen';

// App.js simplificado sem dependências complexas
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Finscale</Text>
      <LoginScreen 
        onLogin={(email, password) => {
          console.log('Login simulado com:', email);
          alert('Login simulado com sucesso');
          return { success: true };
        }}
      />
    </View>
  );
}

// Estilos básicos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2563EB'
  }
});`;

// Salvar a versão simplificada
fs.writeFileSync(appJsPath, simpleAppJs);

console.log('✅ App.js substituído com versão simplificada');
console.log('🚀 Inicie a aplicação com:');
console.log('    npx expo start --clear -c');
console.log('');
console.log('⚠️ Para restaurar o App.js original, execute:');
console.log('    copy App.js.bak App.js');
console.log(''); 