import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não correspondem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      // Preparar dados do usuário para o registro
      const userData = {
        displayName: name,
        createdAt: new Date().toISOString(),
        role: 'user'
      };
      
      // Registrar usuário através do contexto de autenticação
      const result = await register(email, password, userData);
      
      if (!result.success) {
        Alert.alert('Erro', result.error || 'Falha no cadastro');
      }
      
      setLoading(false);
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao realizar cadastro');
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      
      <Text style={styles.title}>Criar Conta</Text>
      <Text style={styles.subtitle}>Junte-se ao Finscale e comece a gerenciar seus plantões médicos</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={name}
          onChangeText={setName}
        />
        
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Já tem uma conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}>Faça login</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.terms}>
        <Text style={styles.termsText}>
          Ao se cadastrar, você concorda com nossos {" "}
          <Text style={styles.termsLink} onPress={() => Alert.alert('Info', 'Termos de serviço')}>
            Termos de Serviço
          </Text>
          {" "} e {" "}
          <Text style={styles.termsLink} onPress={() => Alert.alert('Info', 'Política de privacidade')}>
            Política de Privacidade
          </Text>
        </Text>
      </View>
      
      <View style={styles.demoInfo}>
        <Text style={styles.demoText}>
          Para teste, configure seu próprio projeto Firebase
          ou crie uma conta com qualquer email e senha válidos.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 10,
    color: '#3498db',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f6fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#7f8c8d',
  },
  footerLink: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  terms: {
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
  },
  termsText: {
    color: '#7f8c8d',
    textAlign: 'center',
    fontSize: 12,
  },
  termsLink: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  demoInfo: {
    marginBottom: 40,
    padding: 15,
    backgroundColor: '#f1f9fe',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  demoText: {
    color: '#2c3e50',
    fontSize: 12,
    lineHeight: 18,
  }
});

export default RegisterScreen; 