import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

// Definições de tema inline para evitar dependências que podem falhar
const themeValues = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
  },
  borderRadius: {
    md: 8,
  },
  colors: {
    text: '#1F2937',
    textLight: '#6B7280',
    border: '#E5E7EB',
    background: '#FFFFFF',
    primary: '#2563EB',
    primaryLight: '#60A5FA',
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
    },
  }
};

// Idiomas suportados
const languages = [
  { code: 'pt-BR', name: 'Português' },
  { code: 'en-US', name: 'English' },
];

interface LanguageSelectorProps {
  // Fechado por padrão ou aberto
  initialOpen?: boolean;
}

/**
 * Componente para seleção de idioma
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ initialOpen = false }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  // Idioma atual
  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Alternar entre aberto e fechado
  const toggleOpen = () => setIsOpen(!isOpen);

  // Mudar idioma
  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={toggleOpen}
        activeOpacity={0.7}
      >
        <Text style={styles.currentLang}>{currentLang.name}</Text>
        <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          {languages.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langOption,
                lang.code === currentLang.code && styles.activeLang,
              ]}
              onPress={() => changeLanguage(lang.code)}
              disabled={lang.code === currentLang.code}
            >
              <Text
                style={[
                  styles.langText,
                  lang.code === currentLang.code && styles.activeLangText,
                ]}
              >
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: themeValues.spacing.md,
    paddingVertical: themeValues.spacing.xs,
    borderRadius: themeValues.borderRadius.md,
    borderWidth: 1,
    borderColor: themeValues.colors.border,
    backgroundColor: themeValues.colors.background,
  },
  currentLang: {
    color: themeValues.colors.text,
    fontSize: themeValues.typography.fontSize.sm,
    marginRight: themeValues.spacing.sm,
  },
  arrow: {
    fontSize: themeValues.typography.fontSize.xs,
    color: themeValues.colors.textLight,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: 150,
    marginTop: themeValues.spacing.xs,
    backgroundColor: themeValues.colors.background,
    borderRadius: themeValues.borderRadius.md,
    borderWidth: 1,
    borderColor: themeValues.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  langOption: {
    paddingHorizontal: themeValues.spacing.md,
    paddingVertical: themeValues.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: themeValues.colors.border,
  },
  activeLang: {
    backgroundColor: themeValues.colors.primaryLight + '20', // 20% de opacidade
  },
  langText: {
    fontSize: themeValues.typography.fontSize.sm,
    color: themeValues.colors.text,
  },
  activeLangText: {
    color: themeValues.colors.primary,
    fontWeight: '500',
  },
});

export default LanguageSelector; 