// Script simples para instalar axios
const { execSync } = require('child_process');

try {
  console.log('Instalando axios...');
  execSync('npm install axios --save', { stdio: 'inherit' });
  console.log('Axios instalado com sucesso!');
} catch (error) {
  console.error('Erro ao instalar axios:', error.message);
} 