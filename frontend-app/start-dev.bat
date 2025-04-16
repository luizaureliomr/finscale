@echo off
echo Iniciando aplicativo Finscale...
echo.

echo 1. Verificando dependências...
npx expo diagnose --fix

echo 2. Limpando cache...
npx expo start --clear

echo.
echo Se o aplicativo não iniciar, verifique se todos os arquivos estão presentes
echo e tente novamente. 