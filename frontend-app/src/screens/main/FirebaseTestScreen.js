import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import firebaseTestService from '../../services/firebaseTestService';
import notificationService from '../../services/notificationService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import testDataService from '../../services/testDataService';
import shiftService from '../../services/shiftService';
import { formatDateBR, formatCurrency } from '../../utils/formatters';

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
  const [shifts, setShifts] = useState([]);
  const [cleanupTimeout, setCleanupTimeout] = useState(null);
  const [autoCleanup, setAutoCleanup] = useState(false);
  
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

  // Carregar dados
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) setLoading(true);
      
      try {
        const result = await shiftService.getAllShifts();
        
        if (!isMounted) return;
        
        if (result.success) {
          setShifts(result.data);
        } else {
          Alert.alert('Erro', result.error || 'Erro ao carregar dados');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Erro ao carregar dados:', error);
          Alert.alert('Erro', 'Erro ao carregar dados');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
      
      // Cancelar limpeza automática ao desmontar
      if (cleanupTimeout) {
        testDataService.cancelAutomaticCleanup(cleanupTimeout);
      }
    };
  }, []);
  
  // Criar dados de teste
  const handleCreateTestData = async () => {
    setLoading(true);
    
    try {
      const result = await testDataService.createTestShifts(10);
      
      if (result.success) {
        Alert.alert('Sucesso', result.message);
        
        // Recarregar dados
        const shiftsResult = await shiftService.getAllShifts();
        if (shiftsResult.success) {
          setShifts(shiftsResult.data);
        }
        
        // Configurar limpeza automática se ativada
        if (autoCleanup && !cleanupTimeout) {
          const timerId = testDataService.setupAutomaticCleanup(30); // 30 minutos
          setCleanupTimeout(timerId);
        }
      } else {
        Alert.alert('Erro', result.error || 'Erro ao criar dados de teste');
      }
    } catch (error) {
      console.error('Erro ao criar dados de teste:', error);
      Alert.alert('Erro', 'Erro ao criar dados de teste');
    } finally {
      setLoading(false);
    }
  };
  
  // Limpar dados de teste
  const handleCleanupTestData = async () => {
    setLoading(true);
    
    try {
      const result = await testDataService.cleanupTestData();
      
      if (result.success) {
        Alert.alert('Sucesso', result.message);
        
        // Recarregar dados
        const shiftsResult = await shiftService.getAllShifts();
        if (shiftsResult.success) {
          setShifts(shiftsResult.data);
        }
        
        // Cancelar limpeza automática agendada
        if (cleanupTimeout) {
          testDataService.cancelAutomaticCleanup(cleanupTimeout);
          setCleanupTimeout(null);
        }
      } else {
        Alert.alert('Erro', result.error || 'Erro ao limpar dados de teste');
      }
    } catch (error) {
      console.error('Erro ao limpar dados de teste:', error);
      Alert.alert('Erro', 'Erro ao limpar dados de teste');
    } finally {
      setLoading(false);
    }
  };
  
  // Ativar/desativar limpeza automática
  const toggleAutoCleanup = (value) => {
    setAutoCleanup(value);
    
    if (value && !cleanupTimeout) {
      // Configurar limpeza automática
      const timerId = testDataService.setupAutomaticCleanup(30); // 30 minutos
      setCleanupTimeout(timerId);
      Alert.alert('Limpeza Automática', 'Dados de teste serão removidos automaticamente em 30 minutos');
    } else if (!value && cleanupTimeout) {
      // Cancelar limpeza automática
      testDataService.cancelAutomaticCleanup(cleanupTimeout);
      setCleanupTimeout(null);
      Alert.alert('Limpeza Automática', 'Limpeza automática desativada');
    }
  };

  // Identificar se um item é dado de teste
  const isTestData = (item) => {
    if (item.isTestData) return true;
    
    if (item.institution && typeof item.institution === 'string' && 
        item.institution.startsWith(testDataService.TEST_PREFIX)) {
      return true;
    }
    
    return false;
  };
  
  // Renderizar item na lista
  const renderItem = ({ item }) => (
    <View style={[
      styles.shiftItem, 
      isTestData(item) ? styles.testDataItem : {}
    ]}>
      <View style={styles.shiftHeader}>
        <Text style={styles.shiftInstitution}>{item.institution}</Text>
        {isTestData(item) && (
          <View style={styles.testBadge}>
            <Text style={styles.testBadgeText}>TESTE</Text>
          </View>
        )}
      </View>
      
      <View style={styles.shiftDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Data:</Text>
          <Text style={styles.detailValue}>
            {item.date instanceof Date 
              ? formatDateBR(item.date) 
              : (item.date?.toDate ? formatDateBR(item.date.toDate()) : 'Data inválida')}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Valor:</Text>
          <Text style={styles.detailValue}>{formatCurrency(item.value)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={styles.detailValue}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

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
      
      <View style={styles.controlPanel}>
        <View style={styles.controlRow}>
          <TouchableOpacity 
            style={[styles.button, styles.createButton]}
            onPress={handleCreateTestData}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Criar Dados de Teste</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.cleanupButton]}
            onPress={handleCleanupTestData}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Limpar Dados de Teste</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Limpeza automática (30 min):</Text>
          <Switch
            value={autoCleanup}
            onValueChange={toggleAutoCleanup}
            disabled={loading}
          />
        </View>
        
        {cleanupTimeout && (
          <Text style={styles.cleanupStatus}>
            Limpeza automática ativada (30 minutos)
          </Text>
        )}
      </View>
      
      <Text style={styles.sectionTitle}>
        Plantões ({shifts.length})
      </Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      ) : (
        <FlatList
          data={shifts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhum plantão encontrado
              </Text>
            </View>
          )}
        />
      )}
      
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
  },
  controlPanel: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  createButton: {
    backgroundColor: '#3498db',
  },
  cleanupButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    padding: 5,
  },
  switchLabel: {
    fontSize: 14,
    color: '#2c3e50',
  },
  cleanupStatus: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  shiftItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  testDataItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  shiftInstitution: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  testBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  testBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  shiftDetails: {
    marginVertical: 5,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  detailLabel: {
    width: 60,
    fontSize: 14,
    color: '#7f8c8d',
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default FirebaseTestScreen; 