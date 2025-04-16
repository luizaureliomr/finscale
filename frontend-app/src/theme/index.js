// Tema da aplicação em JavaScript
const theme = {
  // Cores principais
  colors: {
    primary: '#2563EB',
    primaryDark: '#1E40AF',
    primaryLight: '#60A5FA',
    secondary: '#10B981',
    secondaryDark: '#059669',
    secondaryLight: '#6EE7B7',
    
    // Feedback
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Neutros
    text: '#1F2937',
    textLight: '#6B7280',
    textInverted: '#FFFFFF',
    background: '#FFFFFF',
    backgroundLight: '#F9FAFB',
    backgroundDark: '#F3F4F6',
    border: '#E5E7EB',
    
    // Status de plantões
    shiftScheduled: '#3B82F6',
    shiftCompleted: '#22C55E',
    shiftCanceled: '#EF4444',
  },
  
  // Espaçamentos
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Tipografia
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 30,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // Bordas
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Sombras
  shadows: {
    none: 'none',
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Breakpoints para responsividade
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  },
};

// Exportações
export default theme;
export const colors = theme.colors;
export const spacing = theme.spacing;
export const typography = theme.typography;
export const borderRadius = theme.borderRadius;
export const shadows = theme.shadows;
export const breakpoints = theme.breakpoints; 