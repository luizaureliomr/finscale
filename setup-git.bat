@echo off
echo *********************************************
echo *    Configurando Repositório Git Finscale   *
echo *********************************************
echo.

echo Verificando a instalação do Git...
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Git não encontrado! Por favor instale o Git primeiro.
    echo Você pode baixá-lo em: https://git-scm.com/downloads
    goto :error
)

echo Git encontrado! Verificando repositório...

REM Verificar se já existe um repositório Git
if exist ".git" (
    echo Repositório Git já existe nesta pasta.
    echo Pulando a inicialização.
) else (
    echo Inicializando novo repositório Git...
    git init
)

REM Configurar nome de usuário e email se não estiverem configurados
git config --get user.name >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Configuração de usuário Git não encontrada.
    set /p git_name="Digite seu nome para o Git: "
    set /p git_email="Digite seu email para o Git: "
    
    git config user.name "%git_name%"
    git config user.email "%git_email%"
    
    echo Usuário Git configurado!
    echo.
)

echo Verificando arquivos para adicionar...
git status --porcelain > git_status.tmp
findstr /R /C:"." git_status.tmp >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Nenhuma alteração encontrada para commit.
) else (
    echo Adicionando arquivos ao repositório...
    git add .
    
    echo Criando commit inicial...
    git commit -m "Commit inicial do projeto Finscale"
)
del git_status.tmp

REM Detectar nome da branch principal
for /f "tokens=*" %%a in ('git branch --show-current') do set branch_name=%%a
if "%branch_name%"=="" (
    set branch_name=main
    for /f "tokens=*" %%a in ('git symbolic-ref --short HEAD') do set branch_name=%%a
)

echo.
echo Repositório Git configurado com sucesso!
echo.
echo Próximos passos:
echo 1. Crie um repositório no GitHub, GitLab ou outro serviço
echo 2. Execute os comandos para conectar ao repositório remoto:
echo    git remote add origin [URL_DO_SEU_REPOSITORIO]
echo    git push -u origin %branch_name%
echo.

goto :end

:error
echo.
echo Houve um erro na configuração do repositório Git.
echo.
exit /B 1

:end
echo.
echo Pressione qualquer tecla para sair...
pause >nul 