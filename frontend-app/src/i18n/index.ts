import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from './locales/pt-BR';
import enUS from './locales/en-US';

// Configuração de recursos
const resources = {
  'pt-BR': ptBR,
  'en-US': enUS,
};

// Forçar o idioma PT-BR independente do sistema
const userLanguage = 'pt-BR';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: userLanguage,
    fallbackLng: 'pt-BR',
    
    interpolation: {
      escapeValue: false, // React já escapa os valores
    },
    
    // Namespaces comuns a todos os idiomas
    ns: ['common', 'auth', 'profile', 'shifts'],
    defaultNS: 'common',
    
    // Garantir que o idioma seja carregado imediatamente
    initImmediate: false,
    
    // Desativar detecção automática de idioma
    detection: {
      order: [],
      caches: [],
    }
  });

// Garantir que o idioma está configurado
setTimeout(() => {
  if (i18n.language !== userLanguage) {
    i18n.changeLanguage(userLanguage);
    console.log('Idioma forçado para PT-BR');
  }
}, 0);

export default i18n; 