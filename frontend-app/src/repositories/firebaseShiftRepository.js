import { ShiftRepositoryInterface } from './interfaces';
// import firestore from '@react-native-firebase/firestore';
// import auth from '@react-native-firebase/auth';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { formatDateBR } from '../utils/formatters';

/**
 * Implementação concreta do repositório de plantões usando Firebase
 */
export class FirebaseShiftRepository extends ShiftRepositoryInterface {
  constructor() {
    super();
    this.collection = 'shifts';
    this.db = getFirestore();
    this.auth = getAuth();
  }

  /**
   * Obtém todos os plantões do usuário atual
   * @returns {Promise<Object>} Objeto com sucesso/erro e dados
   */
  async getAllShifts() {
    try {
      const userId = this.auth.currentUser?.uid;
      
      if (!userId) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }
      
      const shiftsQuery = query(
        collection(this.db, this.collection),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      
      const shiftsSnapshot = await getDocs(shiftsQuery);
      
      const shifts = shiftsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Normaliza a data para objeto Date para comparações
        date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(doc.data().date)
      }));
      
      return {
        success: true,
        data: shifts
      };
    } catch (error) {
      return this.handleError(error, 'buscar plantões');
    }
  }

  /**
   * Obtém plantões com status específico
   * @param {string} status - Status dos plantões (opcional)
   * @returns {Promise<Object>} Objeto com sucesso/erro e dados
   */
  async getShiftsByStatus(status = null) {
    try {
      const userId = this.auth.currentUser?.uid;
      
      if (!userId) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }
      
      let queryConstraints = [
        where('userId', '==', userId),
        orderBy('date', 'desc')
      ];
      
      if (status) {
        queryConstraints.splice(1, 0, where('status', '==', status));
      }
      
      const shiftsQuery = query(
        collection(this.db, this.collection),
        ...queryConstraints
      );
      
      const shiftsSnapshot = await getDocs(shiftsQuery);
      
      const shifts = shiftsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(doc.data().date)
      }));
      
      return {
        success: true,
        data: shifts
      };
    } catch (error) {
      return this.handleError(error, 'buscar plantões por status');
    }
  }

  /**
   * Obtém plantões futuros
   * @param {number} limit - Limite de resultados (opcional)
   * @returns {Promise<Object>} Objeto com sucesso/erro e dados
   */
  async getUpcomingShifts(limitCount = 5) {
    try {
      const userId = this.auth.currentUser?.uid;
      
      if (!userId) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }
      
      // Data atual - começo do dia
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const shiftsQuery = query(
        collection(this.db, this.collection),
        where('userId', '==', userId),
        where('date', '>=', today),
        orderBy('date', 'asc'),
        limit(limitCount)
      );
      
      const shiftsSnapshot = await getDocs(shiftsQuery);
      
      const shifts = shiftsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(doc.data().date)
      }));
      
      return {
        success: true,
        data: shifts
      };
    } catch (error) {
      return this.handleError(error, 'buscar próximos plantões');
    }
  }

  /**
   * Adiciona um novo plantão
   * @param {Object} shiftData - Dados do plantão
   * @returns {Promise<Object>} Objeto com sucesso/erro e dados
   */
  async addShift(shiftData) {
    try {
      const userId = this.auth.currentUser?.uid;
      
      if (!userId) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }
      
      // Converter a data para timestamp do Firestore
      let date;
      if (typeof shiftData.date === 'string') {
        // Se for uma string no formato DD/MM/YYYY, converter para Date
        if (shiftData.date.includes('/')) {
          const [day, month, year] = shiftData.date.split('/');
          date = new Date(`${year}-${month}-${day}`);
        } else {
          date = new Date(shiftData.date);
        }
      } else if (shiftData.date instanceof Date) {
        date = shiftData.date;
      } else {
        return {
          success: false,
          error: 'Formato de data inválido'
        };
      }
      
      const data = {
        ...shiftData,
        userId,
        date: Timestamp.fromDate(date),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(this.db, this.collection), data);
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...data,
          date // Retorna como Date para o cliente
        }
      };
    } catch (error) {
      return this.handleError(error, 'adicionar plantão');
    }
  }

  /**
   * Atualiza um plantão existente
   * @param {string} shiftId - ID do plantão
   * @param {Object} shiftData - Dados para atualizar
   * @returns {Promise<Object>} Objeto com sucesso/erro e dados
   */
  async updateShift(shiftId, shiftData) {
    try {
      const userId = this.auth.currentUser?.uid;
      
      if (!userId) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }
      
      // Verificar se o plantão pertence ao usuário
      const shiftRef = doc(this.db, this.collection, shiftId);
      const shiftDoc = await getDoc(shiftRef);
      
      if (!shiftDoc.exists) {
        return {
          success: false,
          error: 'Plantão não encontrado'
        };
      }
      
      if (shiftDoc.data().userId !== userId) {
        return {
          success: false,
          error: 'Você não tem permissão para editar este plantão'
        };
      }
      
      // Converter a data para timestamp do Firestore
      let date;
      if (typeof shiftData.date === 'string') {
        // Se for uma string no formato DD/MM/YYYY, converter para Date
        if (shiftData.date.includes('/')) {
          const [day, month, year] = shiftData.date.split('/');
          date = new Date(`${year}-${month}-${day}`);
        } else {
          date = new Date(shiftData.date);
        }
      } else if (shiftData.date instanceof Date) {
        date = shiftData.date;
      } else {
        return {
          success: false,
          error: 'Formato de data inválido'
        };
      }
      
      const data = {
        ...shiftData,
        date: Timestamp.fromDate(date),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(shiftRef, data);
      
      return {
        success: true,
        data: {
          id: shiftId,
          ...data,
          date // Retorna como Date para o cliente
        }
      };
    } catch (error) {
      return this.handleError(error, 'atualizar plantão');
    }
  }

  /**
   * Remove um plantão
   * @param {string} shiftId - ID do plantão
   * @returns {Promise<Object>} Objeto com sucesso/erro
   */
  async deleteShift(shiftId) {
    try {
      const userId = this.auth.currentUser?.uid;
      
      if (!userId) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }
      
      // Verificar se o plantão pertence ao usuário
      const shiftRef = doc(this.db, this.collection, shiftId);
      const shiftDoc = await getDoc(shiftRef);
      
      if (!shiftDoc.exists) {
        return {
          success: false,
          error: 'Plantão não encontrado'
        };
      }
      
      if (shiftDoc.data().userId !== userId) {
        return {
          success: false,
          error: 'Você não tem permissão para excluir este plantão'
        };
      }
      
      await deleteDoc(shiftRef);
      
      return {
        success: true
      };
    } catch (error) {
      return this.handleError(error, 'excluir plantão');
    }
  }

  /**
   * Obtém estatísticas dos plantões
   * @returns {Promise<Object>} Objeto com sucesso/erro e dados
   */
  async getShiftStats() {
    try {
      const shiftsResult = await this.getAllShifts();
      
      if (!shiftsResult.success) {
        return shiftsResult;
      }
      
      const shifts = shiftsResult.data;
      let totalShifts = shifts.length;
      let totalHours = 0;
      let totalValue = 0;
      
      shifts.forEach(shift => {
        totalHours += parseInt(shift.duration || 0, 10);
        totalValue += parseFloat(shift.value || 0);
      });
      
      return {
        success: true,
        data: {
          totalShifts,
          totalHours,
          totalValue
        }
      };
    } catch (error) {
      return this.handleError(error, 'calcular estatísticas');
    }
  }
} 