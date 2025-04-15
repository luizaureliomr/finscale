// Este é um arquivo de exemplo. 
// Faça uma cópia como 'firebase.config.js' e preencha com suas credenciais reais

// Exportação do objeto de configuração do Firebase
export const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID",
  measurementId: "SEU_MEASUREMENT_ID"
};

// Estas configurações devem ser obtidas no console do Firebase:
// 1. Acesse https://console.firebase.google.com/
// 2. Selecione seu projeto
// 3. Vá para "Configurações do projeto" (ícone de engrenagem)
// 4. Na aba "Geral", role até "Seus aplicativos" e selecione seu app web
// 5. Copie os valores do objeto firebaseConfig 