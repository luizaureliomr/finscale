# Finscale - Gestão de Plantões Médicos

Finscale é uma aplicação completa para gerenciamento de plantões médicos, finanças e estatísticas para profissionais da área médica.

## Descrição

O Finscale foi desenvolvido para auxiliar médicos a gerenciar seus plantões, controlar suas finanças e visualizar estatísticas relevantes sobre seu trabalho. O sistema conta com:

- Autenticação segura com Firebase
- Gestão de plantões (agendamento, edição, exclusão)
- Painel financeiro com visualização de ganhos
- Estatísticas e gráficos sobre plantões e rendimentos
- Suporte a notificações para lembrar de plantões agendados
- Modo offline para operações mesmo sem conexão

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- **frontend-app**: Aplicação móvel desenvolvida com React Native e Expo
- **backend**: API REST desenvolvida com Node.js e PostgreSQL

## Requisitos

### Frontend
- Node.js 14+
- Expo CLI
- React Native
- Configuração Firebase (autenticação e Firestore)

### Backend
- Node.js 14+
- PostgreSQL 12+
- npm ou yarn

## Configuração

### Frontend

1. Instale as dependências:
```
cd frontend-app
npm install
```

2. Configure o Firebase:
```
cp firebase.config.example.js firebase.config.js
```
Edite o arquivo `firebase.config.js` com suas credenciais.

3. Inicie o aplicativo:
```
npm start
```

### Backend

1. Instale as dependências:
```
cd backend
npm install
```

2. Configure o banco de dados:
```
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações.

3. Execute o script de configuração do banco de dados:
```
npm run setup-db
```
ou execute manualmente:
```
cd backend
setup-database.bat
```

4. Inicie o servidor:
```
npm run dev
```

## Funcionalidades Principais

- **Login e Cadastro**: Sistema completo de autenticação
- **Dashboard**: Visão geral de plantões e finanças
- **Gestão de Plantões**: Adicionar, editar e excluir plantões
- **Estatísticas**: Visualização gráfica de dados financeiros e de plantões
- **Perfil**: Gestão de informações pessoais e profissionais

## Tecnologias Utilizadas

- React Native / Expo
- Firebase (Authentication, Firestore)
- Node.js
- PostgreSQL
- Chart.js para visualização de dados

## Contribuindo

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes. 