import firebaseService from './firebaseService';
import { collection, query, where, getDocs, orderBy, startAt, endAt, Timestamp } from 'firebase/firestore';

/**
 * Busca os ganhos do usuário em um período específico
 * @param {string} userId - ID do usuário
 * @param {Date} startDate - Data inicial
 * @param {Date} endDate - Data final
 * @returns {Promise<Object>} Objeto com informações dos ganhos
 */
export const getUserEarnings = async (userId, startDate, endDate) => {
  try {
    const db = firebaseService.db;
    const shiftsCollection = collection(db, 'shifts');
    
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    const shiftsQuery = query(
      shiftsCollection,
      where('doctorId', '==', userId),
      where('status', '==', 'completed'),
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(shiftsQuery);
    const shifts = [];
    let totalEarnings = 0;
    
    querySnapshot.forEach((doc) => {
      const shift = {
        id: doc.id,
        ...doc.data()
      };
      
      totalEarnings += shift.value;
      shifts.push(shift);
    });
    
    return {
      shifts,
      totalEarnings,
      period: {
        start: startDate,
        end: endDate
      }
    };
  } catch (error) {
    console.error('Erro ao buscar ganhos do usuário:', error);
    throw error;
  }
};

/**
 * Gera um relatório financeiro mensal
 * @param {string} userId - ID do usuário
 * @param {number} month - Mês (1-12)
 * @param {number} year - Ano
 * @returns {Promise<Object>} Objeto com informações do relatório mensal
 */
export const getMonthlyReport = async (userId, month, year) => {
  try {
    // Criar data inicial (primeiro dia do mês)
    const startDate = new Date(year, month - 1, 1);
    
    // Criar data final (último dia do mês)
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);
    
    const earningsData = await getUserEarnings(userId, startDate, endDate);
    
    // Agrupar por local
    const earningsByLocation = {};
    earningsData.shifts.forEach(shift => {
      if (!earningsByLocation[shift.location]) {
        earningsByLocation[shift.location] = {
          totalEarnings: 0,
          shifts: []
        };
      }
      
      earningsByLocation[shift.location].totalEarnings += shift.value;
      earningsByLocation[shift.location].shifts.push(shift);
    });
    
    // Calcular médias
    const totalShifts = earningsData.shifts.length;
    const averagePerShift = totalShifts > 0 
      ? earningsData.totalEarnings / totalShifts 
      : 0;
    
    return {
      ...earningsData,
      earningsByLocation,
      totalShifts,
      averagePerShift,
      month,
      year
    };
  } catch (error) {
    console.error('Erro ao gerar relatório mensal:', error);
    throw error;
  }
};

/**
 * Gera um relatório financeiro anual
 * @param {string} userId - ID do usuário
 * @param {number} year - Ano
 * @returns {Promise<Object>} Objeto com informações do relatório anual
 */
export const getYearlyReport = async (userId, year) => {
  try {
    // Criar data inicial (primeiro dia do ano)
    const startDate = new Date(year, 0, 1);
    
    // Criar data final (último dia do ano)
    const endDate = new Date(year, 11, 31);
    endDate.setHours(23, 59, 59, 999);
    
    const earningsData = await getUserEarnings(userId, startDate, endDate);
    
    // Agrupar por mês
    const earningsByMonth = Array(12).fill().map(() => ({
      totalEarnings: 0,
      shifts: []
    }));
    
    earningsData.shifts.forEach(shift => {
      const shiftDate = shift.date.toDate ? shift.date.toDate() : new Date(shift.date);
      const month = shiftDate.getMonth();
      
      earningsByMonth[month].totalEarnings += shift.value;
      earningsByMonth[month].shifts.push(shift);
    });
    
    // Calcular totais e médias
    const monthlyAverages = earningsByMonth.map(month => 
      month.shifts.length > 0 ? month.totalEarnings / month.shifts.length : 0
    );
    
    const totalShifts = earningsData.shifts.length;
    const averagePerShift = totalShifts > 0 
      ? earningsData.totalEarnings / totalShifts 
      : 0;
    
    // Calcular melhores meses
    const bestMonth = earningsByMonth.reduce(
      (best, current, index) => 
        current.totalEarnings > earningsByMonth[best].totalEarnings ? index : best, 
      0
    );
    
    return {
      ...earningsData,
      earningsByMonth,
      monthlyAverages,
      totalShifts,
      averagePerShift,
      bestMonth,
      year
    };
  } catch (error) {
    console.error('Erro ao gerar relatório anual:', error);
    throw error;
  }
};

/**
 * Gera uma previsão de ganhos para o próximo mês
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Objeto com informações da previsão
 */
export const getEarningsForecast = async (userId) => {
  try {
    const db = firebaseService.db;
    const shiftsCollection = collection(db, 'shifts');
    
    // Data atual
    const now = new Date();
    
    // Data do início do próximo mês
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Data do fim do próximo mês
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    nextMonthEnd.setHours(23, 59, 59, 999);
    
    // Buscar plantões agendados para o próximo mês
    const bookedShiftsQuery = query(
      shiftsCollection,
      where('doctorId', '==', userId),
      where('status', '==', 'booked'),
      where('date', '>=', Timestamp.fromDate(nextMonthStart)),
      where('date', '<=', Timestamp.fromDate(nextMonthEnd)),
      orderBy('date', 'asc')
    );
    
    const bookedQuerySnapshot = await getDocs(bookedShiftsQuery);
    const bookedShifts = [];
    let projectedEarnings = 0;
    
    bookedQuerySnapshot.forEach((doc) => {
      const shift = {
        id: doc.id,
        ...doc.data()
      };
      
      projectedEarnings += shift.value;
      bookedShifts.push(shift);
    });
    
    // Buscar plantões disponíveis para o próximo mês
    const availableShiftsQuery = query(
      shiftsCollection,
      where('status', '==', 'available'),
      where('date', '>=', Timestamp.fromDate(nextMonthStart)),
      where('date', '<=', Timestamp.fromDate(nextMonthEnd)),
      orderBy('date', 'asc')
    );
    
    const availableQuerySnapshot = await getDocs(availableShiftsQuery);
    const availableShifts = [];
    let potentialEarnings = 0;
    
    availableQuerySnapshot.forEach((doc) => {
      const shift = {
        id: doc.id,
        ...doc.data()
      };
      
      potentialEarnings += shift.value;
      availableShifts.push(shift);
    });
    
    return {
      projectedEarnings,
      bookedShifts,
      potentialEarnings,
      availableShifts,
      totalPotential: projectedEarnings + potentialEarnings,
      period: {
        start: nextMonthStart,
        end: nextMonthEnd
      }
    };
  } catch (error) {
    console.error('Erro ao gerar previsão de ganhos:', error);
    throw error;
  }
};

/**
 * Obtém um resumo comparativo entre períodos
 * @param {string} userId - ID do usuário
 * @param {Date} period1Start - Data inicial do primeiro período
 * @param {Date} period1End - Data final do primeiro período
 * @param {Date} period2Start - Data inicial do segundo período
 * @param {Date} period2End - Data final do segundo período
 * @returns {Promise<Object>} Objeto com informações comparativas
 */
export const getComparativeAnalysis = async (
  userId, 
  period1Start, 
  period1End, 
  period2Start, 
  period2End
) => {
  try {
    const period1Data = await getUserEarnings(userId, period1Start, period1End);
    const period2Data = await getUserEarnings(userId, period2Start, period2End);
    
    // Calcular diferenças
    const earningsDifference = period2Data.totalEarnings - period1Data.totalEarnings;
    const earningsPercentChange = period1Data.totalEarnings > 0 
      ? (earningsDifference / period1Data.totalEarnings) * 100 
      : 0;
    
    const shiftsDifference = period2Data.shifts.length - period1Data.shifts.length;
    const shiftsPercentChange = period1Data.shifts.length > 0 
      ? (shiftsDifference / period1Data.shifts.length) * 100 
      : 0;
    
    return {
      period1: {
        ...period1Data,
        avgPerShift: period1Data.shifts.length > 0 
          ? period1Data.totalEarnings / period1Data.shifts.length 
          : 0
      },
      period2: {
        ...period2Data,
        avgPerShift: period2Data.shifts.length > 0 
          ? period2Data.totalEarnings / period2Data.shifts.length 
          : 0
      },
      comparison: {
        earningsDifference,
        earningsPercentChange,
        shiftsDifference,
        shiftsPercentChange
      }
    };
  } catch (error) {
    console.error('Erro ao gerar análise comparativa:', error);
    throw error;
  }
};

export default {
  getUserEarnings,
  getMonthlyReport,
  getYearlyReport,
  getEarningsForecast,
  getComparativeAnalysis
}; 