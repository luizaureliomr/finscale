const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

// Middleware para verificar se o Firebase foi inicializado
const checkFirebaseInitialized = (req, res, next) => {
  if (!notificationService.isInitialized()) {
    return res.status(503).json({
      success: false,
      error: 'Serviço de notificação não está disponível. Verifique as credenciais do Firebase.'
    });
  }
  next();
};

// Aplicar o middleware a todas as rotas
router.use(checkFirebaseInitialized);

/**
 * @route POST /api/notifications/device
 * @desc Envia notificação para um dispositivo específico
 * @access Private (requer autenticação)
 */
router.post('/device', async (req, res) => {
  try {
    const { token, title, body, data } = req.body;
    
    // Validar parâmetros obrigatórios
    if (!token || !title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Token, título e corpo são obrigatórios'
      });
    }
    
    const result = await notificationService.sendToDevice(token, title, body, data || {});
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/notifications/multiple
 * @desc Envia notificação para múltiplos dispositivos
 * @access Private (requer autenticação)
 */
router.post('/multiple', async (req, res) => {
  try {
    const { tokens, title, body, data } = req.body;
    
    // Validar parâmetros obrigatórios
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'O parâmetro tokens deve ser um array não vazio'
      });
    }
    
    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Título e corpo são obrigatórios'
      });
    }
    
    const result = await notificationService.sendToMultipleDevices(tokens, title, body, data || {});
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Erro ao enviar notificações para múltiplos dispositivos:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/notifications/topic
 * @desc Envia notificação para um tópico
 * @access Private (requer autenticação)
 */
router.post('/topic', async (req, res) => {
  try {
    const { topic, title, body, data } = req.body;
    
    // Validar parâmetros obrigatórios
    if (!topic || !title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Tópico, título e corpo são obrigatórios'
      });
    }
    
    const result = await notificationService.sendToTopic(topic, title, body, data || {});
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Erro ao enviar notificação para tópico:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/notifications/subscribe
 * @desc Inscreve dispositivos em um tópico
 * @access Private (requer autenticação)
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { tokens, topic } = req.body;
    
    // Validar parâmetros obrigatórios
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'O parâmetro tokens deve ser um array não vazio'
      });
    }
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Tópico é obrigatório'
      });
    }
    
    const result = await notificationService.subscribeToTopic(tokens, topic);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Erro ao inscrever dispositivos no tópico:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/notifications/unsubscribe
 * @desc Desinscreve dispositivos de um tópico
 * @access Private (requer autenticação)
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { tokens, topic } = req.body;
    
    // Validar parâmetros obrigatórios
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'O parâmetro tokens deve ser um array não vazio'
      });
    }
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Tópico é obrigatório'
      });
    }
    
    const result = await notificationService.unsubscribeFromTopic(tokens, topic);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error('Erro ao desinscrever dispositivos do tópico:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/notifications/test
 * @desc Rota de teste para verificar se o serviço de notificação está funcionando
 * @access Private (requer autenticação)
 */
router.get('/test', (req, res) => {
  return res.json({
    success: true,
    initialized: notificationService.isInitialized(),
    message: 'Serviço de notificação está' + (notificationService.isInitialized() ? ' ' : ' não ') + 'inicializado'
  });
});

module.exports = router; 