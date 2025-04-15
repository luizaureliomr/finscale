import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import notificationService from './notificationService';

// Serviço para gerenciar plantões
export const shiftService = {
  // Obter todos os plantões do usuário atual
  getUserShifts: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado");
      
      const shiftsRef = collection(db, "shifts");
      const q = query(
        shiftsRef,
        where("userId", "==", user.uid),
        orderBy("date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const shifts = [];
      
      querySnapshot.forEach((doc) => {
        shifts.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: shifts
      };
    } catch (error) {
      console.error("Erro ao obter plantões:", error);
      return {
        error: error.message,
        success: false
      };
    }
  },
  
  // Obter plantões por status
  getShiftsByStatus: async (status) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado");
      
      const shiftsRef = collection(db, "shifts");
      const q = query(
        shiftsRef,
        where("userId", "==", user.uid),
        where("status", "==", status),
        orderBy("date", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const shifts = [];
      
      querySnapshot.forEach((doc) => {
        shifts.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: shifts
      };
    } catch (error) {
      console.error("Erro ao obter plantões por status:", error);
      return {
        error: error.message,
        success: false
      };
    }
  },
  
  // Obter próximos plantões
  getUpcomingShifts: async (limit = 5) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado");
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const shiftsRef = collection(db, "shifts");
      const q = query(
        shiftsRef,
        where("userId", "==", user.uid),
        where("date", ">=", today.toISOString().split('T')[0]),
        orderBy("date", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const shifts = [];
      
      querySnapshot.forEach((doc) => {
        shifts.push({
          id: doc.id,
          ...doc.data()
        });
        
        if (shifts.length >= limit) return;
      });
      
      return {
        success: true,
        data: shifts
      };
    } catch (error) {
      console.error("Erro ao obter próximos plantões:", error);
      return {
        error: error.message,
        success: false
      };
    }
  },
  
  // Adicionar novo plantão
  addShift: async (shiftData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado");
      
      const shiftsRef = collection(db, "shifts");
      const newShift = {
        userId: user.uid,
        createdAt: serverTimestamp(),
        ...shiftData,
        notificationId: null // Inicializar sem notificação
      };
      
      const docRef = await addDoc(shiftsRef, newShift);
      
      // Agendar notificação para o plantão
      if (shiftData.status !== 'Concluído') {
        try {
          // Solicitar permissões para notificações
          await notificationService.requestPermissions();
          
          // Agendar notificação
          const shiftWithId = { ...newShift, id: docRef.id };
          const notificationResult = await notificationService.scheduleShiftNotification(shiftWithId);
          
          if (notificationResult.success) {
            // Atualizar o documento com o ID da notificação
            await updateDoc(docRef, {
              notificationId: notificationResult.notificationId
            });
            
            newShift.notificationId = notificationResult.notificationId;
          }
        } catch (notificationError) {
          console.error("Erro ao agendar notificação:", notificationError);
          // Não falhar a operação principal se a notificação falhar
        }
      }
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...newShift
        }
      };
    } catch (error) {
      console.error("Erro ao adicionar plantão:", error);
      return {
        error: error.message,
        success: false
      };
    }
  },
  
  // Atualizar plantão existente
  updateShift: async (shiftId, shiftData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado");
      
      // Verificar se o plantão pertence ao usuário
      const shiftRef = doc(db, "shifts", shiftId);
      const shiftSnap = await getDoc(shiftRef);
      
      if (!shiftSnap.exists()) {
        throw new Error("Plantão não encontrado");
      }
      
      if (shiftSnap.data().userId !== user.uid) {
        throw new Error("Você não tem permissão para editar este plantão");
      }
      
      const currentShift = shiftSnap.data();
      
      // Cancelar notificação existente
      if (currentShift.notificationId) {
        try {
          await notificationService.cancelNotification(currentShift.notificationId);
        } catch (cancelError) {
          console.error("Erro ao cancelar notificação:", cancelError);
          // Não falhar a operação principal se o cancelamento da notificação falhar
        }
      }
      
      // Atualizar o plantão
      const updateData = {
        ...shiftData,
        updatedAt: serverTimestamp(),
        notificationId: null // Remover notificação existente
      };
      
      await updateDoc(shiftRef, updateData);
      
      // Agendar nova notificação para o plantão
      if (shiftData.status !== 'Concluído') {
        try {
          // Solicitar permissões para notificações
          await notificationService.requestPermissions();
          
          // Agendar notificação
          const shiftWithId = { ...shiftData, id: shiftId };
          const notificationResult = await notificationService.scheduleShiftNotification(shiftWithId);
          
          if (notificationResult.success) {
            // Atualizar o documento com o novo ID da notificação
            await updateDoc(shiftRef, {
              notificationId: notificationResult.notificationId
            });
            
            updateData.notificationId = notificationResult.notificationId;
          }
        } catch (notificationError) {
          console.error("Erro ao agendar notificação:", notificationError);
          // Não falhar a operação principal se a notificação falhar
        }
      }
      
      return {
        success: true,
        data: {
          id: shiftId,
          ...updateData
        }
      };
    } catch (error) {
      console.error("Erro ao atualizar plantão:", error);
      return {
        error: error.message,
        success: false
      };
    }
  },
  
  // Excluir plantão
  deleteShift: async (shiftId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado");
      
      // Verificar se o plantão pertence ao usuário
      const shiftRef = doc(db, "shifts", shiftId);
      const shiftSnap = await getDoc(shiftRef);
      
      if (!shiftSnap.exists()) {
        throw new Error("Plantão não encontrado");
      }
      
      if (shiftSnap.data().userId !== user.uid) {
        throw new Error("Você não tem permissão para excluir este plantão");
      }
      
      // Cancelar notificação associada, se houver
      const currentShift = shiftSnap.data();
      if (currentShift.notificationId) {
        try {
          await notificationService.cancelNotification(currentShift.notificationId);
        } catch (cancelError) {
          console.error("Erro ao cancelar notificação:", cancelError);
          // Não falhar a operação principal se o cancelamento da notificação falhar
        }
      }
      
      // Excluir o plantão
      await deleteDoc(shiftRef);
      
      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir plantão:", error);
      return {
        error: error.message,
        success: false
      };
    }
  },
  
  // Obter estatísticas de plantões
  getShiftStats: async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado");
      
      const shiftsRef = collection(db, "shifts");
      const q = query(
        shiftsRef,
        where("userId", "==", user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      
      let totalShifts = 0;
      let totalHours = 0;
      let totalValue = 0;
      
      querySnapshot.forEach((doc) => {
        const shift = doc.data();
        totalShifts++;
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
      console.error("Erro ao obter estatísticas de plantões:", error);
      return {
        error: error.message,
        success: false
      };
    }
  }
};

export default shiftService; 