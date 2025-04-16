# Solução de Problemas do Aplicativo Finscale

Este documento contém uma análise dos problemas encontrados ao tentar executar o aplicativo Finscale usando Expo Go, bem como possíveis soluções.

## Problemas Identificados

### 1. Estrutura de Arquivos Inconsistente

- O arquivo principal `src/App.js` não existia, mas estava sendo importado no `App.js` raiz
- Algumas referências em `AppNavigator.js` utilizavam variáveis globais que não estavam definidas

### 2. Problemas com o Firebase

- Avisos relacionados à inicialização do Firebase Auth sem AsyncStorage configurado corretamente
- Possíveis conflitos na configuração do Firebase

### 3. Erros no Bundling

- Falhas durante o processo de bundling do Metro
- Erros relacionados a módulos não encontrados ou incompatíveis

## Possíveis Soluções

### Solução 1: Executar com modo de produção

```bash
cd frontend-app
npx expo start --no-dev
```

Isto irá iniciar o aplicativo em modo de produção, que é menos propenso a erros de development-time.

### Solução 2: Reinstalar dependências

```bash
cd frontend-app
npm cache clean --force
rm -rf node_modules
npm install
```

Em Windows:
```
cd frontend-app
npm cache clean --force
rmdir /s /q node_modules
npm install
```

### Solução 3: Atualizar configuração do Firebase

Modificar o arquivo de inicialização do Firebase:

```javascript
// Em firebase.js
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
```

### Solução 4: Usar o mock mode exclusivamente

Garantir que o modo de mock esteja ativado para eliminar dependências externas:

```javascript
// Em apiService.js
const FORCE_MOCK = true;
```

### Solução 5: Versão simplificada do aplicativo

Criar uma versão mínima funcional do aplicativo que pode ser estendida após resolver os problemas iniciais:

1. Iniciar apenas com a tela de login
2. Adicionar gradualmente outras funcionalidades
3. Testar cada componente individualmente

## Logs de Erro para Referência

### Erro de bundling
```
ERROR  TypeError: Cannot read property 'background' of undefined
```

### Erro de Firebase
```
WARN  [date]  @firebase/auth: Auth (11.6.0):
You are initializing Firebase Auth for React Native without providing
AsyncStorage. Auth state will default to memory persistence and will not
persist between sessions.
```

## Próximos Passos

1. Verificar se os arquivos de configuração estão corretos (firebase.config.js)
2. Executar o aplicativo em modo de produção (--no-dev)
3. Testar com uma versão simplificada
4. Utilizar o modo de mock para eliminar dependências externas

Este documento deve ser atualizado à medida que novos problemas são encontrados ou solucionados.