import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * Componente para exibir uma tela de carregamento
 * @param {Object} props - Propriedades do componente
 * @param {string} props.message - Mensagem a ser exibida (opcional)
 * @param {string} props.color - Cor do indicador de carregamento (opcional)
 */
const LoadingScreen = ({ message = 'Carregando...', color = '#0066CC' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
  },
});

export default LoadingScreen; 