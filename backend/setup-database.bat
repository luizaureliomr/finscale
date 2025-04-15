@echo off
echo *********************************************
echo *   Configurando o banco de dados Finscale  *
echo *********************************************
echo.

REM Verifica se o PostgreSQL está disponível
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: PostgreSQL nao encontrado.
    echo Por favor, instale o PostgreSQL e adicione-o ao PATH.
    echo Ou execute como administrador se o PostgreSQL ja estiver instalado.
    goto :error
)

echo Verificando conexao com o PostgreSQL...
psql -U postgres -c "\conninfo" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Nao foi possivel conectar ao PostgreSQL.
    echo Verifique se o servico esta em execucao e se as credenciais estao corretas.
    goto :error
)

REM Verifica se o banco já existe
echo Verificando banco de dados existente...
psql -U postgres -c "\l" | findstr /C:"finscale" >nul
if %ERRORLEVEL% EQU 0 (
    echo O banco de dados 'finscale' ja existe.
    set /p resposta=Deseja recriar o banco de dados? (S/N): 
    if /I "%resposta%"=="S" (
        echo Excluindo banco de dados existente...
        psql -U postgres -c "DROP DATABASE finscale;" >nul 2>&1
        if %ERRORLEVEL% NEQ 0 (
            echo ERRO: Falha ao excluir o banco de dados.
            goto :error
        )
    ) else (
        echo Continuando com o banco existente.
        goto :create_tables
    )
)

REM Criar o banco de dados
echo Criando banco de dados...
psql -U postgres -c "CREATE DATABASE finscale;" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao criar o banco de dados.
    goto :error
)
echo Banco de dados 'finscale' criado com sucesso.

:create_tables
REM Criar extensões
echo Criando extensoes...
psql -U postgres -d finscale -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" >nul 2>&1
psql -U postgres -d finscale -c "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";" >nul 2>&1

REM Executar o script principal para criar tabelas
echo Criando tabelas...
psql -U postgres -d finscale -f src/models/database.sql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao criar as tabelas.
    goto :error
)

echo Verificando tabelas criadas...
psql -U postgres -d finscale -c "\dt"
echo.
echo Configuracao do banco de dados concluida com sucesso!
goto :end

:error
echo.
echo Ocorreu um erro durante a configuracao do banco de dados.
echo Por favor, verifique as mensagens acima e tente novamente.
echo.
exit /B 1

:end
echo.
echo Pressione qualquer tecla para sair...
pause >nul 
