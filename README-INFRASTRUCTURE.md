# Infraestrutura do Projeto Finscale

Este documento descreve a infraestrutura completa do projeto Finscale, incluindo os ambientes de desenvolvimento, produção e CI/CD.

## Estrutura do Projeto

O projeto Finscale é composto por duas partes principais:

1. **Frontend (React Native)**
   - Localizado em `/frontend-app`
   - Aplicativo móvel desenvolvido com React Native e Expo
   - Comunicação com o backend via API REST

2. **Backend (Node.js/Express)**
   - Localizado em `/backend`
   - API REST desenvolvida com Node.js e Express
   - Banco de dados PostgreSQL
   - Autenticação com JWT e Firebase Auth

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js (v18.x ou superior)
- npm (v9.x ou superior)
- PostgreSQL (v14.x ou superior)
- Expo CLI (instalado globalmente)
- Git

### Frontend

```bash
# Navegar para o diretório do frontend
cd frontend-app

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm start
```

### Backend

```bash
# Navegar para o diretório do backend
cd backend

# Instalar dependências
npm install

# Configurar o banco de dados
./setup-database.bat  # No Windows
# ou
bash setup-database.sh  # No Linux/Mac

# Iniciar o servidor de desenvolvimento
npm run dev
```

## Configuração do Banco de Dados

O banco de dados PostgreSQL deve ser configurado conforme as instruções no arquivo `backend/database-manual-setup.md`. O esquema do banco de dados está definido em `backend/src/models/database.sql`.

### Variáveis de Ambiente

As variáveis de ambiente são gerenciadas por arquivos `.env` em cada projeto. Exemplos estão disponíveis em `.env.example`.

## CI/CD

O projeto utiliza GitHub Actions para CI/CD. Os workflows estão configurados em:

- `.github/workflows/frontend-ci.yml` - Para o frontend
- `.github/workflows/backend-ci.yml` - Para o backend

Estes workflows executam:
- Instalação de dependências
- Execução de testes
- Verificação de qualidade de código
- Deploy (apenas na branch main)

## Ambientes

### Desenvolvimento
- Ambiente local para desenvolvimento e testes
- Banco de dados de desenvolvimento local

### Produção
- Hospedagem para produção (a ser definida)
- Banco de dados de produção (PostgreSQL em servidor dedicado)
- Firebase para autenticação

## Monitoramento e Logs

- Logs do backend são armazenados em `/backend/logs`
- Utiliza Winston para logging estruturado

## Segurança

- Autenticação JWT
- CORS configurado
- Rate limiting para prevenção de ataques
- Helmet para segurança do Express

## Próximos Passos

1. Configurar ambiente de produção
2. Implementar testes automatizados mais abrangentes
3. Configurar monitoramento em produção 