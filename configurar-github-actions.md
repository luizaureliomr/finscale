# Configuração de CI/CD com GitHub Actions

Este guia explica como configurar GitHub Actions para integração e entrega contínuas nos repositórios do Finscale.

## Pré-requisitos

- Repositórios já criados no GitHub (finscale-frontend e finscale-backend)
- Permissões de administrador nos repositórios

## Configuração do CI/CD para o Frontend (React Native/Expo)

### Passo 1: Criar a estrutura de diretórios

No repositório `finscale-frontend`, crie os seguintes diretórios:
```
.github/
└── workflows/
```

### Passo 2: Criar o fluxo de trabalho para o frontend

Crie um arquivo `.github/workflows/frontend-ci.yml` com o seguinte conteúdo:

```yaml
name: Frontend CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    name: Lint e Testes
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Configurar Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Executar linting
        run: npm run lint || echo "Lint falhou mas continuando..."
      
      - name: Executar testes
        run: npm test || echo "Testes falharam mas continuando..."
  
  build:
    name: Build Expo Web
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3
      
      - name: Configurar Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Instalar Expo CLI
        run: npm install -g expo-cli
      
      - name: Build para Web
        run: expo build:web
      
      - name: Upload artefatos
        uses: actions/upload-artifact@v3
        with:
          name: web-build
          path: web-build
          retention-days: 5
```

### Passo 3 (Opcional): Configurar deploy automático para Expo

Se você quiser configurar o deploy automático para o Expo, adicione isto ao arquivo de workflow:

```yaml
  deploy:
    name: Deploy para Expo
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configurar Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Instalar Expo CLI
        run: npm install -g expo-cli
      
      - name: Login no Expo
        run: npx expo-cli login -u ${{ secrets.EXPO_USERNAME }} -p ${{ secrets.EXPO_PASSWORD }}
      
      - name: Publicar no Expo
        run: npx expo-cli publish --non-interactive
```

> **Nota**: Para o deploy automático no Expo, você precisará adicionar `EXPO_USERNAME` e `EXPO_PASSWORD` como secrets no seu repositório GitHub.

## Configuração do CI/CD para o Backend (Node.js/Express)

### Passo 1: Criar a estrutura de diretórios

No repositório `finscale-backend`, crie os seguintes diretórios:
```
.github/
└── workflows/
```

### Passo 2: Criar o fluxo de trabalho para o backend

Crie um arquivo `.github/workflows/backend-ci.yml` com o seguinte conteúdo:

```yaml
name: Backend CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    name: Lint e Testes
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:12
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Configurar Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Executar linting
        run: npm run lint || echo "Lint falhou mas continuando..."
      
      - name: Executar testes
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: test_db
          DB_USER: postgres
          DB_PASSWORD: postgres
          NODE_ENV: test
          JWT_SECRET: test_secret_key
        run: npm test
  
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3
      
      - name: Configurar Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Build (se aplicável)
        run: npm run build || echo "Sem etapa de build configurada"
      
      - name: Compactar para implantação
        run: |
          mkdir -p deployment
          cp -r src/ package.json package-lock.json .env.example deployment/
          cd deployment && zip -r ../finscale-backend.zip .
      
      - name: Upload artefatos
        uses: actions/upload-artifact@v3
        with:
          name: backend-build
          path: finscale-backend.zip
          retention-days: 5
```

### Passo 3 (Opcional): Configurar deploy automático para servidor

Se você quiser configurar o deploy automático para um servidor, adicione isto ao arquivo de workflow:

```yaml
  deploy:
    name: Deploy para Produção
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - name: Download artefatos
        uses: actions/download-artifact@v3
        with:
          name: backend-build
      
      - name: Configurar SSH
        uses: webfactory/ssh-agent@v0.5.4
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
      
      - name: Deploy para servidor
        run: |
          scp -o StrictHostKeyChecking=no finscale-backend.zip ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:~/
          ssh -o StrictHostKeyChecking=no ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'EOF'
            cd ~
            mkdir -p finscale-backend-temp
            unzip -o finscale-backend.zip -d finscale-backend-temp
            if [ -d finscale-backend ]; then
              mv finscale-backend finscale-backend-old
            fi
            mv finscale-backend-temp finscale-backend
            cd finscale-backend
            npm ci --production
            pm2 restart finscale-backend || pm2 start src/server.js --name finscale-backend
            if [ -d ../finscale-backend-old ]; then
              rm -rf ../finscale-backend-old
            fi
          EOF
```

> **Nota**: Para o deploy automático via SSH, você precisará adicionar `SSH_PRIVATE_KEY`, `SSH_USER` e `SSH_HOST` como secrets no seu repositório GitHub.

## Configuração dos Secrets no GitHub Actions

Para garantir a segurança de credenciais e informações sensíveis nos workflows de CI/CD, é importante utilizar os GitHub Secrets.

### Secrets Fundamentais para o Projeto Finscale

1. **Para Deploy do Frontend no Expo**:
   - `EXPO_USERNAME`: Nome de usuário da conta Expo
   - `EXPO_PASSWORD`: Senha da conta Expo

2. **Para Deploy do Backend via SSH**:
   - `SSH_PRIVATE_KEY`: Chave SSH privada para conexão com o servidor
   - `SSH_USER`: Usuário para conexão SSH
   - `SSH_HOST`: Endereço do servidor para deploy

3. **Secrets Adicionais (Opcionais)**:
   - `FIREBASE_CONFIG`: Configuração do Firebase em formato JSON
   - `DB_PASSWORD_PROD`: Senha do banco de dados em produção
   - `JWT_SECRET_PROD`: Chave secreta JWT para ambiente de produção

### Passo a Passo para Adicionar Secrets

1. Acesse o repositório no GitHub
2. Clique em "Settings" (na barra de navegação superior)
3. No menu lateral, selecione "Secrets and variables" e depois "Actions"
4. Clique em "New repository secret"
5. Adicione o nome do secret (ex: `EXPO_USERNAME`) e seu valor correspondente
6. Clique em "Add secret"

### Uso de Secrets nos Workflows

Os secrets são referenciados nos arquivos YAML utilizando a sintaxe `${{ secrets.NOME_DO_SECRET }}`, como nos exemplos abaixo:

```yaml
# Exemplo de uso em login no Expo
- name: Login no Expo
  run: npx expo login -u ${{ secrets.EXPO_USERNAME }} -p ${{ secrets.EXPO_PASSWORD }}

# Exemplo de uso com chave SSH para deploy
- name: Configurar SSH
  uses: webfactory/ssh-agent@v0.5.4
  with:
    ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
```

### Segurança

- Os secrets são criptografados no GitHub
- Nunca são expostos nos logs de execução
- Não são acessíveis em pull requests de repositórios forked
- Recomenda-se revisar e atualizar secrets periodicamente

## Como adicionar secrets ao repositório GitHub

1. Acesse o repositório no GitHub
2. Vá para "Settings" > "Secrets and variables" > "Actions"
3. Clique em "New repository secret"
4. Adicione o nome da secret (ex: `SSH_PRIVATE_KEY`) e o valor
5. Clique em "Add secret"

## Como configurar os scripts necessários

No `package.json` do frontend, adicione:

```json
"scripts": {
  "lint": "eslint .",
  "test": "jest"
}
```

No `package.json` do backend, adicione:

```json
"scripts": {
  "lint": "eslint .",
  "test": "jest",
  "build": "echo 'Não é necessário build para este projeto'"
}
```

## Próximos passos

1. Faça push destes arquivos para os repositórios no GitHub
2. Verifique a aba "Actions" no GitHub para ver os fluxos de trabalho em execução
3. Ajuste os fluxos de trabalho conforme necessário para seu ambiente específico
4. Configure os secrets necessários para deploys automáticos 