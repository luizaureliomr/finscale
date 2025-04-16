import { useState, useEffect, useMemo } from 'react';
import shiftService from '../services/shiftService';
import { formatUtils } from '../utils/formatUtils';

/**
 * Hook personalizado para encapsular toda a lógica de negócio da tela de estatísticas
 * Separa a lógica do componente de UI, melhorando a manutenibilidade
 */
const useStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalShifts: 0,
    totalHours: 0,
    totalValue: 0
  });
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState(null);

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    return formatUtils.formatCurrency(value);
  };

  // Carregar os dados quando o hook for montado
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar estatísticas e plantões do serviço
        const [shiftStats, shiftsData] = await Promise.all([
          shiftService.getShiftStats(),
          shiftService.getAllShifts()
        ]);
        
        // Validar e formatar os dados de estatísticas
        const validatedStats = {
          totalShifts: shiftStats?.totalShifts || 0,
          totalHours: shiftStats?.totalHours || 0,
          totalValue: shiftStats?.totalValue || 0
        };
        
        // Validar plantões recebidos
        const validatedShifts = Array.isArray(shiftsData) ? shiftsData : [];
        
        setStats(validatedStats);
        setShifts(validatedShifts);
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
        setError('Erro ao carregar estatísticas. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Função de limpeza que será executada ao desmontar o componente
    return () => {
      // Cancelar qualquer requisição pendente ou timer se necessário
    };
  }, []);
  
  // Processar os dados para os gráficos usando useMemo para evitar recálculos desnecessários
  const chartData = useMemo(() => {
    if (!shifts.length) {
      return {
        incomeData: { labels: [], datasets: [{ data: [] }] },
        hoursData: { labels: [], datasets: [{ data: [] }] },
        shiftsData: { labels: [], datasets: [{ data: [] }] },
        pieData: []
      };
    }
    
    try {
      // Agrupar por mês para gráficos de linha e barra
      const monthlyData = {};
      const institutionData = {};
      
      // Últimos 6 meses (incluindo o atual)
      const monthLabels = [];
      const currentDate = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(currentDate);
        monthDate.setMonth(currentDate.getMonth() - i);
        const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`;
        const monthLabel = monthDate.toLocaleDateString('pt-BR', { month: 'short' });
        
        monthLabels.push(monthLabel);
        monthlyData[monthKey] = { value: 0, hours: 0, count: 0 };
      }
      
      // Processar cada plantão
      shifts.forEach(shift => {
        if (!shift.date) return;
        
        const shiftDate = new Date(shift.date);
        const monthKey = `${shiftDate.getFullYear()}-${shiftDate.getMonth() + 1}`;
        
        // Acumular dados mensais
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].value += Number(shift.value) || 0;
          monthlyData[monthKey].hours += Number(shift.hours) || 0;
          monthlyData[monthKey].count += 1;
        }
        
        // Acumular dados por instituição
        const institution = shift.institution || 'Não especificado';
        if (!institutionData[institution]) {
          institutionData[institution] = 0;
        }
        institutionData[institution] += Number(shift.value) || 0;
      });
      
      // Preparar datasets
      const monthKeys = Object.keys(monthlyData).sort();
      
      const incomeValues = monthKeys.map(key => monthlyData[key].value);
      const hoursValues = monthKeys.map(key => monthlyData[key].hours);
      const shiftsValues = monthKeys.map(key => monthlyData[key].count);
      
      // Criar dados para o gráfico de pizza
      const pieData = Object.entries(institutionData)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          population: value,
          color: generateColor(name),
          legendFontColor: '#7F7F7F',
          legendFontSize: 12
        }));
      
      return {
        incomeData: {
          labels: monthLabels,
          datasets: [{ data: incomeValues }]
        },
        hoursData: {
          labels: monthLabels,
          datasets: [{ data: hoursValues }]
        },
        shiftsData: {
          labels: monthLabels,
          datasets: [{ data: shiftsValues }]
        },
        pieData
      };
    } catch (err) {
      console.error('Erro ao processar dados para gráficos:', err);
      setError('Erro ao processar dados estatísticos.');
      
      return {
        incomeData: { labels: [], datasets: [{ data: [] }] },
        hoursData: { labels: [], datasets: [{ data: [] }] },
        shiftsData: { labels: [], datasets: [{ data: [] }] },
        pieData: []
      };
    }
  }, [shifts]);
  
  // Função auxiliar para gerar cores para o gráfico de pizza
  const generateColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
  };
  
  return {
    loading,
    error,
    stats,
    shifts,
    chartData,
    formatCurrency
  };
};

export default useStatistics; 