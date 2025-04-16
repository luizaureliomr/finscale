/**
 * Script para corrigir dependências do projeto
 * 
 * Execute este script com: node fix-dependencies.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Lista de dependências a serem instaladas
const dependencies = [
  'axios',
  '@react-native-async-storage/async-storage@1.23.1',
  'react@18.3.1',
  'react-native@0.76.9',
  'react-native-safe-area-context@4.12.0',
  'react-native-screens@4.4.0',
  'react-native-svg@15.8.0'
];

console.log('🔧 Iniciando correção de dependências...');

// Instalar cada dependência individualmente
dependencies.forEach(dep => {
  console.log(`📦 Instalando ${dep}...`);
  try {
    execSync(`npm install ${dep} --save`, { stdio: 'inherit' });
    console.log(`✅ ${dep} instalado com sucesso!`);
  } catch (error) {
    console.error(`❌ Erro ao instalar ${dep}: ${error.message}`);
  }
});

console.log('🧹 Limpando cache...');
try {
  // Limpar caches
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Cache do npm limpo!');
} catch (error) {
  console.error(`❌ Erro ao limpar cache: ${error.message}`);
}

console.log('🎉 Processo de correção concluído!');
console.log('📝 Execute "expo start --clear" para iniciar seu projeto com cache limpo.'); 