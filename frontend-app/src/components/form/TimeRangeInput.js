import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaskedInput, { MASKS, validators } from './MaskedInput';

const TimeRangeInput = ({
  label,
  value,
  onChangeText,
  error,
  style = {},
}) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startError, setStartError] = useState('');
  const [endError, setEndError] = useState('');
  
  // Inicializa os campos quando recebe um valor
  useEffect(() => {
    if (value && value.includes(' - ')) {
      const [start, end] = value.split(' - ');
      setStartTime(start);
      setEndTime(end);
    }
  }, [value]);
  
  // Atualiza o valor quando os campos mudam
  const updateValue = (newStartTime, newEndTime) => {
    if (newStartTime && newEndTime) {
      onChangeText(`${newStartTime} - ${newEndTime}`);
    } else if (newStartTime) {
      onChangeText(newStartTime);
    } else {
      onChangeText('');
    }
  };
  
  // Manipular mudança no horário de início
  const handleStartTimeChange = (text) => {
    setStartTime(text);
    setStartError('');
    
    // Validar horário
    if (text.length === 5 && !validators.isValidTime(text)) {
      setStartError('Horário inválido');
    }
    
    updateValue(text, endTime);
  };
  
  // Manipular mudança no horário de término
  const handleEndTimeChange = (text) => {
    setEndTime(text);
    setEndError('');
    
    // Validar horário
    if (text.length === 5 && !validators.isValidTime(text)) {
      setEndError('Horário inválido');
    }
    
    // Validar se o horário de término é posterior ao de início
    if (text.length === 5 && startTime.length === 5 && 
        validators.isValidTime(text) && validators.isValidTime(startTime)) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = text.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (startMinutes >= endMinutes && endMinutes !== 0) {
        setEndError('Horário final deve ser após o inicial');
      }
    }
    
    updateValue(startTime, text);
  };
  
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.timeContainer}>
        <MaskedInput
          placeholder="00:00"
          value={startTime}
          onChangeText={handleStartTimeChange}
          mask={MASKS.TIME}
          keyboardType="number-pad"
          error={startError}
          style={styles.timeInput}
        />
        
        <Text style={styles.separator}>até</Text>
        
        <MaskedInput
          placeholder="00:00"
          value={endTime}
          onChangeText={handleEndTimeChange}
          mask={MASKS.TIME}
          keyboardType="number-pad"
          error={endError}
          style={styles.timeInput}
        />
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
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
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
  },
  separator: {
    marginHorizontal: 10,
    color: '#7f8c8d',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
  }
});

export default TimeRangeInput; 