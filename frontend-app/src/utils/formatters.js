/**
 * Utilitários para formatação de dados
 */

/**
 * Formata um valor numérico para moeda brasileira
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado como moeda (ex: R$ 1.234,56)
 */
export const formatCurrency = (value) => {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
};

/**
 * Converte uma string de data no formato ISO para formato brasileiro
 * @param {string} dateString - Data no formato ISO (YYYY-MM-DD)
 * @returns {string} Data no formato brasileiro (DD/MM/YYYY)
 */
export const formatDateBR = (dateString) => {
  if (!dateString) return '';
  
  // Se for um objeto Date, converte para string ISO
  if (dateString instanceof Date) {
    dateString = dateString.toISOString();
  }
  
  // Verifica se a data está no formato ISO
  if (dateString && typeof dateString === 'string' && dateString.includes('-')) {
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  }
  
  return dateString; // Retorna a string original se não estiver no formato esperado
};

/**
 * Converte um timestamp do Firebase para formato brasileiro
 * @param {Object} timestamp - Timestamp do Firestore
 * @returns {string} Data no formato brasileiro (DD/MM/YYYY)
 */
export const formatTimestampBR = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    // Verificar se é um timestamp do Firestore
    if (timestamp && timestamp.toDate && typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      return formatDateBR(date.toISOString());
    }
    
    return '';
  } catch (error) {
    console.error('Erro ao formatar timestamp:', error);
    return '';
  }
};

/**
 * Converte número para string com formatação de moeda
 * @param {string|number} value - Valor numérico ou string a ser formatada
 * @returns {string} Valor formatado como moeda sem o símbolo (ex: 1.234,56)
 */
export const formatNumberAsCurrency = (value) => {
  if (!value) return '0,00';
  
  // Certifica que estamos trabalhando com um número
  const numValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'))
    : value;
    
  if (isNaN(numValue)) return '0,00';
  
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Converte string formatada como moeda para número
 * @param {string} value - String formatada (ex: "R$ 1.234,56" ou "1.234,56")
 * @returns {number} Valor numérico
 */
export const currencyToNumber = (value) => {
  if (!value) return 0;
  
  // Remove símbolo de moeda e caracteres não numéricos, exceto vírgula e ponto
  const cleanValue = value.toString().replace(/[^\d,.-]/g, '');
  
  // Converte padrão brasileiro (1.234,56) para padrão JS (1234.56)
  const normalizedValue = cleanValue.replace('.', '').replace(',', '.');
  
  return parseFloat(normalizedValue);
};

/**
 * Formata um número de telefone
 * @param {string} phone - Número de telefone (somente dígitos)
 * @returns {string} Número formatado ((99) 99999-9999)
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remove caracteres não numéricos
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length <= 10) {
    // Formato (99) 9999-9999
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    // Formato (99) 99999-9999
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

/**
 * Formata uma data ISO para o formato brasileiro (dd/mm/yyyy)
 * @param {string|Date} date - A data a ser formatada (string ISO ou objeto Date)
 * @returns {string} - Data formatada
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('pt-BR');
};

/**
 * Formata uma data ISO para exibir data e hora no formato brasileiro
 * @param {string|Date} date - A data a ser formatada (string ISO ou objeto Date)
 * @returns {string} - Data e hora formatadas
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString('pt-BR');
};

/**
 * Converte uma string de data ISO para um objeto Date
 * @param {string} isoString - String de data no formato ISO
 * @returns {Date} - Objeto Date
 */
export const isoToDate = (isoString) => {
  if (!isoString) return null;
  return new Date(isoString);
};

/**
 * Formata um CPF para o formato brasileiro
 * @param {string} cpf - CPF (somente dígitos)
 * @returns {string} - CPF formatado
 */
export const formatCPF = (cpf) => {
  if (!cpf) return '';
  
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return cpf;
  
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}; 