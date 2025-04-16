/**
 * Script para criar uma versão extremamente simplificada da aplicação
 * Solução temporária para contornar o erro de tema
 */

const fs = require('fs');
const path = require('path');

// Criar backup do App.js original
const appJsPath = path.join(__dirname, 'App.js');
const appJsBakPath = path.join(__dirname, 'App.js.original');

if (!fs.existsSync(appJsBakPath) && fs.existsSync(appJsPath)) {
  console.log('📦 Criando backup do App.js original...');
  fs.copyFileSync(appJsPath, appJsBakPath);
}

// Conteúdo do App.js extremamente simplificado
const simpleAppJs = `import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

// Tela de login completamente independente
export default function App() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = () => {
    setLoading(true);
    // Simular login
    setTimeout(() => {
      alert('Login simulado com sucesso!');
      setLoading(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finscale</Text>
      <Text style={styles.subtitle}>Faça login para continuar</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Carregando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos básicos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});`;

// Salvar a versão simplificada
fs.writeFileSync(appJsPath, simpleAppJs);

console.log('✅ App.js substituído com versão totalmente independente');
console.log('🚀 Inicie a aplicação com:');
console.log('    npx expo start --clear -c');
console.log('');
console.log('⚠️ Para restaurar o App.js original, execute:');
console.log('    copy App.js.original App.js');
console.log(''); 