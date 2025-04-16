@echo off
echo === Versao simplificada do aplicativo Finscale ===
echo.

cd %~dp0
echo Diretorio atual: %CD%
echo.

echo === Iniciando aplicativo com Expo (modo producao) ===
npx expo start --clear -c --no-dev

echo.
echo Se o aplicativo nao abrir automaticamente, abra um navegador em:
echo http://localhost:8081
echo.
echo Para restaurar a versao completa, execute:
echo copy App.js.original App.js
echo.
echo Para sair, pressione Ctrl+C 