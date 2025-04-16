@echo off
echo === Criando repositório para o backend ===
echo.

:: Verificar se o Git está instalado
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Git não está instalado! Por favor, instale o Git antes de continuar.
    echo Visite: https://git-scm.com/downloads
    pause
    exit /b
)

:: Verificar se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js não está instalado! Execute primeiro o script 'instalar-node.cmd'.
    pause
    exit /b
)

:: Verificar se o diretório de projetos existe, senão criar
if not exist "projetos" (
    echo Criando diretório 'projetos'...
    mkdir projetos
)

:: Navegar para o diretório de projetos
cd projetos

:: Verificar se o diretório do backend já existe
if exist "finscale-backend" (
    echo Diretório 'finscale-backend' já existe.
    cd finscale-backend
) else (
    echo Criando diretório 'finscale-backend'...
    mkdir finscale-backend
    cd finscale-backend
    
    :: Inicializar projeto Node.js
    echo Inicializando projeto Node.js...
    (
        echo {
        echo   "name": "finscale-backend",
        echo   "version": "1.0.0",
        echo   "description": "Backend para o sistema Finscale de gestão de plantões médicos",
        echo   "main": "src/server.js",
        echo   "scripts": {
        echo     "start": "node src/server.js",
        echo     "dev": "nodemon src/server.js",
        echo     "test": "jest"
        echo   },
        echo   "author": "",
        echo   "license": "ISC"
        echo }
    ) > package.json
    
    :: Instalar dependências principais
    echo Instalando dependências principais...
    call npm install express pg pg-hstore sequelize dotenv cors helmet jsonwebtoken bcryptjs
    
    :: Instalar dependências de desenvolvimento
    echo Instalando dependências de desenvolvimento...
    call npm install --save-dev nodemon jest supertest
    
    :: Criar estrutura básica de diretórios
    echo Criando estrutura de diretórios...
    mkdir src
    cd src
    mkdir config controllers middleware models routes services utils
    
    :: Voltar para o diretório do backend
    cd ..
    
    :: Criar arquivo principal do servidor
    echo Criando servidor Express básico...
    (
        echo const express = require^('express'^);
        echo const cors = require^('cors'^);
        echo const helmet = require^('helmet'^);
        echo const { sequelize } = require^('./config/database'^);
        echo const routes = require^('./routes'^);
        echo require^('dotenv'^).config^(^);
        echo.
        echo const app = express^(^);
        echo const PORT = process.env.PORT || 3000;
        echo.
        echo // Middleware
        echo app.use^(helmet^(^)^);
        echo app.use^(cors^(^)^);
        echo app.use^(express.json^(^)^);
        echo.
        echo // Rotas
        echo app.use^('/api', routes^);
        echo.
        echo // Rota de teste
        echo app.get^('/', ^(req, res^) ^=^> {
        echo   res.json^({ message: 'Finscale API está funcionando!' }^);
        echo }^);
        echo.
        echo // Iniciar servidor
        echo const startServer = async ^(^) ^=^> {
        echo   try {
        echo     // Testar conexão com o banco de dados
        echo     await sequelize.authenticate^(^);
        echo     console.log^('Conexão com o banco de dados estabelecida com sucesso.'^);
        echo     
        echo     // Iniciar servidor
        echo     app.listen^(PORT, ^(^) ^=^> {
        echo       console.log^(`Servidor rodando na porta ${PORT}`^);
        echo     }^);
        echo   } catch ^(error^) {
        echo     console.error^('Erro ao conectar ao banco de dados:', error^);
        echo   }
        echo };
        echo.
        echo startServer^(^);
        echo.
        echo module.exports = app; // Exportar para testes
    ) > src\server.js
    
    :: Criar arquivo de configuração do banco de dados
    echo Criando configuração do banco de dados...
    mkdir src\config
    (
        echo const { Sequelize } = require^('sequelize'^);
        echo require^('dotenv'^).config^(^);
        echo.
        echo const sequelize = new Sequelize^(
        echo   process.env.DB_NAME,
        echo   process.env.DB_USER,
        echo   process.env.DB_PASSWORD,
        echo   {
        echo     host: process.env.DB_HOST,
        echo     port: process.env.DB_PORT,
        echo     dialect: 'postgres',
        echo     logging: false,
        echo     pool: {
        echo       max: 5,
        echo       min: 0,
        echo       acquire: 30000,
        echo       idle: 10000
        echo     }
        echo   }
        echo ^);
        echo.
        echo module.exports = { sequelize };
    ) > src\config\database.js
    
    :: Criar arquivo de rotas básico
    echo Criando arquivo de rotas...
    (
        echo const express = require^('express'^);
        echo const router = express.Router^(^);
        echo.
        echo // Adicione seus controladores aqui
        echo // const authController = require^('./controllers/authController'^);
        echo.
        echo // Rotas de autenticação
        echo // router.use^('/auth', authController^);
        echo.
        echo // Rota de teste
        echo router.get^('/test', ^(req, res^) ^=^> {
        echo   res.json^({ message: 'API de teste funcionando!' }^);
        echo }^);
        echo.
        echo module.exports = router;
    ) > src\routes.js
    
    :: Criar arquivo de exemplo para variáveis de ambiente
    echo Criando arquivo .env.example...
    (
        echo # Configurações do Servidor
        echo PORT=3000
        echo NODE_ENV=development
        echo.
        echo # Configurações do Banco de Dados PostgreSQL
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=finscale_db
        echo DB_USER=finscale_user
        echo DB_PASSWORD=sua_senha_segura
        echo.
        echo # JWT
        echo JWT_SECRET=sua_chave_secreta_muito_segura
        echo JWT_EXPIRES_IN=1d
        echo.
        echo # Firebase (opcional, para integração com frontend)
        echo FIREBASE_API_KEY=
        echo FIREBASE_AUTH_DOMAIN=
        echo FIREBASE_PROJECT_ID=
        echo FIREBASE_STORAGE_BUCKET=
        echo FIREBASE_MESSAGING_SENDER_ID=
        echo FIREBASE_APP_ID=
    ) > .env.example
    
    :: Criar arquivo .gitignore
    echo Criando arquivo .gitignore...
    (
        echo # Dependências
        echo node_modules/
        echo 
        echo # Logs
        echo logs
        echo *.log
        echo npm-debug.log*
        echo 
        echo # Variáveis de ambiente
        echo .env
        echo 
        echo # Cobertura de testes
        echo coverage/
        echo 
        echo # Cache
        echo .npm
        echo 
        echo # Sistema operacional
        echo .DS_Store
        echo Thumbs.db
        echo 
        echo # IDE/Editor
        echo .idea/
        echo .vscode/
        echo *.swp
        echo *.swo
        echo 
        echo # build
        echo dist/
        echo build/
    ) > .gitignore
    
    :: Criar README.md
    echo Criando README.md...
    (
        echo # Finscale - Backend
        echo 
        echo API Node.js/Express para o sistema Finscale de gestão de plantões médicos.
        echo 
        echo ## Pré-requisitos
        echo 
        echo - Node.js 14+ e npm
        echo - PostgreSQL 12+
        echo 
        echo ## Instalação
        echo 
        echo ```bash
        echo # Instalar dependências
        echo npm install
        echo 
        echo # Configurar variáveis de ambiente
        echo cp .env.example .env
        echo # Edite o arquivo .env com suas configurações
        echo 
        echo # Iniciar em modo de desenvolvimento
        echo npm run dev
        echo ```
        echo 
        echo ## Estrutura do Projeto
        echo 
        echo ```
        echo src/
        echo  ├── config/       # Configurações (banco de dados, etc.)
        echo  ├── controllers/  # Controladores
        echo  ├── middleware/   # Middleware (autenticação, validação, etc.)
        echo  ├── models/       # Modelos do Sequelize
        echo  ├── routes/       # Rotas da API
        echo  ├── services/     # Serviços e lógica de negócios
        echo  ├── utils/        # Funções utilitárias
        echo  └── server.js     # Ponto de entrada da aplicação
        echo ```
        echo 
        echo ## API Endpoints
        echo 
        echo - **GET /api/test** - Endpoint de teste
        echo - Outros endpoints serão adicionados posteriormente
        echo 
        echo ## Tecnologias Utilizadas
        echo 
        echo - Node.js e Express
        echo - Sequelize (ORM para PostgreSQL)
        echo - JWT para autenticação
        echo - Jest para testes
    ) > README.md
    
    :: Inicializar repositório Git
    echo Inicializando repositório Git...
    git init
    
    :: Adicionar arquivos e fazer commit inicial
    echo Adicionando arquivos ao repositório...
    git add .
    git commit -m "Configuração inicial do projeto Finscale Backend"
    
    echo.
    echo Repositório inicializado com sucesso!
    echo.
    echo Para conectar a um repositório remoto, execute:
    echo   git remote add origin URL_DO_SEU_REPOSITORIO_REMOTO
    echo   git push -u origin main
)

echo.
echo === Configuração do repositório backend concluída ===
echo O servidor backend pode ser iniciado com:
echo   cd projetos\finscale-backend
echo   npm run dev
echo.
pause 