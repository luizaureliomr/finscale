# Finscale - App de Gerenciamento de Plantões Médicos

Aplicativo mobile desenvolvido com React Native e Firebase para gerenciamento de plantões médicos.

## Funcionalidades

- **Autenticação**: Login, Registro, Recuperação de senha
- **Perfil de Usuário**: Visualização e edição de dados pessoais
- **Gerenciamento de Plantões**: Registro, edição e exclusão de plantões
- **Dashboard**: Visualização de estatísticas e próximos plantões

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## Configuração do Firebase

Para que a aplicação funcione corretamente, é necessário configurar o Firebase:

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto (ou use um existente)
3. No menu lateral, acesse "Authentication" e habilite o método de autenticação por E-mail/Senha
4. No menu lateral, acesse "Firestore Database" e crie um banco de dados
5. Configure as regras de segurança do Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /shifts/{shiftId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

6. No menu lateral, acesse "Project settings" > "General" > "Your apps" e clique em "Add app", selecionando a opção Web
7. Registre o app e copie as configurações de Firebase fornecidas
8. Abra o arquivo `firebase.config.js` na raiz do projeto e substitua os valores de exemplo com suas credenciais reais

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/finscale.git
cd finscale
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Inicie o aplicativo:
```bash
npm start
# ou
yarn start
```

4. Abra o aplicativo no seu emulador ou dispositivo usando o Expo Go.

## Estrutura do Projeto

```
frontend-app/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── contexts/       # Contextos React (Auth, etc)
│   ├── screens/        # Telas da aplicação
│   │   ├── auth/       # Telas de autenticação
│   │   └── main/       # Telas principais
│   └── services/       # Serviços (Firebase, API)
├── firebase.config.js  # Configuração do Firebase
└── App.js              # Ponto de entrada da aplicação
```

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.

## Contribuição

Contribuições são bem-vindas! Por favor, sinta-se à vontade para enviar um Pull Request. 