import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from '../../firebase.config';

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Serviço de autenticação
export const authService = {
  // Verificar estado de autenticação
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  // Login com email e senha
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        user: userCredential.user,
        success: true
      };
    } catch (error) {
      console.error("Erro no login:", error);
      return {
        error: error.message,
        success: false
      };
    }
  },

  // Registro de novo usuário
  register: async (email, password, userData = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar o perfil do usuário
      if (userData.displayName) {
        await updateProfile(userCredential.user, { 
          displayName: userData.displayName,
          photoURL: userData.photoURL || null
        });
      }
      
      // Criar documento na coleção users
      if (userCredential.user.uid) {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          displayName: userData.displayName || '',
          createdAt: new Date().toISOString(),
          role: 'user',
          ...userData
        });
      }
      
      return {
        user: userCredential.user,
        success: true
      };
    } catch (error) {
      console.error("Erro no registro:", error);
      return {
        error: error.message,
        success: false
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Erro no logout:", error);
      return {
        error: error.message,
        success: false
      };
    }
  },

  // Obter usuário atual
  getCurrentUser: () => {
    return auth.currentUser;
  },
  
  // Enviar e-mail de redefinição de senha
  sendPasswordReset: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error("Erro ao enviar e-mail de redefinição:", error);
      return {
        error: error.message,
        success: false
      };
    }
  },
  
  // Atualizar dados do perfil
  updateUserProfile: async (userData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado");
      
      // Atualizar profile com displayName e photoURL
      if (userData.displayName || userData.photoURL) {
        await updateProfile(user, {
          displayName: userData.displayName || user.displayName,
          photoURL: userData.photoURL || user.photoURL
        });
      }
      
      // Atualizar documento do usuário no Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
      
      return { success: true, user };
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      return {
        error: error.message,
        success: false
      };
    }
  }
};

// Serviço para gerenciar dados de usuários
export const userService = {
  // Obter dados do usuário atual
  getCurrentUserData: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado");
      
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { 
          success: true, 
          data: { uid: user.uid, ...userSnap.data() }
        };
      } else {
        throw new Error("Dados do usuário não encontrados");
      }
    } catch (error) {
      console.error("Erro ao obter dados do usuário:", error);
      return {
        error: error.message,
        success: false
      };
    }
  }
};

export { auth, db }; 