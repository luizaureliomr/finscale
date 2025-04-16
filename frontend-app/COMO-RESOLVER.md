# Como Resolver o Problema do Expo Go

Este documento fornece instruções passo a passo para resolver os problemas de inicialização do aplicativo com Expo Go.

## Instruções Rápidas

1. **Execute o comando mais simplificado**:
   ```
   cd frontend-app
   npx expo start --clear --no-dev
   ```

2. **Acesse no navegador**:
   Abra http://localhost:8081 após a inicialização

## Solução Completa (Passo a Passo)

Se a solução rápida não funcionar, siga estes passos:

### 1. Limpar Cache e Dependências

```powershell
cd C:\Finscale\frontend-app
npm cache clean --force
rmdir /s /q node_modules
npm install
```

### 2. Reinstalar Pacotes Específicos

```powershell
npm install @react-native-async-storage/async-storage
npm install firebase react-native-web
```

### 3. Executar o Script de Login Simplificado

```powershell
cd C:\Finscale\frontend-app
node start-login-only.js
```

### 4. Solução Manual

Se nada funcionar, siga estes passos manualmente:

1. **Edite o arquivo App.js**
   Substitua todo o conteúdo por:

   ```javascript
   import React from 'react';
   import { View, StyleSheet, LogBox, Text } from 'react-native';
   import LoginScreen from './src/screens/auth/LoginScreen';

   // Ignorar warnings específicos
   LogBox.ignoreLogs([
     'AsyncStorage has been extracted from react-native core',
     'Setting a timer for a long period of time'
   ]);

   // Componente principal simplificado
   export default function App() {
     return (
       <View style={styles.container}>
         <Text style={styles.appTitle}>Finscale</Text>
         <LoginScreen 
           onLogin={(email, password) => {
             console.log('Login tentado com:', email);
             alert(`Login simulado com sucesso para ${email}!`);
             return { success: true };
           }} 
         />
       </View>
     );
   }

   // Estilos simplificados
   const styles = StyleSheet.create({
     container: {
       flex: 1,
       backgroundColor: '#fff',
       paddingTop: 50
     },
     appTitle: {
       fontSize: 24,
       fontWeight: 'bold',
       textAlign: 'center',
       marginBottom: 20,
       color: '#3498db'
     }
   });
   ```

2. **Inicie o aplicativo em modo de produção**
   ```
   npx expo start --no-dev --clear
   ```

3. **Abra o aplicativo**
   - No seu celular: Escaneie o QR code com o aplicativo Expo Go
   - No navegador: Acesse http://localhost:8081

## Dicas Adicionais

- Se aparecer erro de Firebase, remova temporariamente a inicialização do Firebase
- Se houver erros de módulos não encontrados, verifique e atualize o package.json
- Para verificar o ambiente Expo:
  ```
  npx expo-doctor
  ```

## Próximos Passos

Após conseguir executar com sucesso a versão simplificada:

1. Adicione gradualmente os componentes back
2. Teste cada adição
3. Quando encontrar o componente problemático, refatore-o

## Suporte

Se continuar tendo problemas, consulte o arquivo `SOLUCAO-PROBLEMAS.md` para mais detalhes. 