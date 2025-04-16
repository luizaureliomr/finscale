# Gerenciamento Seguro das Credenciais do Firebase

Este documento explica como gerenciar as configurações do Firebase de forma segura no projeto.

## Configuração Inicial

1. Renomeie o arquivo `.env.example` para `.env`
2. Adicione suas credenciais do Firebase no arquivo `.env`:

```
# Firebase Configuration
API_KEY=sua_api_key
AUTH_DOMAIN=seu_app.firebaseapp.com
PROJECT_ID=seu_app
STORAGE_BUCKET=seu_app.appspot.com
MESSAGING_SENDER_ID=seu_sender_id
APP_ID=seu_app_id
```

## Segurança

- **NUNCA** cometa o arquivo `.env` no controle de versão
- O arquivo `.env` está incluído no `.gitignore` para evitar que seja acidentalmente adicionado ao repositório
- Use o arquivo `.env.example` como modelo, mas nunca inclua credenciais reais nele

## Como obter as credenciais do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Clique em "Configurações do Projeto" (ícone de engrenagem)
4. Na aba "Geral", role para baixo até "Seus aplicativos" e selecione o aplicativo web
5. Copie as credenciais da seção de configuração do SDK

## Ambientes de Desenvolvimento vs. Produção

Para ambientes diferentes, você pode criar arquivos de ambiente separados:

- `.env.development` - Para ambiente de desenvolvimento
- `.env.production` - Para ambiente de produção

## Resolução de Problemas

Se você ver o erro "Variáveis de ambiente do Firebase estão faltando", verifique:

1. Se o arquivo `.env` existe na raiz do projeto
2. Se todas as variáveis necessárias estão definidas no arquivo
3. Se o pacote `react-native-dotenv` está configurado corretamente no seu `babel.config.js`

## Validação Automática

O serviço Firebase (`firebaseService.js`) inclui validação automática das variáveis de ambiente e mostrará mensagens de erro úteis caso alguma esteja faltando. 