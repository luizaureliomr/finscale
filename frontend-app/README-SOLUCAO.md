# Solução para Problemas de Compatibilidade no Projeto Finscale

Este arquivo contém instruções para resolver os problemas de compatibilidade e dependências no projeto Finscale.

## O Problema

Foi identificado que o projeto tem problemas de compatibilidade entre versões de dependências:

1. **Falta a dependência `axios`** que é utilizada pelo serviço de API (`apiService.js`)
2. **Incompatibilidade entre versões** do Expo, React e React Native

## Opções de Solução

### Opção 1: Instalar axios (Solução Rápida)

Se você estiver enfrentando apenas o erro de `axios` não encontrado:

1. No PowerShell ou CMD, navegue até a pasta do projeto:
   ```
   cd caminho\para\frontend-app
   ```

2. Execute o comando:
   ```
   npm install axios --save
   ```

3. Reinicie o servidor Expo:
   ```
   npx expo start --clear
   ```

### Opção 2: Usar o arquivo batch de instalação (Solução Completa)

Para resolver todos os problemas de compatibilidade de uma vez:

1. Abra o PowerShell ou CMD como administrador
2. Navegue até a pasta do projeto
3. Execute o arquivo batch:
   ```
   .\fix-deps.bat
   ```
4. Aguarde a conclusão da instalação de todas as dependências
5. Reinicie o servidor Expo:
   ```
   npx expo start --clear
   ```

### Opção 3: Usar a versão sem axios (Solução Alternativa)

Se você não conseguir instalar o axios por qualquer motivo:

1. Renomeie o arquivo `apiService-noaxios.js` para `apiService.js` (faça backup do original primeiro)
2. Esta versão usa a API Fetch nativa em vez do axios

## Detalhes Técnicos

### Dependências atualizadas

O script de correção instala as seguintes versões compatíveis:

- axios
- @react-native-async-storage/async-storage@1.23.1
- react@18.3.1
- react-native@0.76.9
- react-native-safe-area-context@4.12.0
- react-native-screens@4.4.0
- react-native-svg@15.8.0

### Possíveis Erros

Se você encontrar erros após a instalação:

1. **Erro de módulos nativos**: Execute `npm rebuild`
2. **Conflito de versões persistente**: Delete a pasta `node_modules` e o arquivo `package-lock.json`, e execute `npm install` novamente
3. **Erro no Metro bundler**: Execute `npx react-native start --reset-cache`

## Contato para Suporte

Se você continuar enfrentando problemas, entre em contato com a equipe de desenvolvimento. 