@echo off
echo === Corrigindo erro do tema e iniciando aplicativo ===
echo.

cd %~dp0
echo Diretorio atual: %CD%
echo.

echo === Executando script de correção ===
node fix-theme-error.js

echo === Limpando cache ===
npx expo start -c --no-dev

echo.
echo Se o aplicativo nao funcionar, tente:
echo npx react-native clean-project --keep-node-modules
echo.
echo Para sair, pressione Ctrl+C 