import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../../services/apiService';
import { MockService } from '../../services/mockService';
import MaskedInput, { MASKS, formatters, validators } from '../../components/form/MaskedInput';
import TimeRangeInput from '../../components/form/TimeRangeInput';
import notificationService from '../../services/notificationService';
import { formatCurrency } from '../../utils/formatters';

// Componente para exibir um plantão individual
const ShiftItem = ({ shift, onEdit, onDelete }) => (
  <View style={styles.shiftItem}>
    <View style={styles.shiftHeader}>
      <Text style={styles.shiftInstitution}>{shift.institution}</Text>
      <View style={[styles.statusBadge, 
        shift.status === 'completed' 
          ? styles.completedBadge 
          : shift.status === 'booked' 
            ? styles.confirmedBadge 
            : styles.pendingBadge
      ]}>
        <Text style={styles.statusText}>
          {shift.status === 'completed' 
            ? 'Concluído' 
            : shift.status === 'booked' 
              ? 'Confirmado' 
              : 'Pendente'}
        </Text>
      </View>
    </View>
    
    <View style={styles.shiftDetails}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Data:</Text>
        <Text style={styles.detailValue}>
          {new Date(shift.date).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Departamento:</Text>
        <Text style={styles.detailValue}>{shift.department}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Duração:</Text>
        <Text style={styles.detailValue}>{shift.duration} horas</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Valor:</Text>
        <Text style={[styles.detailValue, styles.valueText]}>
          {formatCurrency(shift.value)}
        </Text>
      </View>
    </View>
    
    <View style={styles.shiftActions}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.editButton]}
        onPress={() => onEdit(shift)}
      >
        <Text style={styles.actionButtonText}>Editar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => onDelete(shift)}
      >
        <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Componente para filtros
const ShiftFilters = ({ activeFilter, onFilterChange }) => {
  const filters = ['Todos', 'Pendentes', 'Confirmados', 'Concluídos'];
  
  return (
    <View style={styles.filtersContainer}>
      {filters.map(filter => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            activeFilter === filter && styles.activeFilterButton
          ]}
          onPress={() => onFilterChange(filter)}
        >
          <Text style={[
            styles.filterText,
            activeFilter === filter && styles.activeFilterText
          ]}>
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Tela principal de plantões
const ShiftsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [filteredShifts, setFilteredShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [filter, setFilter] = useState('Todos');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para o formulário
  const [institution, setInstitution] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('Pendente');
  
  // Estados para erros de validação
  const [formErrors, setFormErrors] = useState({
    institution: '',
    date: '',
    time: '',
    duration: '',
    value: ''
  });
  
  // Função para carregar os plantões usando o MockService
  const loadShifts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Usar API Service ou Mock Service
      const shiftsData = await ApiService.getUserShifts(user?.id || 'mock-user-1');
      
      setShifts(shiftsData);
      applyFilter(shiftsData, filter);
    } catch (error) {
      console.error('Erro ao carregar plantões:', error);
      setError('Não foi possível carregar seus plantões');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, user]);

  // Carregar dados quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadShifts();
    }, [loadShifts])
  );

  // Aplicar filtro nos plantões
  const applyFilter = (shiftsData, selectedFilter) => {
    if (selectedFilter === 'Todos') {
      setFilteredShifts(shiftsData);
    } else if (selectedFilter === 'Pendentes') {
      setFilteredShifts(shiftsData.filter(shift => shift.status === 'available'));
    } else if (selectedFilter === 'Confirmados') {
      setFilteredShifts(shiftsData.filter(shift => shift.status === 'booked'));
    } else if (selectedFilter === 'Concluídos') {
      setFilteredShifts(shiftsData.filter(shift => shift.status === 'completed'));
    }
  };

  // Mudar filtro
  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    applyFilter(shifts, selectedFilter);
  };

  // Atualizar lista de plantões
  const handleRefresh = () => {
    setRefreshing(true);
    loadShifts();
  };

  // Excluir plantão
  const handleDeleteShift = (shift) => {
    Alert.alert(
      'Excluir Plantão',
      'Tem certeza que deseja excluir este plantão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.cancelShift(shift.id, user?.id);
              Alert.alert('Sucesso', 'Plantão excluído com sucesso!');
              loadShifts();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o plantão.');
            }
          }
        }
      ]
    );
  };

  // Abrir modal para adicionar novo plantão
  const handleAddShift = () => {
    setCurrentShift(null);
    setInstitution('');
    setDate('');
    setTime('');
    setDuration('');
    setValue('');
    setStatus('Pendente');
    setFormErrors({
      institution: '',
      date: '',
      time: '',
      duration: '',
      value: ''
    });
    setModalVisible(true);
  };
  
  // Abrir modal para editar plantão existente
  const handleEditShift = (shift) => {
    setCurrentShift(shift);
    setInstitution(shift.institution);
    setDate(formatters.dateToISO(shift.date));
    setTime(shift.time);
    setDuration(shift.duration.toString());
    setValue(shift.value.toString());
    setStatus(shift.status);
    setFormErrors({
      institution: '',
      date: '',
      time: '',
      duration: '',
      value: ''
    });
    setModalVisible(true);
  };
  
  // Validar formulário
  const validateForm = () => {
    let isValid = true;
    const errors = {
      institution: '',
      date: '',
      time: '',
      duration: '',
      value: ''
    };
    
    // Validar instituição
    if (!institution.trim()) {
      errors.institution = 'Campo obrigatório';
      isValid = false;
    }
    
    // Validar data
    if (!date) {
      errors.date = 'Campo obrigatório';
      isValid = false;
    } else if (!validators.isValidDate(date)) {
      errors.date = 'Data inválida';
      isValid = false;
    }
    
    // Validar horário
    if (!time) {
      errors.time = 'Campo obrigatório';
      isValid = false;
    }
    
    // Validar duração
    if (!duration) {
      errors.duration = 'Campo obrigatório';
      isValid = false;
    } else if (isNaN(parseInt(duration, 10)) || parseInt(duration, 10) <= 0) {
      errors.duration = 'Duração deve ser maior que zero';
      isValid = false;
    }
    
    // Validar valor
    if (!value) {
      errors.value = 'Campo obrigatório';
      isValid = false;
    } else if (!validators.isValidCurrency(value)) {
      errors.value = 'Valor deve ser maior que zero';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Salvar plantão (novo ou editado)
  const handleSaveShift = async () => {
    // Validar formulário
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Criar objeto do plantão (convertendo formatos)
      const shiftData = {
        institution,
        date: formatters.dateToISO(date), // Converter para YYYY-MM-DD
        time,
        duration: parseInt(duration, 10),
        value: formatters.currencyToNumber(value), // Converter para número
        status
      };
      
      let result;
      
      if (currentShift) {
        // Atualizar plantão existente
        result = await ApiService.updateShift(currentShift.id, shiftData);
      } else {
        // Adicionar novo plantão
        result = await ApiService.addShift(shiftData);
      }
      
      if (result.success) {
        setModalVisible(false);
        Alert.alert(
          'Sucesso', 
          currentShift 
            ? 'Plantão atualizado com sucesso' 
            : 'Plantão adicionado com sucesso'
        );
        loadShifts(); // Recarregar lista de plantões
      } else {
        throw new Error(result.error || 'Erro ao salvar plantão');
      }
    } catch (error) {
      console.error('Erro ao salvar plantão:', error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar o plantão. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Modal para adicionar/editar plantão
  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentShift ? 'Editar Plantão' : 'Novo Plantão'}
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Instituição*</Text>
              <TextInput
                style={[styles.input, formErrors.institution ? styles.inputError : {}]}
                value={institution}
                onChangeText={(text) => {
                  setInstitution(text);
                  setFormErrors(prev => ({ ...prev, institution: '' }));
                }}
                placeholder="Nome da instituição/hospital"
              />
              {formErrors.institution ? (
                <Text style={styles.errorText}>{formErrors.institution}</Text>
              ) : null}
            </View>
            
            <MaskedInput
              label="Data*"
              placeholder="DD/MM/AAAA"
              value={date}
              onChangeText={(text) => {
                setDate(text);
                setFormErrors(prev => ({ ...prev, date: '' }));
              }}
              mask={MASKS.DATE}
              keyboardType="number-pad"
              error={formErrors.date}
            />
            
            <TimeRangeInput
              label="Horário*"
              value={time}
              onChangeText={(text) => {
                setTime(text);
                setFormErrors(prev => ({ ...prev, time: '' }));
              }}
              error={formErrors.time}
            />
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duração (horas)*</Text>
              <TextInput
                style={[styles.input, formErrors.duration ? styles.inputError : {}]}
                value={duration}
                onChangeText={(text) => {
                  // Aceitar apenas números
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setDuration(numericValue);
                  setFormErrors(prev => ({ ...prev, duration: '' }));
                }}
                placeholder="12"
                keyboardType="number-pad"
              />
              {formErrors.duration ? (
                <Text style={styles.errorText}>{formErrors.duration}</Text>
              ) : null}
            </View>
            
            <MaskedInput
              label="Valor (R$)*"
              placeholder="R$ 0,00"
              value={value}
              onChangeText={(text) => {
                setValue(text);
                setFormErrors(prev => ({ ...prev, value: '' }));
              }}
              mask={MASKS.CURRENCY}
              keyboardType="number-pad"
              error={formErrors.value}
            />
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusButtonsContainer}>
                {['Pendente', 'Confirmado', 'Concluído'].map((statusOption) => (
                  <TouchableOpacity
                    key={statusOption}
                    style={[
                      styles.statusButton,
                      status === statusOption && styles.statusButtonActive
                    ]}
                    onPress={() => setStatus(statusOption)}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      status === statusOption && styles.statusButtonTextActive
                    ]}>
                      {statusOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={handleSaveShift}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Carregando plantões...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadShifts}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Plantões</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddShift}
        >
          <Text style={styles.addButtonText}>+ Novo Plantão</Text>
        </TouchableOpacity>
      </View>
      
      <ShiftFilters 
        activeFilter={filter} 
        onFilterChange={handleFilterChange}
      />
      
      {filteredShifts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            Nenhum plantão {filter.toLowerCase() === 'todos' ? '' : filter.toLowerCase()} encontrado
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredShifts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ShiftItem 
              shift={item} 
              onEdit={handleEditShift}
              onDelete={handleDeleteShift}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2196F3']}
            />
          }
        />
      )}
      
      {/* Modal para adicionar/editar plantões */}
      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
  },
  activeFilterButton: {
    backgroundColor: '#3498db',
  },
  filterText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 50,
  },
  shiftItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  shiftInstitution: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  pendingBadge: {
    backgroundColor: '#f1c40f',
  },
  confirmedBadge: {
    backgroundColor: '#3498db',
  },
  completedBadge: {
    backgroundColor: '#2ecc71',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  shiftDetails: {
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 70,
    fontSize: 14,
    color: '#7f8c8d',
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  valueText: {
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  shiftActions: {
    flexDirection: 'row',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  editButton: {
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#e74c3c',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '90%',
    marginVertical: 50,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
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
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  statusButtonActive: {
    backgroundColor: '#3498db',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelModalButton: {
    backgroundColor: '#95a5a6',
  },
  saveModalButton: {
    backgroundColor: '#3498db',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fdeaea',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default ShiftsScreen; 