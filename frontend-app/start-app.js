/**
 * Script para iniciar a aplicação com flags de depuração
 * Execute com: node start-app.js
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Verificando ambiente...');

// Verificar se o arquivo firebase.config.js existe
if (!fs.existsSync('./firebase.config.js')) {
  console.error('❌ Arquivo firebase.config.js não encontrado!');
  console.log('Por favor, crie o arquivo firebase.config.js com suas credenciais Firebase.');
  process.exit(1);
}

console.log('✅ Configuração Firebase encontrada');

// Verificar se o diretório src existe
if (!fs.existsSync('./src')) {
  console.error('❌ Diretório src não encontrado!');
  process.exit(1);
}

console.log('✅ Estrutura de diretórios verificada');

// Iniciar aplicação com Expo em modo verbose
console.log('🚀 Iniciando aplicação com Expo...');

try {
  execSync('npx expo start --web --no-dev --clear', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Erro ao iniciar a aplicação:');
  console.error(error.message);
  process.exit(1);
} 