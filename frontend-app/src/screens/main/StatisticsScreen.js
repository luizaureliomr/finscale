import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LineChart, 
  BarChart, 
  PieChart 
} from 'react-native-chart-kit';
import shiftService from '../../services/shiftService';

const screenWidth = Dimensions.get('window').width;

const StatisticsScreen = ({ navigation }) => {
  const { userData, user } = useAuth();
  const [activeTab, setActiveTab] = useState('income');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalShifts: 0, totalHours: 0, totalValue: 0 });
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState(null);
  
  const userName = userData?.displayName || user?.displayName || 'Usuário';
  
  // Formatar valor para moeda - Memoizado para evitar recriação a cada renderização
  const formatCurrency = useCallback((value) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  }, []);
  
  // Carregar dados dos plantões - Memoizado para evitar recriação a cada renderização
  const loadData = useCallback(async () => {
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
      
      // Carregar todos os plantões para gerar gráficos
      const shiftsResult = await shiftService.getUserShifts();
      if (shiftsResult.success) {
        setShifts(shiftsResult.data);
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
  }, []);
  
  // Carregar dados na montagem do componente
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Processar dados para gráficos - Memoizado para evitar recálculos desnecessários
  const processChartData = useCallback(() => {
    // Dados para o gráfico de linha (valor por mês)
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyValues = Array(12).fill(0);
    const monthlyHours = Array(12).fill(0);
    const monthlyShifts = Array(12).fill(0);
    
    // Dados para o gráfico de setores (por instituição)
    const institutionMap = new Map();
    
    // Processar os plantões
    shifts.forEach(shift => {
      if (shift.date) {
        let date;
        
        // Lidar com diferentes formatos de data
        if (typeof shift.date === 'string') {
          // Data em formato string (ISO)
          date = new Date(shift.date);
        } else if (shift.date.toDate && typeof shift.date.toDate === 'function') {
          // Timestamp do Firestore
          date = shift.date.toDate();
        } else if (shift.date instanceof Date) {
          // Já é um objeto Date
          date = shift.date;
        } else {
          // Tentativa de fallback
          try {
            date = new Date(shift.date);
          } catch (e) {
            console.error("Formato de data não suportado:", shift.date);
            return; // Pular este plantão
          }
        }
        
        // Verificar se a data é válida
        if (isNaN(date.getTime())) {
          console.error("Data inválida:", shift.date);
          return; // Pular este plantão
        }
        
        const month = date.getMonth();
        
        // Adicionar valor ao mês
        monthlyValues[month] += parseFloat(shift.value || 0);
        
        // Adicionar horas ao mês
        monthlyHours[month] += parseInt(shift.duration || 0, 10);
        
        // Adicionar contagem de plantões ao mês
        monthlyShifts[month] += 1;
        
        // Adicionar à instituição
        if (shift.institution) {
          const currentValue = institutionMap.get(shift.institution) || 0;
          institutionMap.set(shift.institution, currentValue + parseFloat(shift.value || 0));
        }
      }
    });
    
    // Dados para o gráfico de linha de valor
    const incomeData = {
      labels: monthNames,
      datasets: [
        {
          data: monthlyValues,
          color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ["Valor Mensal (R$)"]
    };
    
    // Dados para o gráfico de barras de horas
    const hoursData = {
      labels: monthNames,
      datasets: [
        {
          data: monthlyHours,
          color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ["Horas Mensais"]
    };
    
    // Dados para o gráfico de barras de quantidade
    const shiftsData = {
      labels: monthNames,
      datasets: [
        {
          data: monthlyShifts,
          color: (opacity = 1) => `rgba(155, 89, 182, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ["Plantões por Mês"]
    };
    
    // Dados para o gráfico de pizza por instituição
    const pieData = [];
    const colors = ['#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#f39c12', '#1abc9c', '#d35400', '#34495e'];
    
    let index = 0;
    institutionMap.forEach((value, name) => {
      pieData.push({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        population: value,
        color: colors[index % colors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      });
      index++;
    });
    
    return {
      incomeData,
      hoursData,
      shiftsData,
      pieData
    };
  }, [shifts]);
  
  const chartData = processChartData();
  
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#3498db"
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Carregando estatísticas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Estatísticas</Text>
        <Text style={styles.headerSubtitle}>Analise seu desempenho financeiro</Text>
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
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'income' && styles.activeTab]} 
          onPress={() => setActiveTab('income')}
        >
          <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>Valores</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'hours' && styles.activeTab]} 
          onPress={() => setActiveTab('hours')}
        >
          <Text style={[styles.tabText, activeTab === 'hours' && styles.activeTabText]}>Horas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'shifts' && styles.activeTab]} 
          onPress={() => setActiveTab('shifts')}
        >
          <Text style={[styles.tabText, activeTab === 'shifts' && styles.activeTabText]}>Plantões</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'institutions' && styles.activeTab]} 
          onPress={() => setActiveTab('institutions')}
        >
          <Text style={[styles.tabText, activeTab === 'institutions' && styles.activeTabText]}>Instituições</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'income' && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Valores por Mês (R$)</Text>
            {chartData.incomeData.datasets[0].data.some(value => value > 0) ? (
              <LineChart
                data={chartData.incomeData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            ) : (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyText}>Nenhum dado disponível</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'hours' && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Horas por Mês</Text>
            {chartData.hoursData.datasets[0].data.some(value => value > 0) ? (
              <BarChart
                data={chartData.hoursData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                verticalLabelRotation={0}
              />
            ) : (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyText}>Nenhum dado disponível</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'shifts' && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Plantões por Mês</Text>
            {chartData.shiftsData.datasets[0].data.some(value => value > 0) ? (
              <BarChart
                data={chartData.shiftsData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                verticalLabelRotation={0}
              />
            ) : (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyText}>Nenhum dado disponível</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'institutions' && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Valor por Instituição</Text>
            {chartData.pieData.length > 0 ? (
              <PieChart
                data={chartData.pieData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            ) : (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyText}>Nenhum dado disponível</Text>
              </View>
            )}
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.buttonText}>Ver Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Shifts')}
          >
            <Text style={styles.buttonText}>Gerenciar Plantões</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: -20,
    backgroundColor: 'transparent',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    padding: 15,
    backgroundColor: '#f8d7da',
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
  actionButtons: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StatisticsScreen; 