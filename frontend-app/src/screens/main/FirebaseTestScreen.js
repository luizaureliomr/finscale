import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import firebaseTestService from '../../services/firebaseTestService';
import notificationService from '../../services/notificationService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TestItem = ({ title, status, result, onPress }) => {
  return (
    <TouchableOpacity style={styles.testItem} onPress={onPress}>
      <View style={styles.testHeader}>
        <Text style={styles.testTitle}>{title}</Text>
        {status === 'loading' && <ActivityIndicator size="small" color="#1976D2" />}
        {status === 'success' && <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />}
        {status === 'error' && <Ionicons name="close-circle" size={24} color="#F44336" />}
        {status === 'idle' && <Ionicons name="play" size={24} color="#1976D2" />}
      </View>
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const FirebaseTestScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [connectionTest, setConnectionTest] = useState({ status: 'idle', result: null });
  const [authTest, setAuthTest] = useState({ status: 'idle', result: null });
  const [firestoreTest, setFirestoreTest] = useState({ status: 'idle', result: null });
  const [storageTest, setStorageTest] = useState({ status: 'idle', result: null });
  const [notificationsTest, setNotificationsTest] = useState({ status: 'idle', result: null });
  const [scheduledNotifications, setScheduledNotifications] = useState({ status: 'idle', result: null });
  
  // Adicionar resultado de teste
  const addResult = (title, success, message) => {
    setResults(prevResults => [
      { 
        id: Date.now().toString(),
        title,
        success,
        message,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prevResults
    ]);
  };
  
  // Testar conexão com Firestore
  const testFirestoreConnection = async () => {
    setLoading(true);
    
    try {
      const result = await firebaseTestService.testFirestoreConnection();
      addResult('Conexão Firestore', result.success, result.message);
    } catch (error) {
      addResult('Conexão Firestore', false, error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Testar serviço de autenticação
  const testAuthConnection = async () => {
    setLoading(true);
    
    try {
      const result = await firebaseTestService.testAuthConnection();
      addResult('Serviço de Autenticação', result.success, result.message);
    } catch (error) {
      addResult('Serviço de Autenticação', false, error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Testar criação de usuário
  const testCreateUser = async () => {
    if (!testEmail || !testPassword) {
      Alert.alert('Erro', 'Por favor, preencha email e senha para o usuário de teste');
      return;
    }
    
    if (testPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await firebaseTestService.testCreateUser(testEmail, testPassword);
      addResult('Criação de Usuário', result.success, result.message);
      
      if (result.success) {
        Alert.alert(
          'Sucesso',
          `Usuário criado com sucesso. Email: ${testEmail}, Senha: ${testPassword}. Guarde essas credenciais para testes futuros.`
        );
      }
    } catch (error) {
      addResult('Criação de Usuário', false, error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Testar login
  const testLogin = async () => {
    if (!testEmail || !testPassword) {
      Alert.alert('Erro', 'Por favor, preencha email e senha');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await firebaseTestService.testLogin(testEmail, testPassword);
      addResult('Login', result.success, result.message);
    } catch (error) {
      addResult('Login', false, error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Testar criação de plantão
  const testCreateShift = async () => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para criar um plantão de teste');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await firebaseTestService.testCreateShift(user.uid);
      addResult('Criação de Plantão', result.success, result.message);
    } catch (error) {
      addResult('Criação de Plantão', false, error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Executar o teste de conexão automaticamente ao abrir a tela
    handleTestConnection();
  }, []);

  const handleTestConnection = async () => {
    setConnectionTest({ status: 'loading', result: null });
    try {
      const result = await firebaseTestService.testFirebaseConnection();
      setConnectionTest({ 
        status: result.success ? 'success' : 'error', 
        result: result.message 
      });
    } catch (error) {
      setConnectionTest({ 
        status: 'error', 
        result: `Erro: ${error.message}` 
      });
    }
  };

  const handleTestAuth = async () => {
    setAuthTest({ status: 'loading', result: null });
    try {
      const result = await firebaseTestService.testFirebaseAuth();
      setAuthTest({ 
        status: result.success ? 'success' : 'error', 
        result: result.message 
      });
    } catch (error) {
      setAuthTest({ 
        status: 'error', 
        result: `Erro: ${error.message}` 
      });
    }
  };

  const handleTestFirestore = async () => {
    setFirestoreTest({ status: 'loading', result: null });
    try {
      const result = await firebaseTestService.testFirebaseFirestore();
      setFirestoreTest({ 
        status: result.success ? 'success' : 'error', 
        result: result.message 
      });
    } catch (error) {
      setFirestoreTest({ 
        status: 'error', 
        result: `Erro: ${error.message}` 
      });
    }
  };

  const handleTestStorage = async () => {
    setStorageTest({ status: 'loading', result: null });
    try {
      const result = await firebaseTestService.testFirebaseStorage();
      setStorageTest({ 
        status: result.success ? 'success' : 'error', 
        result: result.message 
      });
    } catch (error) {
      setStorageTest({ 
        status: 'error', 
        result: `Erro: ${error.message}` 
      });
    }
  };

  const handleTestNotifications = async () => {
    setNotificationsTest({ status: 'loading', result: null });
    try {
      // Solicitar permissões
      const permissionsResult = await notificationService.requestPermissions();
      
      if (!permissionsResult.success) {
        setNotificationsTest({ 
          status: 'error', 
          result: `Erro nas permissões: ${permissionsResult.error}` 
        });
        return;
      }
      
      // Enviar notificação de teste
      const result = await notificationService.sendTestNotification();
      
      setNotificationsTest({ 
        status: result.success ? 'success' : 'error', 
        result: result.success 
          ? `Notificação enviada com sucesso!` 
          : `Erro: ${result.error}` 
      });
    } catch (error) {
      setNotificationsTest({ 
        status: 'error', 
        result: `Erro: ${error.message}` 
      });
    }
  };

  const handleGetScheduledNotifications = async () => {
    setScheduledNotifications({ status: 'loading', result: null });
    try {
      const result = await notificationService.getScheduledNotifications();
      
      if (result.success) {
        const notificationsText = result.notifications.length > 0
          ? `Notificações agendadas (${result.notifications.length}):\n${result.notifications.map(n => 
            `ID: ${n.identifier}\nData: ${new Date(n.trigger.value).toLocaleString()}\nConteúdo: ${n.content.title} - ${n.content.body}`
          ).join('\n\n')}`
          : 'Nenhuma notificação agendada.';
        
        setScheduledNotifications({ 
          status: 'success', 
          result: notificationsText
        });
      } else {
        setScheduledNotifications({ 
          status: 'error', 
          result: `Erro: ${result.error}` 
        });
      }
    } catch (error) {
      setScheduledNotifications({ 
        status: 'error', 
        result: `Erro: ${error.message}` 
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Teste de Integração Firebase</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Testes de Firebase</Text>
          
          <TestItem 
            title="Teste de Conexão" 
            status={connectionTest.status} 
            result={connectionTest.result}
            onPress={handleTestConnection}
          />
          
          <TestItem 
            title="Teste de Autenticação" 
            status={authTest.status} 
            result={authTest.result}
            onPress={handleTestAuth}
          />
          
          <TestItem 
            title="Teste de Firestore" 
            status={firestoreTest.status} 
            result={firestoreTest.result}
            onPress={handleTestFirestore}
          />
          
          <TestItem 
            title="Teste de Storage" 
            status={storageTest.status} 
            result={storageTest.result}
            onPress={handleTestStorage}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Testes de Notificações</Text>
          
          <TestItem 
            title="Enviar Notificação de Teste" 
            status={notificationsTest.status} 
            result={notificationsTest.result}
            onPress={handleTestNotifications}
          />
          
          <TestItem 
            title="Verificar Notificações Agendadas" 
            status={scheduledNotifications.status} 
            result={scheduledNotifications.result}
            onPress={handleGetScheduledNotifications}
          />
        </View>
      </ScrollView>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Executando teste...</Text>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resultados</Text>
        
        {results.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum teste executado ainda</Text>
        ) : (
          results.map(result => (
            <View 
              key={result.id} 
              style={[
                styles.resultItem,
                result.success ? styles.successResult : styles.errorResult
              ]}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>{result.title}</Text>
                <Text style={styles.resultTimestamp}>{result.timestamp}</Text>
              </View>
              <Text style={styles.resultStatus}>
                {result.success ? '✅ Sucesso' : '❌ Falha'}
              </Text>
              <Text style={styles.resultMessage}>{result.message}</Text>
            </View>
          ))
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  testItem: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  resultContainer: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 6,
  },
  resultText: {
    fontSize: 14,
    color: '#555',
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    margin: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 16,
    padding: 20,
  },
  resultItem: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
  },
  successResult: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  errorResult: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
  },
  resultTimestamp: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  resultStatus: {
    fontSize: 14,
    marginBottom: 5,
  },
  resultMessage: {
    fontSize: 14,
    color: '#34495e',
  }
});

export default FirebaseTestScreen; 