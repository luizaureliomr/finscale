import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import financeService from '../../services/financeService';
import firebaseService from '../../services/firebaseService';

const screenWidth = Dimensions.get('window').width;

const FinancialReportScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [selectedView, setSelectedView] = useState('month');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Obter dados do usuário e relatórios financeiros
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const user = await firebaseService.getCurrentUser();
        setCurrentUser(user);

        if (user) {
          const now = new Date();
          const currentMonth = now.getMonth() + 1;
          const currentYear = now.getFullYear();

          // Carregar relatório mensal
          const monthly = await financeService.getMonthlyReport(
            user.uid,
            currentMonth,
            currentYear
          );
          setMonthlyData(monthly);

          // Carregar relatório anual
          const yearly = await financeService.getYearlyReport(
            user.uid,
            currentYear
          );
          setYearlyData(yearly);

          // Carregar previsão
          const forecast = await financeService.getEarningsForecast(user.uid);
          setForecastData(forecast);
        }
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados financeiros.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Formatação de moeda
  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };

  // Formatar data
  const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date.seconds * 1000);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Renderizar gráfico de ganhos mensais
  const renderMonthlyChart = () => {
    if (!monthlyData || !monthlyData.shifts || monthlyData.shifts.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <FontAwesome5 name="chart-line" size={50} color="#ccc" />
          <Text style={styles.noDataText}>Sem dados para o mês atual</Text>
        </View>
      );
    }

    // Agrupar por dia do mês
    const daysData = {};
    monthlyData.shifts.forEach(shift => {
      const date = shift.date.toDate ? shift.date.toDate() : new Date(shift.date);
      const day = date.getDate();
      
      if (!daysData[day]) {
        daysData[day] = 0;
      }
      
      daysData[day] += shift.value;
    });

    const days = Object.keys(daysData).map(Number).sort((a, b) => a - b);
    const values = days.map(day => daysData[day]);

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={{
            labels: days.map(String),
            datasets: [{ data: values }]
          }}
          width={Math.max(screenWidth, days.length * 40)}
          height={220}
          chartConfig={{
            backgroundColor: '#1e88e5',
            backgroundGradientFrom: '#1e88e5',
            backgroundGradientTo: '#0d47a1',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#0d47a1'
            }
          }}
          bezier
          style={styles.chart}
        />
      </ScrollView>
    );
  };

  // Renderizar gráfico anual
  const renderYearlyChart = () => {
    if (!yearlyData || !yearlyData.earningsByMonth) {
      return (
        <View style={styles.noDataContainer}>
          <FontAwesome5 name="chart-bar" size={50} color="#ccc" />
          <Text style={styles.noDataText}>Sem dados para o ano atual</Text>
        </View>
      );
    }

    const monthlyValues = yearlyData.earningsByMonth.map(month => month.totalEarnings);
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={{
            labels: monthNames.map(name => name.substring(0, 3)),
            datasets: [{ data: monthlyValues }]
          }}
          width={Math.max(screenWidth, 600)}
          height={220}
          yAxisLabel="R$"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#4caf50',
            backgroundGradientFrom: '#4caf50',
            backgroundGradientTo: '#2e7d32',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: { borderRadius: 16 },
            barPercentage: 0.7,
          }}
          style={styles.chart}
        />
      </ScrollView>
    );
  };

  // Renderizar gráfico de distribuição por local
  const renderLocationDistribution = () => {
    if (!monthlyData || !monthlyData.earningsByLocation) {
      return null;
    }

    const locations = Object.keys(monthlyData.earningsByLocation);
    if (locations.length === 0) return null;

    const data = locations.map((location, index) => {
      const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'];
      return {
        name: location,
        value: monthlyData.earningsByLocation[location].totalEarnings,
        color: colors[index % colors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      };
    });

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Distribuição por Local</Text>
        <PieChart
          data={data}
          width={screenWidth - 32}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  // Renderizar modal de detalhes do local
  const renderLocationModal = () => {
    if (!selectedLocation || !monthlyData) return null;

    const locationData = monthlyData.earningsByLocation[selectedLocation];
    if (!locationData) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedLocation}</Text>
            <Text style={styles.modalSubtitle}>
              {locationData.shifts.length} plantões - {formatCurrency(locationData.totalEarnings)}
            </Text>

            <ScrollView style={styles.modalScrollView}>
              {locationData.shifts.map(shift => (
                <View key={shift.id} style={styles.shiftItem}>
                  <Text style={styles.shiftDate}>{formatDate(shift.date)}</Text>
                  <View style={styles.shiftDetails}>
                    <Text style={styles.shiftType}>{shift.type || 'Plantão regular'}</Text>
                    <Text style={styles.shiftValue}>{formatCurrency(shift.value)}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // Renderizar lista de locais com detalhes
  const renderLocationsList = () => {
    if (!monthlyData || !monthlyData.earningsByLocation) {
      return null;
    }

    const locations = Object.keys(monthlyData.earningsByLocation);
    if (locations.length === 0) return null;

    return (
      <View style={styles.locationsContainer}>
        <Text style={styles.sectionTitle}>Ganhos por Local</Text>
        {locations.map(location => (
          <TouchableOpacity
            key={location}
            style={styles.locationItem}
            onPress={() => {
              setSelectedLocation(location);
              setModalVisible(true);
            }}
          >
            <View style={styles.locationHeader}>
              <Text style={styles.locationName}>{location}</Text>
              <Text style={styles.locationValue}>
                {formatCurrency(monthlyData.earningsByLocation[location].totalEarnings)}
              </Text>
            </View>
            <View style={styles.locationDetails}>
              <Text style={styles.locationShifts}>
                {monthlyData.earningsByLocation[location].shifts.length} plantões
              </Text>
              <Text style={styles.locationAverage}>
                Média: {formatCurrency(monthlyData.earningsByLocation[location].totalEarnings / 
                                      monthlyData.earningsByLocation[location].shifts.length)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Renderizar projeção para o próximo mês
  const renderForecast = () => {
    if (!forecastData) {
      return null;
    }

    return (
      <View style={styles.forecastContainer}>
        <Text style={styles.sectionTitle}>Previsão para o Próximo Mês</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(forecastData.projectedEarnings)}</Text>
            <Text style={styles.statLabel}>Ganhos Confirmados</Text>
            <Text style={styles.statSubtext}>{forecastData.bookedShifts.length} plantões agendados</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(forecastData.potentialEarnings)}</Text>
            <Text style={styles.statLabel}>Ganhos Potenciais</Text>
            <Text style={styles.statSubtext}>{forecastData.availableShifts.length} plantões disponíveis</Text>
          </View>
        </View>
        
        <View style={styles.totalPotentialContainer}>
          <Text style={styles.totalPotentialLabel}>Potencial Total</Text>
          <Text style={styles.totalPotentialValue}>{formatCurrency(forecastData.totalPotential)}</Text>
        </View>
      </View>
    );
  };

  // Renderizar resumo geral
  const renderSummary = () => {
    if (!monthlyData && !yearlyData) {
      return null;
    }

    const displayData = selectedView === 'month' ? monthlyData : yearlyData;
    
    if (!displayData) {
      return null;
    }

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>
            {selectedView === 'month' 
              ? `${monthNames[monthlyData.month - 1]} ${monthlyData.year}` 
              : `Ano ${yearlyData.year}`}
          </Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(displayData.totalEarnings)}</Text>
            <Text style={styles.statLabel}>Total de Ganhos</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{displayData.shifts.length}</Text>
            <Text style={styles.statLabel}>Plantões</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(displayData.averagePerShift)}</Text>
            <Text style={styles.statLabel}>Média por Plantão</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e88e5" />
        <Text style={styles.loadingText}>Carregando dados financeiros...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatório Financeiro</Text>
        <View style={styles.viewSelector}>
          <TouchableOpacity
            style={[styles.viewButton, selectedView === 'month' && styles.viewButtonActive]}
            onPress={() => setSelectedView('month')}
          >
            <Text style={[styles.viewButtonText, selectedView === 'month' && styles.viewButtonTextActive]}>
              Mensal
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.viewButton, selectedView === 'year' && styles.viewButtonActive]}
            onPress={() => setSelectedView('year')}
          >
            <Text style={[styles.viewButtonText, selectedView === 'year' && styles.viewButtonTextActive]}>
              Anual
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderSummary()}
      
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>
          {selectedView === 'month' ? 'Ganhos por Dia' : 'Ganhos por Mês'}
        </Text>
        {selectedView === 'month' ? renderMonthlyChart() : renderYearlyChart()}
      </View>
      
      {selectedView === 'month' && renderLocationDistribution()}
      {selectedView === 'month' && renderLocationsList()}
      {renderForecast()}
      {renderLocationModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginTop: 10,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  viewButtonActive: {
    backgroundColor: '#1e88e5',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#666',
  },
  viewButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  summaryContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  chartContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 10,
    marginVertical: 8,
  },
  noDataContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
  locationsContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  locationItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  locationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
  locationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  locationShifts: {
    fontSize: 12,
    color: '#666',
  },
  locationAverage: {
    fontSize: 12,
    color: '#666',
  },
  forecastContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    marginBottom: 30,
  },
  totalPotentialContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPotentialLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalPotentialValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: screenWidth - 40,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  shiftItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  shiftDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  shiftDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shiftType: {
    fontSize: 12,
    color: '#666',
  },
  shiftValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e88e5',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#1e88e5',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  }
});

export default FinancialReportScreen; 