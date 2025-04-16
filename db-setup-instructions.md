# Instruções para Configurar o Banco de Dados PostgreSQL

Para configurar o banco de dados corretamente para o projeto Finscale, siga estas instruções passo a passo usando o pgAdmin 4:

## 1. Inicie o pgAdmin 4

- Abra o menu Iniciar do Windows
- Procure por "pgAdmin 4" e execute-o
- Aguarde o pgAdmin 4 iniciar e abrir no seu navegador padrão

## 2. Conecte-se ao servidor PostgreSQL

- No painel esquerdo, expanda "Servers"
- Se solicitado, insira a senha mestra do pgAdmin que você definiu durante a instalação
- Se o servidor PostgreSQL ainda não estiver listado, adicione-o:
  - Clique com o botão direito em "Servers" > "Register" > "Server"
  - Na aba "General", dê um nome como "PostgreSQL local"
  - Na aba "Connection", preencha:
    - Host: `localhost` ou `127.0.0.1`
    - Port: `5432`
    - Maintenance database: `postgres`
    - Username: `postgres`
    - Password: [A senha que você definiu durante a instalação]
  - Clique em "Save"

## 3. Verifique a senha correta do usuário postgres

- Certifique-se de que consegue se conectar ao servidor com a senha fornecida
- Se estiver tendo problemas, você pode redefinir a senha do usuário postgres:
  - Abra o prompt de comando como administrador
  - Navegue até o diretório bin do PostgreSQL (ex: `C:\Program Files\PostgreSQL\17\bin`)
  - Execute o comando:
    ```
    psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'suaNovaSenha';"
    ```

## 4. Crie o banco de dados finscale_db

- No pgAdmin, depois de conectado ao servidor:
- Clique com o botão direito em "Databases" > "Create" > "Database..."
- No campo "Database", digite: `finscale_db`
- Deixe as outras opções com valores padrão
- Clique em "Save"

## 5. Verifique a conexão com o banco de dados

- Após criar o banco de dados, expanda "Databases" e verifique se "finscale_db" aparece na lista
- Clique com o botão direito em "finscale_db" > "Query Tool"
- No Query Tool, execute:
  ```sql
  SELECT current_database(), current_user, version();
  ```
- Você deve ver uma saída confirmando que está conectado ao "finscale_db"

## 6. Atualize o arquivo .env do projeto

- Abra o arquivo `backend-api/.env`
- Certifique-se de que as configurações estão corretas:
  ```
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=finscale_db
  DB_USER=postgres
  DB_PASSWORD=suaSenhaAqui  # A senha que você definiu para o PostgreSQL
  ```

## 7. Execute o servidor backend

- Com o banco de dados criado e as configurações atualizadas, execute:
  ```
  cd backend-api
  npm run dev
  ```
- O servidor iniciará e criará as tabelas automaticamente

## Solução de Problemas

Se encontrar erros de "autenticação falhou para o usuário postgres":
- Verifique se a senha no arquivo .env corresponde à senha do PostgreSQL
- Certifique-se de que o PostgreSQL está em execução (serviço Windows)
- Confirme se o banco de dados "finscale_db" foi criado corretamente

Se o servidor não conseguir criar as tabelas:
- Verifique os logs de erro para mais detalhes
- Confirme se o usuário postgres tem permissões suficientes
- Verifique se não há tabelas existentes que possam estar causando conflitos 