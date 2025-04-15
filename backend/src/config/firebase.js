const admin = require('firebase-admin');
const env = require('./env');

// Inicialização do Firebase
let firebaseApp;

try {
  // Se houver configuração definida nas variáveis de ambiente
  if (env.FIREBASE_CONFIG) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(env.FIREBASE_CONFIG)
    });
  } else {
    // Em desenvolvimento, tentar carregar de um arquivo local (precisa ser criado)
    console.warn('Configuração do Firebase não encontrada nas variáveis de ambiente, tentando arquivo local');
    try {
      const serviceAccount = require('../../firebase-credentials.json');
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } catch (err) {
      console.error('Falha ao carregar credenciais do Firebase:', err.message);
      console.error('Firebase não inicializado. Autenticação e outros serviços Firebase não funcionarão.');
    }
  }
} catch (error) {
  console.error('Erro na inicialização do Firebase:', error);
}

module.exports = {
  admin,
  firebaseApp,
  auth: firebaseApp ? firebaseApp.auth() : null,
  firestore: firebaseApp ? firebaseApp.firestore() : null,
  storage: firebaseApp ? firebaseApp.storage() : null,
}; 