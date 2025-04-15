/**
 * Utilitários para formatação de valores
 */

/**
 * Formata um valor numérico para moeda brasileira (R$)
 * @param {number} value - O valor a ser formatado
 * @returns {string} - Valor formatado como moeda
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
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
 * Formata um número de telefone para o formato brasileiro
 * @param {string} phone - Número de telefone (somente dígitos)
 * @returns {string} - Telefone formatado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
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