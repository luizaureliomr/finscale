@echo off
echo === Iniciando Aplicativo Finscale (Modo Completo) ===
echo.

cd %~dp0
echo Diretorio atual: %CD%
echo.

echo === Verificando dependencias ===
npx expo doctor --fix

echo === Iniciando aplicativo com Expo (modo producao) ===
npx expo start --clear --no-dev

echo.
echo Se o aplicativo nao abrir automaticamente, abra um navegador em:
echo http://localhost:8081
echo.
echo Para sair, pressione Ctrl+C 