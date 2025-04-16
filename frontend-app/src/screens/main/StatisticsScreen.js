import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import ApiService, { showApiError } from '../../services/apiService';
import { MockService } from '../../services/mockService';
import { colors } from '../../theme';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PERIODS = {
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
};

const StatisticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [period, setPeriod] = useState(PERIODS.YEAR);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const fetchStatistics = useCallback(async (selectedPeriod = period) => {
    try {
      setError(null);
      if (!refreshing) setLoading(true);

      if (!userId) {
        const currentUser = await ApiService.getCurrentUser();
        if (currentUser) {
          setUserId(currentUser.id);
        } else {
          throw new Error('Não foi possível obter o usuário atual');
        }
      }

      const stats = await ApiService.getUserStatistics(userId, selectedPeriod);
      setStatistics(stats);
    } catch (err) {
      console.error('Erro ao obter estatísticas:', err);
      setError(err.message || 'Não foi possível carregar as estatísticas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, userId, refreshing]);

  useFocusEffect(
    useCallback(() => {
      fetchStatistics();
    }, [fetchStatistics])
  );

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    fetchStatistics(newPeriod);
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStatistics();
  }, [fetchStatistics]);

  const getEarningsChartData = () => {
    if (!statistics || !statistics.earnings) return null;

    if (period === PERIODS.WEEK) {
      return {
        labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        datasets: [
          {
            data: statistics.earnings.slice(-7).map(item => item.value),
            color: (opacity = 1) => `rgba(41, 128, 185, ${opacity})`,
          }
        ]
      };
    }

    if (period === PERIODS.MONTH) {
      return {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        datasets: [
          {
            data: statistics.earnings.slice(-4).map(item => item.value),
            color: (opacity = 1) => `rgba(41, 128, 185, ${opacity})`,
          }
        ]
      };
    }

    return {
      labels: statistics.earnings.map(item => item.month),
      datasets: [
        {
          data: statistics.earnings.map(item => item.value),
          color: (opacity = 1) => `rgba(41, 128, 185, ${opacity})`,
        }
      ]
    };
  };

  const getShiftsChartData = () => {
    if (!statistics || !statistics.shifts) return null;

    return {
      labels: ['Concluídos', 'Agendados', 'Cancelados'],
      datasets: [
        {
          data: [
            statistics.shifts.completed || 0,
            statistics.shifts.upcoming || 0,
            statistics.shifts.cancelled || 0
          ]
        }
      ]
    };
  };

  const getSpecialtiesChartData = () => {
    if (!statistics || !statistics.specialties || statistics.specialties.length === 0) return null;

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#C9CBCF', '#7DCEA0', '#F1948A', '#85C1E9'
    ];

    return statistics.specialties.map((specialty, index) => ({
      name: specialty.name,
      count: specialty.count,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }));
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726'
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodContainer}>
      <Text style={styles.sectionTitle}>Período:</Text>
      <View style={styles.periodButtons}>
        <TouchableOpacity
          style={[styles.periodButton, period === PERIODS.WEEK && styles.periodButtonActive]}
          onPress={() => handlePeriodChange(PERIODS.WEEK)}
        >
          <Text style={[
            styles.periodButtonText,
            period === PERIODS.WEEK && styles.periodButtonTextActive
          ]}>Semana</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === PERIODS.MONTH && styles.periodButtonActive]}
          onPress={() => handlePeriodChange(PERIODS.MONTH)}
        >
          <Text style={[
            styles.periodButtonText,
            period === PERIODS.MONTH && styles.periodButtonTextActive
          ]}>Mês</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === PERIODS.YEAR && styles.periodButtonActive]}
          onPress={() => handlePeriodChange(PERIODS.YEAR)}
        >
          <Text style={[
            styles.periodButtonText,
            period === PERIODS.YEAR && styles.periodButtonTextActive
          ]}>Ano</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSummary = () => {
    if (!statistics) return null;

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            R$ {statistics.totalEarnings?.toFixed(2).replace('.', ',')}
          </Text>
          <Text style={styles.summaryLabel}>Ganhos Totais</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{statistics.totalShifts || 0}</Text>
          <Text style={styles.summaryLabel}>Plantões Realizados</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{statistics.averageRating || '-'}</Text>
          <Text style={styles.summaryLabel}>Avaliação Média</Text>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Carregando estatísticas...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchStatistics()}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!statistics) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="insert-chart" size={48} color="#BDBDBD" />
          <Text style={styles.emptyText}>Nenhuma estatística disponível</Text>
        </View>
      );
    }

    const earningsData = getEarningsChartData();
    const shiftsData = getShiftsChartData();
    const specialtiesData = getSpecialtiesChartData();

    return (
      <>
        {renderPeriodSelector()}
        {renderSummary()}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ganhos</Text>
          {earningsData && (
            <LineChart
              data={earningsData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Plantões</Text>
          {shiftsData && (
            <BarChart
              data={shiftsData}
              width={width - 40}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
              }}
              style={styles.chart}
            />
          )}
        </View>

        {specialtiesData && specialtiesData.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Especialidades</Text>
            <PieChart
              data={specialtiesData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.title}>Estatísticas e Desempenho</Text>
        
        {renderContent()}
        
        <View style={styles.modeContainer}>
          <Text style={styles.modeText}>
            Modo de teste: {MockService.isEnabled() ? 'Ativado' : 'Desativado'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 10,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    marginBottom: 20,
  },
  errorText: {
    color: '#CC4444',
    fontSize: 14,
  },
  modeContainer: {
    alignItems: 'center',
    padding: 10,
    marginBottom: 20,
  },
  modeText: {
    color: colors.textLight,
    fontSize: 12,
  },
  periodContainer: {
    marginBottom: 20,
  },
  periodButtons: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: '#EAECEF',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  periodButtonTextActive: {
    color: '#2C3E50',
    fontWeight: '600',
  },
  sectionContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default StatisticsScreen; 