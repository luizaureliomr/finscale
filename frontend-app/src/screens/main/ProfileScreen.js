import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import MaskedInput, { MASKS } from '../../components/form/MaskedInput';

const ProfileScreen = ({ navigation }) => {
  const { user, userData, updateProfile, logout } = useAuth();
  
  // Estados para os campos editáveis
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [profession, setProfession] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [crm, setCrm] = useState('');
  const [phone, setPhone] = useState('');
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [errors, setErrors] = useState({});
  
  // Preencher os estados com os dados do usuário quando disponíveis
  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || '');
      setProfession(userData.profession || '');
      setSpecialization(userData.specialization || '');
      setCrm(userData.crm || '');
      setPhone(userData.phone || '');
      setReceiveNotifications(userData.receiveNotifications !== false);
    }
  }, [userData]);
  
  // Validar campos do formulário
  const validateForm = () => {
    const newErrors = {};
    
    if (!displayName.trim()) {
      newErrors.displayName = 'O nome é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Função para atualizar o perfil
  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const updatedData = {
        displayName,
        profession,
        specialization,
        crm,
        phone,
        receiveNotifications,
        updatedAt: new Date().toISOString()
      };
      
      const result = await updateProfile(updatedData);
      
      if (result.success) {
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
        setIsEditing(false);
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível atualizar o perfil');
      }
    } catch (error) {
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao atualizar o perfil');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para cancelar a edição
  const handleCancel = () => {
    // Restaurar os valores originais
    if (userData) {
      setDisplayName(userData.displayName || '');
      setProfession(userData.profession || '');
      setSpecialization(userData.specialization || '');
      setCrm(userData.crm || '');
      setPhone(userData.phone || '');
      setReceiveNotifications(userData.receiveNotifications !== false);
    }
    setIsEditing(false);
    setErrors({});
  };
  
  // Função para fazer logout
  const handleLogout = async () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await logout();
            setLoading(false);
          }
        }
      ]
    );
  };
  
  // Renderizar a primeira letra do nome como avatar se não houver foto
  const getInitial = () => {
    return displayName ? displayName.charAt(0).toUpperCase() : 'U';
  };
  
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.photoURL ? (
            <Image 
              source={{ uri: user.photoURL }} 
              style={styles.avatar} 
            />
          ) : (
            <Text style={styles.avatarText}>{getInitial()}</Text>
          )}
        </View>
        
        {!isEditing && (
          <Text style={styles.userName}>{displayName || 'Usuário'}</Text>
        )}
        
        {!isEditing && user?.email && (
          <Text style={styles.userEmail}>{user.email}</Text>
        )}
      </View>
      
      <View style={styles.infoSection}>
        {isEditing ? (
          <>
            <Text style={styles.sectionTitle}>Editar Perfil</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome completo*</Text>
              <TextInput
                style={[styles.input, errors.displayName ? styles.inputError : null]}
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  if (errors.displayName) {
                    setErrors({...errors, displayName: null});
                  }
                }}
                placeholder="Seu nome completo"
              />
              {errors.displayName && (
                <Text style={styles.errorText}>{errors.displayName}</Text>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Profissão</Text>
              <TextInput
                style={styles.input}
                value={profession}
                onChangeText={setProfession}
                placeholder="Ex: Médico, Enfermeiro"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Especialização</Text>
              <TextInput
                style={styles.input}
                value={specialization}
                onChangeText={setSpecialization}
                placeholder="Ex: Cardiologia, Pediatria"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CRM/Registro</Text>
              <TextInput
                style={styles.input}
                value={crm}
                onChangeText={setCrm}
                placeholder="Seu número de registro"
              />
            </View>
            
            <MaskedInput
              label="Telefone"
              value={phone}
              onChangeText={setPhone}
              placeholder="(00) 00000-0000"
              mask={MASKS.PHONE}
              keyboardType="phone-pad"
            />
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Receber notificações</Text>
              <Switch
                value={receiveNotifications}
                onValueChange={setReceiveNotifications}
                trackColor={{ false: '#d1d1d1', true: '#2ecc71' }}
                thumbColor={receiveNotifications ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.button}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editButton}>Editar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Profissão:</Text>
              <Text style={styles.infoValue}>{profession || 'Não informado'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Especialização:</Text>
              <Text style={styles.infoValue}>{specialization || 'Não informado'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CRM/Registro:</Text>
              <Text style={styles.infoValue}>{crm || 'Não informado'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telefone:</Text>
              <Text style={styles.infoValue}>{phone || 'Não informado'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Notificações:</Text>
              <Text style={styles.infoValue}>
                {receiveNotifications ? 'Ativadas' : 'Desativadas'}
              </Text>
            </View>
          </>
        )}
      </View>
      
      {!isEditing && (
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Conta</Text>
          
          <TouchableOpacity 
            style={styles.accountButton}
            onPress={() => Alert.alert('Informação', 'Esta funcionalidade será implementada em breve')}
          >
            <Text style={styles.accountButtonText}>Alterar senha</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.accountButton, styles.logoutButton]}
            onPress={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#e74c3c" />
            ) : (
              <Text style={styles.logoutText}>Sair da conta</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#3498db',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  editButton: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  infoLabel: {
    width: '40%',
    fontSize: 16,
    color: '#7f8c8d',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
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
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 30,
  },
  accountButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accountButtonText: {
    fontSize: 16,
    color: '#3498db',
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '500',
  }
});

export default ProfileScreen; 