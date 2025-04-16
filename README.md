# Finscale - Sistema de Gestão de Plantões Médicos

## Estrutura do Projeto

O projeto está dividido em duas partes principais:
- **Backend**: API RESTful em Node.js com Express
- **Frontend**: Aplicação React Native com Expo

## Requisitos

- Node.js (v18+)
- npm (v9+)
- PostgreSQL 
- Firebase (para autenticação e armazenamento)

## Configuração Inicial

### Firebase

1. Criar um projeto no Firebase Console:
   - Acesse [console.firebase.google.com](https://console.firebase.google.com/)
   - Clique em "Adicionar projeto" ou "Criar projeto"
   - Nomeie o projeto como "Finscale" (ou outro nome de sua preferência)
   - Siga as instruções para concluir a criação

2. Configurar autenticação:
   - No menu lateral, clique em "Authentication"
   - Clique em "Começar" ou "Set up sign-in method"
   - Ative o provedor "Email/senha"
   - Opcionalmente, ative o Google e outros provedores

3. Configurar Firebase Admin SDK (para o backend):
   - No menu lateral, clique em "Configurações do projeto" (ícone de engrenagem)
   - Vá para a aba "Contas de serviço"
   - Clique em "Gerar nova chave privada"
   - Baixe o arquivo JSON
   - Renomeie para `firebase-credentials.json` e coloque na raiz da pasta `/backend`

4. Configurar Firebase SDK para Web (para o frontend):
   - No menu lateral, clique em "Configurações do projeto" (ícone de engrenagem)
   - Vá para a aba "Geral"
   - Role para baixo até encontrar a seção "Seus aplicativos"
   - Clique no ícone da web (</>) para adicionar um app web
   - Registre o app com o nome "Finscale Web"
   - Copie o objeto de configuração (apiKey, authDomain, etc.)
   - Substitua no arquivo `firebase-config.js` da pasta `/frontend`

### Backend

1. Instalação de dependências:
```bash
cd backend
npm install
```

2. Configure as variáveis de ambiente:
Crie um arquivo `.env` baseado no modelo existente e ajuste conforme necessário.

3. Configure o banco de dados PostgreSQL:
```bash
# Instalar PostgreSQL (se ainda não estiver instalado)
# Windows: Faça download e instale do site oficial https://www.postgresql.org/download/windows/
# Linux: sudo apt-get install postgresql postgresql-contrib
# MacOS: brew install postgresql

# Criar o banco de dados 'finscale'
psql -U postgres
CREATE DATABASE finscale;
\c finscale

# Execute o script SQL para criar as tabelas
# A partir da pasta backend:
psql -U postgres -d finscale -f src/models/database.sql
```

4. Configuração do Firebase:
Substitua o arquivo `firebase-credentials.json` na raiz da pasta backend com as credenciais do seu projeto Firebase.

5. Inicie o servidor em modo de desenvolvimento:
```bash
npm run dev
```

### Frontend

1. Instalar o Expo CLI globalmente:
```bash
npm install -g expo-cli
```

2. Inicie um novo projeto Expo:
```bash
cd frontend
npm install
```

3. Instalar dependências adicionais:
```bash
npm install @react-navigation/native @react-navigation/stack
npm install firebase
```

4. Substitua as configurações do Firebase:
Atualize o arquivo `firebase-config.js` com as credenciais do seu projeto Firebase.

5. Inicie o aplicativo:
```bash
npx expo start
```

## Estrutura de Diretórios

### Backend
```
backend/
  ├── src/
  │   ├── config/        # Configurações do aplicativo
  │   ├── controllers/   # Controladores de rotas
  │   ├── middlewares/   # Middlewares personalizados
  │   ├── models/        # Modelos de dados
  │   ├── routes/        # Definições de rotas
  │   └── utils/         # Utilitários
  ├── .env               # Variáveis de ambiente
  └── package.json
```

### Frontend (a ser configurado)
```
frontend/
  ├── assets/            # Recursos estáticos
  ├── components/        # Componentes React
  ├── navigation/        # Configuração de navegação
  ├── screens/           # Telas do aplicativo
  ├── services/          # Serviços e API
  └── App.js
```

## Desenvolvimento

### Scripts Disponíveis (Backend)

- `npm start`: Inicia o servidor em modo de produção
- `npm run dev`: Inicia o servidor em modo de desenvolvimento com hot-reload
- `npm test`: Executa os testes
- `npm run test:watch`: Executa os testes em modo de observação

## Estrutura do Banco de Dados

O banco de dados PostgreSQL contém as seguintes tabelas principais:

- `users`: Usuários do sistema (médicos)
- `institutions`: Hospitais e clínicas
- `institution_units`: Unidades/setores das instituições
- `shift_types`: Tipos de plantão (urgência, enfermaria, etc.)
- `shift_values`: Valores de plantão por tipo e instituição
- `shifts`: Registro de plantões agendados/realizados
- `shift_substitutions`: Registro de substituições de plantão
- `payments`: Pagamentos recebidos
- `payment_details`: Detalhes dos pagamentos (relacionados aos plantões)
- `user_tax_config`: Configuração tributária do usuário
- `tax_obligations`: Registro de obrigações fiscais

Para mais detalhes, consulte o arquivo `src/models/database.sql`.

## CI/CD com GitHub Actions

O projeto está configurado com GitHub Actions para Integração Contínua e Entrega Contínua (CI/CD), permitindo automação dos processos de teste e build.

### Workflows Configurados

1. **Frontend CI** (`.github/workflows/frontend-ci.yml`)
   - Executa lint e testes no código frontend
   - Realiza build da aplicação Expo Web
   - Armazena artefatos de build para uso posterior

2. **Backend CI** (`.github/workflows/backend-ci.yml`)
   - Executa lint e testes no código backend
   - Configura ambiente de banco de dados PostgreSQL para testes
   - Realiza build e compactação do código para implantação
   - Armazena artefatos de build para uso posterior

### Deploy Automático (Opcional)

Os arquivos de workflow incluem seções comentadas para deploy automático:

- Para o **Frontend**: Deploy para Expo
- Para o **Backend**: Deploy para um servidor via SSH

Para ativar estas funcionalidades:

1. Descomente as seções de deploy nos arquivos de workflow
2. Configure os secrets necessários no repositório GitHub em Settings > Secrets and variables > Actions:
   - Para Expo: `EXPO_USERNAME`, `EXPO_PASSWORD`
   - Para SSH: `SSH_PRIVATE_KEY`, `SSH_USER`, `SSH_HOST`

### Personalização

Os workflows podem ser personalizados conforme necessário editando os arquivos YAML em `.github/workflows/`. Consulte o arquivo `configurar-github-actions.md` para detalhes adicionais. 