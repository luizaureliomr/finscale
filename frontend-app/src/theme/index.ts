// Definição do tema da aplicação
const theme = {
  // Cores principais
  colors: {
    primary: '#2563EB', // Azul principal
    primaryDark: '#1E40AF',
    primaryLight: '#60A5FA',
    secondary: '#10B981', // Verde
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
    shiftScheduled: '#3B82F6', // Azul
    shiftCompleted: '#22C55E', // Verde
    shiftCanceled: '#EF4444', // Vermelho
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

export default theme;

// Tipos do tema para uso com TypeScript
export type Theme = typeof theme;
export type ColorType = keyof typeof theme.colors;
export type SpacingType = keyof typeof theme.spacing;
export type FontSizeType = keyof typeof theme.typography.fontSize;
export type FontWeightType = keyof typeof theme.typography.fontWeight;
export type BorderRadiusType = keyof typeof theme.borderRadius;
export type ShadowType = keyof typeof theme.shadows;
export type BreakpointType = keyof typeof theme.breakpoints; 