import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import theme from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';

// Tipos para navegação
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, forgotPassword } = useAuth();
  const { t } = useTranslation();

  // Validação de e-mail
  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError(t('auth.emailRequired'));
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(t('auth.invalidEmail'));
      return false;
    }
    
    setEmailError('');
    return true;
  };

  // Validação de senha
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError(t('auth.passwordRequired'));
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleLogin = async (): Promise<void> => {
    // Validar campos
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (!result.success) {
        Alert.alert(t('common.error'), result.error || t('auth.loginFailed'));
      }
      
      setLoading(false);
    } catch (error) {
      Alert.alert(t('common.error'), error instanceof Error ? error.message : t('auth.loginFailed'));
      setLoading(false);
    }
  };

  const handleForgotPassword = async (): Promise<void> => {
    if (!validateEmail(email)) {
      return;
    }

    try {
      setLoading(true);
      const result = await forgotPassword(email);
      setLoading(false);
      
      if (result.success) {
        Alert.alert(
          t('auth.emailSent'),
          t('auth.recoveryEmailSent')
        );
      } else {
        Alert.alert(t('common.error'), result.error || t('auth.recoveryEmailFailed'));
      }
    } catch (error) {
      setLoading(false);
      Alert.alert(t('common.error'), error instanceof Error ? error.message : t('auth.requestFailed'));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <Text style={styles.title}>{t('auth.welcomeBack')}</Text>
      <Text style={styles.subtitle}>{t('auth.loginToContinue')}</Text>
      
      <Card style={styles.formCard}>
        <CardBody>
          <Input
            label={t('auth.email')}
            placeholder={t('auth.email')}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) validateEmail(text);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />
          
          <Input
            label={t('auth.password')}
            placeholder={t('auth.password')}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) validatePassword(text);
            }}
            secureTextEntry
            error={passwordError}
          />
          
          <Text 
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
          >
            {t('auth.forgotPassword')}
          </Text>
          
          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            disabled={loading}
            loading={loading}
            size="large"
          />
          
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>{t('auth.noAccount')} </Text>
            <Text 
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
            >
              {t('auth.register')}
            </Text>
          </View>
        </CardBody>
      </Card>
      
      <Card variant="outline" style={styles.demoCard}>
        <CardBody>
          <Text style={styles.demoText}>
            {t('auth.demoInfo')}
          </Text>
        </CardBody>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    marginTop: 60,
    marginBottom: theme.spacing.xs,
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xl,
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  forgotPassword: {
    color: theme.colors.primary,
    textAlign: 'right',
    marginBottom: theme.spacing.lg,
    fontSize: theme.typography.fontSize.sm,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  registerText: {
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSize.sm,
  },
  registerLink: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
  },
  demoCard: {
    backgroundColor: theme.colors.backgroundLight,
  },
  demoText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.xs,
  }
});

export default LoginScreen; 