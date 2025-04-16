import React, { createContext, useContext } from 'react';
import theme from './index';

// Criar contexto do tema
export const ThemeContext = createContext(theme);

// Hook para acessar o tema
export const useTheme = () => useContext(ThemeContext);

// Componente ThemeProvider
export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Exportar também o tema diretamente para uso sem contexto
export default theme; 