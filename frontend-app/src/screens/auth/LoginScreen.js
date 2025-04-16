import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = ({ navigation, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Usar o contexto de autenticação do app ou o callback de login do componente
  const auth = useAuth();
  const { login: authLogin, forgotPassword, isAuthenticated } = auth || {};
  
  // Verificar se o usuário já está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      // Se já está autenticado, poderíamos navegar para o Dashboard
      if (navigation) {
        navigation.replace('Dashboard');
      }
    }
  }, [isAuthenticated, navigation]);

  // Validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Por favor, informe seu e-mail');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('E-mail inválido');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Validar senha
  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Por favor, informe sua senha');
      return false;
    } else if (password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    // Validar campos
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    
    try {
      // Usar o login do contexto ou o callback de props
      const loginFn = authLogin || onLogin;
      
      if (!loginFn) {
        throw new Error('Função de login não disponível');
      }
      
      const result = await loginFn(email, password);
      
      if (!result.success) {
        let errorMessage = result.error || 'Falha no login';
        
        // Traduzir mensagens comuns de erro do Firebase
        if (errorMessage.includes('user-not-found')) {
          errorMessage = 'Usuário não encontrado';
        } else if (errorMessage.includes('wrong-password')) {
          errorMessage = 'Senha incorreta';
        } else if (errorMessage.includes('too-many-requests')) {
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
        }
        
        Alert.alert('Erro de Autenticação', errorMessage);
      } else {
        // Login bem-sucedido, mas não navegamos aqui pois o efeito useEffect
        // acima irá navegar quando isAuthenticated mudar
        console.log('Login bem-sucedido');
      }
    } catch (error) {
      console.error('Erro durante login:', error);
      Alert.alert('Erro', error.message || 'Não foi possível fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, informe um e-mail válido para recuperar a senha');
      return;
    }

    try {
      setLoading(true);
      
      if (!forgotPassword) {
        throw new Error('Função de recuperação de senha não disponível');
      }
      
      const result = await forgotPassword(email);
      
      if (result.success) {
        Alert.alert(
          'E-mail Enviado',
          'Enviamos instruções de recuperação de senha para o seu e-mail'
        );
      } else {
        Alert.alert('Erro', result.error || 'Falha ao enviar e-mail de recuperação');
      }
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao processar a solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>Bem-vindo de volta!</Text>
          <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>
          
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="Digite seu e-mail"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) validateEmail(text);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null]}
                placeholder="Digite sua senha"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) validatePassword(text);
                }}
                secureTextEntry
              />
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>
            
            <TouchableOpacity 
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta? </Text>
            <TouchableOpacity 
              onPress={() => navigation?.navigate?.('Register')}
              disabled={loading}
            >
              <Text style={styles.footerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.demoInfo}>
            <Text style={styles.demoText}>
              Para teste, você pode usar:
              Email: teste@exemplo.com
              Senha: senha123
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
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
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#2c3e50',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f5f6fa',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
  },
  forgotPassword: {
    color: '#3498db',
    textAlign: 'right',
    marginBottom: 20,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#7f8c8d',
    fontSize: 16,
  },
  footerLink: {
    color: '#3498db',
    fontWeight: 'bold',
    fontSize: 16,
  },
  demoInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f1f9fe',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  demoText: {
    color: '#2c3e50',
    fontSize: 14,
    lineHeight: 20,
  }
});

export default LoginScreen; 