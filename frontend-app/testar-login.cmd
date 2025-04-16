@echo off
echo === Testando tela de login atualizada ===
echo.

cd %~dp0
echo Diretorio atual: %CD%
echo.

echo === Limpando cache e iniciando aplicativo ===
npx expo start --clear

echo.
echo Para testar o login, use:
echo Email: teste@exemplo.com
echo Senha: senha123
echo.
echo Para sair, pressione Ctrl+C 