import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaskInput from 'react-native-mask-input';

const MaskedInput = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  mask, 
  keyboardType = 'default',
  error,
  style = {},
  ...props 
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <MaskInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        mask={mask}
        keyboardType={keyboardType}
        style={[styles.input, error ? styles.inputError : {}, style]}
        {...props}
      />
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

// Máscaras comuns
export const MASKS = {
  // Data (DD/MM/AAAA)
  DATE: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/],
  
  // Horário (HH:MM)
  TIME: [/\d/, /\d/, ':', /\d/, /\d/],
  
  // CPF (000.000.000-00)
  CPF: [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/],
  
  // Telefone ((00) 00000-0000)
  PHONE: ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
  
  // Moeda (R$ 0,00)
  CURRENCY: (value) => {
    if (!value) return [];
    
    // Remove tudo que não é número
    const cleanValue = value.replace(/\D/g, '');
    
    // Converte para número
    const valueInCents = Number(cleanValue);
    
    // Formata como moeda (R$ 0,00)
    const formatted = valueInCents
      .toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    
    // Cria a máscara dinâmica com base no valor formatado
    return Array.from(formatted).map(char => {
      if (char === 'R' || char === '$' || char === ' ' || char === '.' || char === ',' || char === '-') {
        return char;
      }
      return /\d/;
    });
  }
};

// Funções de formatação
export const formatters = {
  // Converter valor de moeda formatado (R$ 0,00) para número
  currencyToNumber: (value) => {
    if (!value) return 0;
    return Number(value.replace(/[^\d,]/g, '').replace(',', '.'));
  },
  
  // Converter data DD/MM/AAAA para YYYY-MM-DD
  dateToISO: (date) => {
    if (!date || date.length !== 10) return '';
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  },
  
  // Converter YYYY-MM-DD para DD/MM/AAAA
  isoToDate: (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  }
};

// Funções de validação
export const validators = {
  // Validar se a data está completa e é válida
  isValidDate: (date) => {
    if (!date || date.length !== 10) return false;
    
    const [day, month, year] = date.split('/').map(Number);
    
    // Verificar se o ano está entre 1900 e o ano atual + 10
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 10) return false;
    
    // Verificar se o mês é válido (1-12)
    if (month < 1 || month > 12) return false;
    
    // Verificar se o dia é válido para o mês
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) return false;
    
    return true;
  },
  
  // Validar se o horário está completo e é válido
  isValidTime: (time) => {
    if (!time || time.length !== 5) return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    
    // Verificar horas (0-23)
    if (hours < 0 || hours > 23) return false;
    
    // Verificar minutos (0-59)
    if (minutes < 0 || minutes > 59) return false;
    
    return true;
  },
  
  // Validar se o valor monetário é maior que zero
  isValidCurrency: (value) => {
    const numValue = formatters.currencyToNumber(value);
    return numValue > 0;
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f6fa',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
  }
});

export default MaskedInput; 