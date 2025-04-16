/**
 * Utilitários para formatação de valores usados em toda a aplicação
 */
export const formatUtils = {
  /**
   * Formata um valor numérico como moeda (BRL)
   * @param {number} value - Valor a ser formatado
   * @returns {string} Valor formatado como moeda
   */
  formatCurrency: (value) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    
    // Garantir que o valor seja numérico
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Verificar se é um número válido
    if (isNaN(numValue)) return 'R$ 0,00';
    
    // Formatar com Intl.NumberFormat para garantir padronização
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  },
  
  /**
   * Formata uma data para o formato local brasileiro
   * @param {Date|string} date - Data para formatação
   * @returns {string} Data formatada
   */
  formatDate: (date) => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Verificar se é uma data válida
      if (isNaN(dateObj.getTime())) return '';
      
      return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  },
  
  /**
   * Formata um número de telefone para o padrão brasileiro
   * @param {string} phone - Número de telefone
   * @returns {string} Número formatado
   */
  formatPhone: (phone) => {
    if (!phone) return '';
    
    // Remover caracteres não numéricos
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      // Celular: (XX) XXXXX-XXXX
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
    } else if (numbers.length === 10) {
      // Fixo: (XX) XXXX-XXXX
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
    }
    
    // Retornar o número original se não corresponder aos padrões conhecidos
    return phone;
  },
  
  /**
   * Formata um texto em formato de CPF
   * @param {string} cpf - String contendo o CPF
   * @returns {string} CPF formatado
   */
  formatCPF: (cpf) => {
    if (!cpf) return '';
    
    // Remover caracteres não numéricos
    const numbers = cpf.replace(/\D/g, '');
    
    if (numbers.length !== 11) return cpf;
    
    return `${numbers.substring(0, 3)}.${numbers.substring(3, 6)}.${numbers.substring(6, 9)}-${numbers.substring(9)}`;
  }
}; 