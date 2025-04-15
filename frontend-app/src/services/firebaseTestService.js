import { auth, db } from './firebase';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Serviço para testar a conexão com o Firebase
export const firebaseTestService = {
  // Testar conexão com Firestore
  testFirestoreConnection: async () => {
    try {
      // Tenta obter uma coleção para verificar se o Firestore está acessível
      const testCollection = collection(db, 'test_connection');
      await getDocs(testCollection);
      
      return {
        success: true,
        message: 'Conexão com Firestore estabelecida com sucesso'
      };
    } catch (error) {
      console.error('Erro ao testar conexão com Firestore:', error);
      return {
        success: false,
        error: error.message,
        message: 'Falha na conexão com Firestore. Verifique suas credenciais.'
      };
    }
  },
  
  // Testar autenticação
  testAuthConnection: async () => {
    try {
      // Apenas verificar se o objeto auth está inicializado corretamente
      if (auth) {
        return {
          success: true,
          message: 'Serviço de autenticação inicializado com sucesso'
        };
      } else {
        throw new Error('Objeto de autenticação não inicializado');
      }
    } catch (error) {
      console.error('Erro ao testar serviço de autenticação:', error);
      return {
        success: false,
        error: error.message,
        message: 'Falha na inicialização do serviço de autenticação'
      };
    }
  },
  
  // Função para testar criação de usuário (apenas para testes, não use em produção)
  testCreateUser: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Criar documento de usuário no Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        displayName: 'Usuário Teste',
        createdAt: new Date().toISOString(),
        role: 'user',
        profession: 'Médico',
        specialization: 'Clínico Geral',
        phone: '(11) 98765-4321',
        receiveNotifications: true
      });
      
      return {
        success: true,
        user: userCredential.user,
        message: 'Usuário de teste criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar usuário de teste:', error);
      return {
        success: false,
        error: error.message,
        message: 'Falha ao criar usuário de teste'
      };
    }
  },
  
  // Função para testar login
  testLogin: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      return {
        success: true,
        user: userCredential.user,
        message: 'Login de teste realizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao fazer login de teste:', error);
      return {
        success: false,
        error: error.message,
        message: 'Falha ao fazer login de teste'
      };
    }
  },
  
  // Função para testar inserção de plantão
  testCreateShift: async (userId) => {
    try {
      if (!userId) {
        throw new Error('UserID não fornecido');
      }
      
      // Data aleatória nos próximos 30 dias
      const randomDays = Math.floor(Math.random() * 30);
      const shiftDate = new Date();
      shiftDate.setDate(shiftDate.getDate() + randomDays);
      const isoDate = shiftDate.toISOString().split('T')[0];
      
      // Criar plantão de teste
      const shiftData = {
        userId,
        institution: 'Hospital Teste',
        date: isoDate,
        time: '07:00 - 19:00',
        duration: 12,
        value: 750,
        status: 'Confirmado',
        createdAt: new Date().toISOString()
      };
      
      // Adicionar documento à coleção shifts
      const shiftRef = doc(collection(db, 'shifts'));
      await setDoc(shiftRef, shiftData);
      
      return {
        success: true,
        shiftId: shiftRef.id,
        message: 'Plantão de teste criado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar plantão de teste:', error);
      return {
        success: false,
        error: error.message,
        message: 'Falha ao criar plantão de teste'
      };
    }
  }
};

export default firebaseTestService; 