import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID
} from '@env';

// Verificar se as variáveis de ambiente estão definidas
const validateEnvVariables = () => {
  const variables = [
    { name: 'API_KEY', value: API_KEY },
    { name: 'AUTH_DOMAIN', value: AUTH_DOMAIN },
    { name: 'PROJECT_ID', value: PROJECT_ID },
    { name: 'STORAGE_BUCKET', value: STORAGE_BUCKET },
    { name: 'MESSAGING_SENDER_ID', value: MESSAGING_SENDER_ID },
    { name: 'APP_ID', value: APP_ID }
  ];
  
  const missingVariables = variables
    .filter(variable => !variable.value)
    .map(variable => variable.name);
    
  if (missingVariables.length > 0) {
    console.error(`Erro: As seguintes variáveis de ambiente estão faltando: ${missingVariables.join(', ')}`);
    console.error('Por favor, verifique se o arquivo .env está configurado corretamente.');
    throw new Error('Variáveis de ambiente do Firebase estão faltando');
  }
};

// Executar validação
validateEnvVariables();

// Configuração do Firebase
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Chave para armazenar informações do usuário no AsyncStorage
const USER_INFO_KEY = '@finscale/user_info';

/**
 * Faz login do usuário com email e senha
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Objeto com informações do usuário
 */
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Buscar informações adicionais do usuário do Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    // Combinar dados da autenticação com dados do Firestore
    const userInfo = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || userData.displayName,
      photoURL: user.photoURL || userData.photoURL,
      ...userData
    };
    
    // Salvar informações do usuário no AsyncStorage
    await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    
    return userInfo;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

/**
 * Registra um novo usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @param {Object} userData - Dados adicionais do usuário
 * @returns {Promise<Object>} Objeto com informações do usuário
 */
export const registerUser = async (email, password, userData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Atualizar perfil do usuário
    if (userData.displayName) {
      await updateProfile(user, {
        displayName: userData.displayName
      });
    }
    
    // Salvar dados adicionais no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      displayName: userData.displayName || '',
      profession: userData.profession || '',
      specialization: userData.specialization || '',
      crm: userData.crm || '',
      phoneNumber: userData.phoneNumber || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Buscar informações completas do usuário
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userInfo = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      ...userDoc.data()
    };
    
    // Salvar informações do usuário no AsyncStorage
    await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    
    return userInfo;
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    throw error;
  }
};

/**
 * Recupera a senha de um usuário
 * @param {string} email - Email do usuário
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Erro ao recuperar senha:', error);
    throw error;
  }
};

/**
 * Atualiza os dados do usuário
 * @param {string} uid - ID do usuário
 * @param {Object} userData - Dados do usuário para atualizar
 * @returns {Promise<Object>} Objeto com informações atualizadas do usuário
 */
export const updateUserData = async (uid, userData) => {
  try {
    const userRef = doc(db, 'users', uid);
    
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    
    // Atualizar o displayName no Auth se fornecido
    if (userData.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: userData.displayName
      });
    }
    
    // Buscar dados atualizados
    const userDoc = await getDoc(userRef);
    const updatedUserInfo = {
      uid,
      email: auth.currentUser?.email,
      displayName: auth.currentUser?.displayName,
      ...userDoc.data()
    };
    
    // Atualizar informações no AsyncStorage
    await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(updatedUserInfo));
    
    return updatedUserInfo;
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
    throw error;
  }
};

/**
 * Busca informações do usuário atual
 * @returns {Promise<Object|null>} Objeto com informações do usuário ou null se não estiver logado
 */
export const getCurrentUser = async () => {
  try {
    // Tentar obter do AsyncStorage primeiro (mais rápido)
    const userInfoString = await AsyncStorage.getItem(USER_INFO_KEY);
    
    if (userInfoString) {
      return JSON.parse(userInfoString);
    }
    
    // Se não tiver no AsyncStorage, mas estiver logado, buscar do Firestore
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (userDoc.exists()) {
        const userInfo = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          ...userDoc.data()
        };
        
        // Salvar no AsyncStorage para futuras consultas
        await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
        
        return userInfo;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    return null;
  }
};

/**
 * Faz logout do usuário
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
    await AsyncStorage.removeItem(USER_INFO_KEY);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};

/**
 * Busca plantões disponíveis
 * @param {Object} filters - Filtros a serem aplicados
 * @returns {Promise<Array>} Array de plantões
 */
export const getAvailableShifts = async (filters = {}) => {
  try {
    const shiftsCollection = collection(db, 'shifts');
    let shiftsQuery = query(shiftsCollection, where('status', '==', 'available'));
    
    // Aplicar filtros adicionais se fornecidos
    if (filters.specialty) {
      shiftsQuery = query(shiftsQuery, where('specialty', '==', filters.specialty));
    }
    
    if (filters.location) {
      shiftsQuery = query(shiftsQuery, where('location', '==', filters.location));
    }
    
    if (filters.minValue) {
      shiftsQuery = query(shiftsQuery, where('value', '>=', filters.minValue));
    }
    
    // Ordenar por data
    shiftsQuery = query(shiftsQuery, orderBy('date', 'asc'));
    
    const querySnapshot = await getDocs(shiftsQuery);
    const shifts = [];
    
    querySnapshot.forEach((doc) => {
      shifts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return shifts;
  } catch (error) {
    console.error('Erro ao buscar plantões:', error);
    throw error;
  }
};

/**
 * Busca plantões do usuário
 * @param {string} userId - ID do usuário
 * @param {string} status - Status dos plantões a serem buscados (opcional)
 * @returns {Promise<Array>} Array de plantões do usuário
 */
export const getUserShifts = async (userId, status = null) => {
  try {
    const shiftsCollection = collection(db, 'shifts');
    let shiftsQuery;
    
    if (status) {
      shiftsQuery = query(
        shiftsCollection, 
        where('doctorId', '==', userId),
        where('status', '==', status),
        orderBy('date', 'asc')
      );
    } else {
      shiftsQuery = query(
        shiftsCollection, 
        where('doctorId', '==', userId),
        orderBy('date', 'asc')
      );
    }
    
    const querySnapshot = await getDocs(shiftsQuery);
    const shifts = [];
    
    querySnapshot.forEach((doc) => {
      shifts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return shifts;
  } catch (error) {
    console.error('Erro ao buscar plantões do usuário:', error);
    throw error;
  }
};

/**
 * Reserva um plantão para o usuário
 * @param {string} shiftId - ID do plantão
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Objeto com informações do plantão atualizado
 */
export const bookShift = async (shiftId, userId) => {
  try {
    const shiftRef = doc(db, 'shifts', shiftId);
    const shiftDoc = await getDoc(shiftRef);
    
    if (!shiftDoc.exists()) {
      throw new Error('Plantão não encontrado');
    }
    
    const shiftData = shiftDoc.data();
    
    if (shiftData.status !== 'available') {
      throw new Error('Plantão não está disponível');
    }
    
    // Atualizar status do plantão
    await updateDoc(shiftRef, {
      status: 'booked',
      doctorId: userId,
      bookedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Buscar dados atualizados
    const updatedShiftDoc = await getDoc(shiftRef);
    
    return {
      id: shiftId,
      ...updatedShiftDoc.data()
    };
  } catch (error) {
    console.error('Erro ao reservar plantão:', error);
    throw error;
  }
};

/**
 * Cancelar reserva de plantão
 * @param {string} shiftId - ID do plantão
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Objeto com informações do plantão atualizado
 */
export const cancelShiftBooking = async (shiftId, userId) => {
  try {
    const shiftRef = doc(db, 'shifts', shiftId);
    const shiftDoc = await getDoc(shiftRef);
    
    if (!shiftDoc.exists()) {
      throw new Error('Plantão não encontrado');
    }
    
    const shiftData = shiftDoc.data();
    
    if (shiftData.doctorId !== userId) {
      throw new Error('Você não pode cancelar este plantão');
    }
    
    if (shiftData.status !== 'booked') {
      throw new Error('Plantão não está reservado');
    }
    
    // Atualizar status do plantão
    await updateDoc(shiftRef, {
      status: 'available',
      doctorId: null,
      bookedAt: null,
      updatedAt: serverTimestamp()
    });
    
    // Buscar dados atualizados
    const updatedShiftDoc = await getDoc(shiftRef);
    
    return {
      id: shiftId,
      ...updatedShiftDoc.data()
    };
  } catch (error) {
    console.error('Erro ao cancelar reserva de plantão:', error);
    throw error;
  }
};

export default {
  auth,
  db,
  loginWithEmailAndPassword,
  registerUser,
  resetPassword,
  updateUserData,
  getCurrentUser,
  logout,
  getAvailableShifts,
  getUserShifts,
  bookShift,
  cancelShiftBooking
}; 