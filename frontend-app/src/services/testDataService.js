// import firestore from '@react-native-firebase/firestore';
// import auth from '@react-native-firebase/auth';
import { getFirestore, collection, doc, batch, serverTimestamp, where, getDocs, setDoc, deleteDoc, Timestamp, writeBatch, query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebase from '../services/firebase';

/**
 * Serviço para gerenciar dados de teste
 * Inclui funcionalidades para criar e limpar dados de teste
 */
class TestDataService {
  constructor() {
    // Prefixo para identificar dados de teste
    this.TEST_PREFIX = 'TEST_';
    
    // Coleções que podem conter dados de teste
    this.collections = ['shifts', 'users', 'notifications'];
    
    // Inicializa serviços do Firebase
    this.auth = getAuth();
    this.db = getFirestore();
  }

  /**
   * Cria dados de teste para o usuário atual
   * @param {number} count - Quantidade de registros a criar
   * @returns {Promise<Object>} Resultado da operação
   */
  async createTestShifts(count = 5) {
    try {
      const userId = this.auth.currentUser?.uid;
      
      if (!userId) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }
      
      const batchWrite = writeBatch(this.db);
      const createdIds = [];
      
      // Criar plantões de teste
      for (let i = 0; i < count; i++) {
        const shiftRef = doc(collection(this.db, 'shifts'));
        createdIds.push(shiftRef.id);
        
        // Data aleatória nos próximos 30 dias
        const randomDays = Math.floor(Math.random() * 30);
        const date = new Date();
        date.setDate(date.getDate() + randomDays);
        
        // Criar documento com prefixo de teste
        batchWrite.set(shiftRef, {
          userId,
          institution: `${this.TEST_PREFIX}Hospital ${i + 1}`,
          date: Timestamp.fromDate(date),
          time: '08:00 - 20:00',
          duration: 12,
          value: (Math.random() * 1000 + 500).toFixed(2),
          status: ['Pendente', 'Confirmado', 'Concluído'][Math.floor(Math.random() * 3)],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isTestData: true // Marcador para facilitar limpeza
        });
      }
      
      await batchWrite.commit();
      
      return {
        success: true,
        message: `${count} plantões de teste criados com sucesso`,
        data: createdIds
      };
    } catch (error) {
      console.error('Erro ao criar dados de teste:', error);
      return {
        success: false,
        error: error.message || 'Erro ao criar dados de teste'
      };
    }
  }

  /**
   * Remove todos os dados de teste
   * @returns {Promise<Object>} Resultado da operação
   */
  async cleanupTestData() {
    try {
      const userId = this.auth.currentUser?.uid;
      
      if (!userId) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }
      
      let totalRemoved = 0;
      
      // Limpar todas as coleções configuradas
      for (const collectionName of this.collections) {
        // Buscar por documentos marcados como dados de teste
        const testDataQuery = query(
          collection(this.db, collectionName),
          where('userId', '==', userId),
          where('isTestData', '==', true)
        );
        
        const testDataSnapshot = await getDocs(testDataQuery);
        
        if (!testDataSnapshot.empty) {
          const batchWrite = writeBatch(this.db);
          
          testDataSnapshot.docs.forEach(doc => {
            batchWrite.delete(doc.ref);
            totalRemoved++;
          });
          
          await batchWrite.commit();
        }
        
        // Buscar também por documentos com prefixo de teste
        // (para compatibilidade com dados antigos)
        const prefixQuery = query(
          collection(this.db, collectionName),
          where('userId', '==', userId)
        );
        
        const prefixSnapshot = await getDocs(prefixQuery);
          
        if (!prefixSnapshot.empty) {
          const batchWrite = writeBatch(this.db);
          let batchCount = 0;
          
          for (const docSnapshot of prefixSnapshot.docs) {
            // Verifica se algum campo de texto começa com o prefixo de teste
            const data = docSnapshot.data();
            let isTestData = false;
            
            for (const key in data) {
              if (
                typeof data[key] === 'string' && 
                data[key].startsWith(this.TEST_PREFIX)
              ) {
                isTestData = true;
                break;
              }
            }
            
            if (isTestData) {
              batchWrite.delete(docSnapshot.ref);
              batchCount++;
              totalRemoved++;
              
              // Firebase limita batch a 500 operações
              if (batchCount >= 450) {
                await batchWrite.commit();
                batchCount = 0;
              }
            }
          }
          
          if (batchCount > 0) {
            await batchWrite.commit();
          }
        }
      }
      
      return {
        success: true,
        message: `${totalRemoved} registros de teste removidos com sucesso`
      };
    } catch (error) {
      console.error('Erro ao limpar dados de teste:', error);
      return {
        success: false,
        error: error.message || 'Erro ao limpar dados de teste'
      };
    }
  }

  /**
   * Configura limpeza automatizada para executar após um tempo
   * @param {number} timeoutMinutes - Tempo em minutos para executar limpeza
   * @returns {number} ID do timer para possível cancelamento
   */
  setupAutomaticCleanup(timeoutMinutes = 60) {
    console.log(`Limpeza automática agendada para ${timeoutMinutes} minutos`);
    
    // Converter minutos para milissegundos
    const timeoutMs = timeoutMinutes * 60 * 1000;
    
    // Configurar timeout para limpeza
    const timerId = setTimeout(() => {
      console.log('Executando limpeza automática de dados de teste...');
      this.cleanupTestData()
        .then(result => {
          if (result.success) {
            console.log(result.message);
          } else {
            console.error('Falha na limpeza automática:', result.error);
          }
        })
        .catch(error => {
          console.error('Erro na limpeza automática:', error);
        });
    }, timeoutMs);
    
    return timerId;
  }

  /**
   * Cancela uma limpeza automatizada agendada
   * @param {number} timerId - ID do timer retornado por setupAutomaticCleanup
   */
  cancelAutomaticCleanup(timerId) {
    if (timerId) {
      clearTimeout(timerId);
      console.log('Limpeza automática cancelada');
    }
  }
}

// Exporta como singleton
export default new TestDataService(); 