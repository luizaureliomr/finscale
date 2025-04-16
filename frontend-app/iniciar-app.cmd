@echo off
echo === Iniciando Aplicativo Finscale (Modo Simplificado) ===
echo.

cd %~dp0
echo Diretorio atual: %CD%
echo.

echo === Iniciando aplicativo com Expo ===
npx expo start --clear --no-dev

echo.
echo Se o aplicativo nao abrir automaticamente, abra um navegador em:
echo http://localhost:8081
echo.
echo Para sair, pressione Ctrl+C 