@echo off
echo Configurando Backend do Finscale...

REM Verificar se o Git está instalado
git --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Git não encontrado. Por favor, instale o Git antes de continuar.
    echo Você pode baixá-lo em: https://git-scm.com/downloads
    exit /b 1
)

REM Verificar se o Node.js está instalado
node --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js não encontrado. Por favor, instale o Node.js antes de continuar.
    echo Você pode baixá-lo em: https://nodejs.org/
    exit /b 1
)

REM Criar diretório para o backend se não existir
if not exist backend-api (
    echo Criando diretório backend-api...
    mkdir backend-api
)

cd backend-api

REM Inicializar projeto Node.js se não existir package.json
if not exist package.json (
    echo Inicializando projeto Node.js...
    echo {"name":"finscale-backend","version":"1.0.0","description":"Backend API para o sistema Finscale","main":"src/index.js","scripts":{"start":"node src/index.js","dev":"nodemon src/index.js","test":"jest"},"keywords":["finscale","médico","plantão","api"],"author":"","license":"MIT"} > package.json
)

REM Instalar dependências essenciais
echo Instalando dependências essenciais...
npm install express cors body-parser dotenv bcryptjs jsonwebtoken knex pg morgan helmet uuid

REM Instalar dependências de desenvolvimento
echo Instalando dependências de desenvolvimento...
npm install --save-dev nodemon jest supertest

REM Criar estrutura de diretórios
echo Criando estrutura de diretórios...
if not exist src mkdir src
if not exist src\controllers mkdir src\controllers
if not exist src\models mkdir src\models
if not exist src\routes mkdir src\routes
if not exist src\middlewares mkdir src\middlewares
if not exist src\config mkdir src\config
if not exist src\services mkdir src\services
if not exist src\utils mkdir src\utils
if not exist migrations mkdir migrations
if not exist seeds mkdir seeds
if not exist tests mkdir tests

REM Criar arquivo index.js principal
echo Criando arquivo index.js principal...
echo const express = require('express');
echo const cors = require('cors');
echo const bodyParser = require('body-parser');
echo const morgan = require('morgan');
echo const helmet = require('helmet');
echo const dotenv = require('dotenv');
echo.
echo // Carregar variáveis de ambiente
echo dotenv.config();
echo.
echo const app = express();
echo.
echo // Middlewares
echo app.use(helmet());
echo app.use(morgan('dev'));
echo app.use(cors());
echo app.use(bodyParser.json());
echo app.use(bodyParser.urlencoded({ extended: true }));
echo.
echo // Rotas
echo app.use('/api', require('./routes'));
echo.
echo // Rota de teste
echo app.get('/', (req, res) => {
echo   res.json({ message: 'API Finscale funcionando!' });
echo });
echo.
echo // Tratamento de erros
echo app.use((err, req, res, next) => {
echo   console.error(err.stack);
echo   res.status(500).json({ error: 'Erro interno do servidor' });
echo });
echo.
echo const PORT = process.env.PORT || 3000;
echo.
echo app.listen(PORT, () => {
echo   console.log(`Servidor rodando na porta ${PORT}`);
echo });
echo. > src\index.js

REM Criar arquivo de rotas básico
echo Criando arquivo de rotas básico...
echo const express = require('express');
echo const router = express.Router();
echo.
echo const authRoutes = require('./auth.routes');
echo const shiftRoutes = require('./shift.routes');
echo const userRoutes = require('./user.routes');
echo.
echo router.use('/auth', authRoutes);
echo router.use('/shifts', shiftRoutes);
echo router.use('/users', userRoutes);
echo.
echo module.exports = router;
echo. > src\routes\index.js

REM Criar arquivo de rotas de autenticação
echo Criando rotas de autenticação...
echo const express = require('express');
echo const router = express.Router();
echo const authController = require('../controllers/auth.controller');
echo.
echo router.post('/login', authController.login);
echo router.post('/register', authController.register);
echo router.post('/forgot-password', authController.forgotPassword);
echo router.post('/reset-password', authController.resetPassword);
echo.
echo module.exports = router;
echo. > src\routes\auth.routes.js

REM Criar arquivo de rotas de plantões
echo Criando rotas de plantões...
echo const express = require('express');
echo const router = express.Router();
echo const shiftController = require('../controllers/shift.controller');
echo const { authenticate } = require('../middlewares/auth.middleware');
echo.
echo router.get('/', authenticate, shiftController.getAllShifts);
echo router.get('/available', authenticate, shiftController.getAvailableShifts);
echo router.get('/my-shifts', authenticate, shiftController.getUserShifts);
echo router.post('/book/:id', authenticate, shiftController.bookShift);
echo router.delete('/cancel/:id', authenticate, shiftController.cancelShift);
echo.
echo module.exports = router;
echo. > src\routes\shift.routes.js

REM Criar arquivo de rotas de usuários
echo Criando rotas de usuários...
echo const express = require('express');
echo const router = express.Router();
echo const userController = require('../controllers/user.controller');
echo const { authenticate } = require('../middlewares/auth.middleware');
echo.
echo router.get('/profile', authenticate, userController.getProfile);
echo router.put('/profile', authenticate, userController.updateProfile);
echo router.get('/statistics', authenticate, userController.getStatistics);
echo.
echo module.exports = router;
echo. > src\routes\user.routes.js

REM Criar middleware de autenticação
echo Criando middleware de autenticação...
echo const jwt = require('jsonwebtoken');
echo.
echo const authenticate = (req, res, next) => {
echo   try {
echo     const authHeader = req.headers.authorization;
echo     
echo     if (!authHeader) {
echo       return res.status(401).json({ error: 'Token não fornecido' });
echo     }
echo     
echo     const parts = authHeader.split(' ');
echo     
echo     if (parts.length !== 2) {
echo       return res.status(401).json({ error: 'Erro no token' });
echo     }
echo     
echo     const [scheme, token] = parts;
echo     
echo     if (!/^Bearer$/i.test(scheme)) {
echo       return res.status(401).json({ error: 'Token mal formatado' });
echo     }
echo     
echo     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
echo       if (err) {
echo         return res.status(401).json({ error: 'Token inválido' });
echo       }
echo       
echo       req.userId = decoded.id;
echo       return next();
echo     });
echo   } catch (error) {
echo     return res.status(500).json({ error: 'Erro na autenticação' });
echo   }
echo };
echo.
echo module.exports = { authenticate };
echo. > src\middlewares\auth.middleware.js

REM Criar arquivo de configuração do banco de dados
echo Criando configuração do banco de dados...
echo const knex = require('knex');
echo const config = require('../knexfile')[process.env.NODE_ENV || 'development'];
echo.
echo const db = knex(config);
echo.
echo module.exports = db;
echo. > src\config\database.js

REM Criar arquivo knexfile.js
echo Criando arquivo knexfile.js...
echo module.exports = {
echo   development: {
echo     client: 'pg',
echo     connection: {
echo       host: process.env.DB_HOST || 'localhost',
echo       user: process.env.DB_USER || 'postgres',
echo       password: process.env.DB_PASSWORD || 'postgres',
echo       database: process.env.DB_NAME || 'finscale_dev',
echo     },
echo     migrations: {
echo       directory: './migrations',
echo     },
echo     seeds: {
echo       directory: './seeds',
echo     },
echo   },
echo.
echo   test: {
echo     client: 'pg',
echo     connection: {
echo       host: process.env.TEST_DB_HOST || 'localhost',
echo       user: process.env.TEST_DB_USER || 'postgres',
echo       password: process.env.TEST_DB_PASSWORD || 'postgres',
echo       database: process.env.TEST_DB_NAME || 'finscale_test',
echo     },
echo     migrations: {
echo       directory: './migrations',
echo     },
echo     seeds: {
echo       directory: './seeds',
echo     },
echo   },
echo.
echo   production: {
echo     client: 'pg',
echo     connection: process.env.DATABASE_URL,
echo     migrations: {
echo       directory: './migrations',
echo     },
echo     seeds: {
echo       directory: './seeds',
echo     },
echo   },
echo };
echo. > knexfile.js

REM Criar arquivo .env
echo Criando arquivo .env...
echo PORT=3000
echo NODE_ENV=development
echo JWT_SECRET=finscale_secret_key_change_in_production
echo JWT_EXPIRES_IN=1d
echo.
echo # Database
echo DB_HOST=localhost
echo DB_USER=postgres
echo DB_PASSWORD=postgres
echo DB_NAME=finscale_dev
echo.
echo # Test Database
echo TEST_DB_HOST=localhost
echo TEST_DB_USER=postgres
echo TEST_DB_PASSWORD=postgres
echo TEST_DB_NAME=finscale_test
echo. > .env

REM Criar arquivo .gitignore
echo Criando arquivo .gitignore...
echo node_modules
echo .env
echo npm-debug.log
echo yarn-error.log
echo .DS_Store
echo coverage
echo .idea
echo .vscode
echo *.log
echo. > .gitignore

REM Criar arquivo README.md
echo Criando arquivo README.md...
echo # Finscale Backend API
echo.
echo API para o sistema Finscale de gerenciamento de plantões médicos.
echo.
echo ## Requisitos
echo.
echo - Node.js v14+
echo - PostgreSQL
echo.
echo ## Instalação
echo.
echo ```bash
echo # Instalar dependências
echo npm install
echo.
echo # Configurar variáveis de ambiente
echo # Edite o arquivo .env com suas configurações
echo.
echo # Executar migrações do banco de dados
echo npm run migrate
echo.
echo # Executar seeds (dados iniciais)
echo npm run seed
echo.
echo # Iniciar servidor em modo desenvolvimento
echo npm run dev
echo ```
echo.
echo ## Scripts Disponíveis
echo.
echo - `npm start`: Inicia o servidor em modo produção
echo - `npm run dev`: Inicia o servidor em modo desenvolvimento com nodemon
echo - `npm test`: Executa os testes
echo - `npm run migrate`: Executa as migrações do banco de dados
echo - `npm run seed`: Executa os seeds do banco de dados
echo.
echo ## Estrutura do Projeto
echo.
echo ```
echo backend-api/
echo  ├── src/                    # Código fonte
echo  │   ├── controllers/        # Controladores da API
echo  │   ├── models/             # Modelos de dados
echo  │   ├── routes/             # Rotas da API
echo  │   ├── middlewares/        # Middlewares
echo  │   ├── config/             # Configurações
echo  │   ├── services/           # Serviços
echo  │   ├── utils/              # Utilitários
echo  │   └── index.js            # Arquivo principal
echo  ├── migrations/             # Migrações do banco de dados
echo  ├── seeds/                  # Seeds do banco de dados
echo  ├── tests/                  # Testes
echo  ├── .env                    # Variáveis de ambiente
echo  ├── .gitignore              # Arquivo de ignore do Git
echo  ├── knexfile.js             # Configuração do Knex
echo  ├── package.json            # Dependências e scripts
echo  └── README.md               # Documentação
echo ```
echo.
echo ## API Endpoints
echo.
echo ### Autenticação
echo.
echo - POST /api/auth/login - Login de usuário
echo - POST /api/auth/register - Registro de novo usuário
echo - POST /api/auth/forgot-password - Solicitar redefinição de senha
echo - POST /api/auth/reset-password - Redefinir senha
echo.
echo ### Usuários
echo.
echo - GET /api/users/profile - Obter perfil do usuário
echo - PUT /api/users/profile - Atualizar perfil do usuário
echo - GET /api/users/statistics - Obter estatísticas do usuário
echo.
echo ### Plantões
echo.
echo - GET /api/shifts - Listar todos os plantões
echo - GET /api/shifts/available - Listar plantões disponíveis
echo - GET /api/shifts/my-shifts - Listar plantões do usuário
echo - POST /api/shifts/book/:id - Reservar um plantão
echo - DELETE /api/shifts/cancel/:id - Cancelar reserva de plantão
echo. > README.md

REM Inicializar repositório Git se não existir
if not exist .git (
    echo Inicializando repositório Git...
    git init
    git add .
    git commit -m "Configuração inicial do backend Finscale"
    echo Repositório Git inicializado com commit inicial.
)

echo.
echo ========================================
echo Backend do Finscale configurado com sucesso!
echo ========================================
echo.
echo Para iniciar o servidor em modo desenvolvimento:
echo   cd backend-api
echo   npm run dev
echo.
echo Certifique-se de criar o banco de dados PostgreSQL com o nome 'finscale_dev' antes de executar.
echo.
echo Nota: Você precisará configurar suas credenciais do banco de dados no arquivo .env
echo.
cd .. 