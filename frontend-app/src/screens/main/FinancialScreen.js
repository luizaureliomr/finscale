import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const FinancialScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample data for charts
  const monthlyIncomeData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [4500, 5200, 4800, 6000, 5500, 6500],
        color: (opacity = 1) => `rgba(71, 148, 255, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ["Monthly Income"]
  };
  
  const shiftTypeData = {
    labels: ["Morning", "Evening", "Night", "Weekend"],
    datasets: [
      {
        data: [25, 18, 15, 12],
        color: (opacity = 1) => `rgba(71, 148, 255, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ["Shifts by Type"]
  };
  
  const pieChartData = [
    {
      name: "Hospital A",
      population: 45,
      color: "#4794FF",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    },
    {
      name: "Clinic B",
      population: 25,
      color: "#F67280",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    },
    {
      name: "Center C",
      population: 20,
      color: "#50E3C2",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    },
    {
      name: "Hospital D",
      population: 10,
      color: "#FFBD69",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    }
  ];

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
      r: "6",
      strokeWidth: "2",
      stroke: "#4794FF"
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Financial Dashboard</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]} 
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'shifts' && styles.activeTab]} 
          onPress={() => setActiveTab('shifts')}
        >
          <Text style={[styles.tabText, activeTab === 'shifts' && styles.activeTabText]}>Shifts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'facilities' && styles.activeTab]} 
          onPress={() => setActiveTab('facilities')}
        >
          <Text style={[styles.tabText, activeTab === 'facilities' && styles.activeTabText]}>Facilities</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'overview' && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Monthly Income (R$)</Text>
            <LineChart
              data={monthlyIncomeData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>R$ 32,500</Text>
                <Text style={styles.statLabel}>Total Income</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>58</Text>
                <Text style={styles.statLabel}>Total Shifts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>R$ 560</Text>
                <Text style={styles.statLabel}>Avg per Shift</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'shifts' && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Shifts by Type</Text>
            <BarChart
              data={shiftTypeData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              verticalLabelRotation={0}
            />
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>70</Text>
                <Text style={styles.statLabel}>Total Shifts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Upcoming</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'facilities' && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Income by Facility (%)</Text>
            <PieChart
              data={pieChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute
            />
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4</Text>
                <Text style={styles.statLabel}>Facilities</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>R$ 18,900</Text>
                <Text style={styles.statLabel}>Top Facility</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>45%</Text>
                <Text style={styles.statLabel}>Top %</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4794FF',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4794FF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#4794FF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4794FF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default FinancialScreen; 