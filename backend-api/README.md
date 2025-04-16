# Finscale - Backend API

API RESTful para o aplicativo Finscale de gerenciamento de plantões médicos.

## 🛠️ Tecnologias

- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Sequelize** - ORM para PostgreSQL
- **JWT** - Autenticação baseada em tokens
- **Bcrypt** - Criptografia de senhas

## 📋 Requisitos

- Node.js >= 14.x
- NPM >= 7.x
- PostgreSQL >= 12.x

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/finscale-backend.git
cd finscale-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Configure o banco de dados:
```bash
# Certifique-se de que o PostgreSQL está instalado e rodando
# Crie o banco de dados 'finscale_db'
```

5. Inicie o servidor:
```bash
npm run dev # Para desenvolvimento
npm start   # Para produção
```

## 🔗 Endpoints da API

### Autenticação

- `POST /api/v1/auth/register` - Registrar um novo usuário
- `POST /api/v1/auth/login` - Login de usuário
- `POST /api/v1/auth/refresh-token` - Renovar token de autenticação
- `POST /api/v1/auth/request-reset` - Solicitar redefinição de senha

### Usuários

- `GET /api/v1/users/me` - Obter dados do usuário atual
- `PUT /api/v1/users/:id` - Atualizar dados do usuário
- `GET /api/v1/users/:id/shifts` - Obter plantões do usuário
- `GET /api/v1/users/:id/statistics` - Obter estatísticas do usuário
- `GET /api/v1/users/:id/notifications` - Obter notificações do usuário

### Plantões

- `GET /api/v1/shifts/available` - Listar plantões disponíveis
- `GET /api/v1/shifts/:id` - Obter detalhes de um plantão
- `POST /api/v1/shifts/:id/book` - Agendar um plantão
- `POST /api/v1/shifts/:id/cancel` - Cancelar um plantão

## 📦 Estrutura do Projeto

```
src/
├── config/         # Configurações (banco de dados, etc.)
├── controllers/    # Controladores da API
├── middleware/     # Middlewares (autenticação, etc.)
├── models/         # Modelos do Sequelize
├── routes/         # Rotas da API
└── server.js       # Ponto de entrada da aplicação
```

## ⚙️ Scripts

- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento com hot-reload

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça o commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça o push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para mais detalhes. 