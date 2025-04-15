import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService, userService } from '../services/firebase';

// Contexto de autenticação
export const AuthContext = createContext({});

// Provider do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Observar mudanças no estado de autenticação
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      setLoading(true);
      
      if (authUser) {
        setUser(authUser);
        
        // Carregar dados adicionais do usuário
        try {
          const response = await userService.getCurrentUserData();
          if (response.success) {
            setUserData(response.data);
          }
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    // Limpar o observador quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  // Função de login
  const login = async (email, password) => {
    setLoading(true);
    const response = await authService.login(email, password);
    setLoading(false);
    return response;
  };

  // Função de registro
  const register = async (email, password, userData) => {
    setLoading(true);
    const response = await authService.register(email, password, userData);
    setLoading(false);
    return response;
  };

  // Função de logout
  const logout = async () => {
    setLoading(true);
    const response = await authService.logout();
    setLoading(false);
    return response;
  };

  // Função para recuperar senha
  const forgotPassword = async (email) => {
    setLoading(true);
    const response = await authService.sendPasswordReset(email);
    setLoading(false);
    return response;
  };

  // Função para atualizar perfil
  const updateProfile = async (userData) => {
    setLoading(true);
    const response = await authService.updateUserProfile(userData);
    
    if (response.success) {
      // Atualizar dados locais
      const newUserData = await userService.getCurrentUserData();
      if (newUserData.success) {
        setUserData(newUserData.data);
      }
    }
    
    setLoading(false);
    return response;
  };

  // Verificar se o usuário está autenticado
  const isAuthenticated = !!user;

  // Valores a serem disponibilizados no contexto
  const value = {
    user,
    userData,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para acessar o contexto de autenticação
export const useAuth = () => useContext(AuthContext); 