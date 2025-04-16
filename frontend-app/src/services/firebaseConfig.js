import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from '../../firebase.config';

// Inicializar o Firebase com tratamento de erros
let app, db, auth;

try {
  // Inicializar aplicativo Firebase
  app = initializeApp(firebaseConfig);
  
  // Inicializar Firestore
  db = getFirestore(app);
  
  // Inicializar Auth com persistência apropriada
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  
  console.log('Firebase inicializado com sucesso (com persistência)');
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
}

export { app, db, auth }; 