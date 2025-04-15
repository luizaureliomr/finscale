import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import shiftService from '../../services/shiftService';

const DashboardScreen = ({ navigation }) => {
  const { userData, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalShifts: 0, totalHours: 0, totalValue: 0 });
  const [proximosPlantoes, setProximosPlantoes] = useState([]);
  const [error, setError] = useState(null);
  
  // Nome do usuário a partir dos dados
  const userName = userData?.displayName || user?.displayName || 'Doutor';
  
  // Carregar dados dos plantões
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Carregar estatísticas
        const statsResult = await shiftService.getShiftStats();
        if (statsResult.success) {
          setStats(statsResult.data);
        } else {
          console.error('Erro ao carregar estatísticas:', statsResult.error);
          setError(statsResult.error);
        }
        
        // Carregar próximos plantões
        const shiftsResult = await shiftService.getUpcomingShifts(2);
        if (shiftsResult.success) {
          setProximosPlantoes(shiftsResult.data);
        } else {
          console.error('Erro ao carregar plantões:', shiftsResult.error);
          setError(error => error || shiftsResult.error);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Formatar valor para moeda
  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };
  
  // Extrair dia e mês da data
  const formatDate = (dateString) => {
    // Verifica se a data está no formato ISO
    if (dateString && dateString.includes('-')) {
      const [year, month, day] = dateString.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    }
    return dateString; // Retorna a string original se não estiver no formato esperado
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {userName}!</Text>
          <Text style={styles.subtitle}>Aqui está seu resumo financeiro</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image 
                source={{ uri: user.photoURL }} 
                style={styles.avatar} 
              />
            ) : (
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalShifts}</Text>
          <Text style={styles.statLabel}>Plantões</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalHours}h</Text>
          <Text style={styles.statLabel}>Horas</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(stats.totalValue)}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Próximos Plantões</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Shifts')}>
          <Text style={styles.sectionLink}>Ver todos</Text>
        </TouchableOpacity>
      </View>
      
      {proximosPlantoes.length > 0 ? (
        proximosPlantoes.map(plantao => (
          <View key={plantao.id} style={styles.shiftCard}>
            <Text style={styles.shiftInstitution}>{plantao.institution}</Text>
            <View style={styles.shiftDetails}>
              <Text style={styles.shiftDate}>{formatDate(plantao.date)}</Text>
              <Text style={styles.shiftTime}>{plantao.time}</Text>
            </View>
            <Text style={styles.shiftValue}>{formatCurrency(plantao.value)}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhum plantão agendado</Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Shifts')}
          >
            <Text style={styles.emptyButtonText}>Adicionar Plantão</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Shifts')}
        >
          <Text style={styles.buttonText}>Gerenciar Plantões</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.buttonText}>Meu Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#9b59b6' }]}
          onPress={() => navigation.navigate('Statistics')}
        >
          <Text style={styles.buttonText}>Ver Estatísticas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.testButton]}
          onPress={() => navigation.navigate('FirebaseTest')}
        >
          <Text style={styles.buttonText}>Testar Firebase</Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  profileButton: {
    marginTop: 20,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sectionLink: {
    fontSize: 14,
    color: '#3498db',
  },
  shiftCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shiftInstitution: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  shiftDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  shiftDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  shiftTime: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  shiftValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
    textAlign: 'right',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  emptyButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: '#2ecc71',
  },
  testButton: {
    backgroundColor: '#9b59b6',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#fdeaea',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorText: {
    color: '#c0392b',
    fontSize: 14,
    lineHeight: 20,
  }
});

export default DashboardScreen; 