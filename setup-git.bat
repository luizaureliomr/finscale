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

echo Git encontrado! Inicializando repositório...

echo Configurando repositório Git na pasta atual...
git init

echo Adicionando todos os arquivos ao repositório...
git add .

echo Criando o primeiro commit...
git commit -m "Commit inicial do projeto Finscale"

echo.
echo Repositório Git configurado com sucesso!
echo.
echo Próximos passos:
echo 1. Crie um repositório no GitHub, GitLab ou outro serviço
echo 2. Execute os comandos para conectar ao repositório remoto:
echo    git remote add origin [URL_DO_SEU_REPOSITORIO]
echo    git push -u origin main
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