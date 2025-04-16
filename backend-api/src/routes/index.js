const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Rotas de notificações
router.use('/notifications', notificationController);

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'API de teste funcionando!' });
});

module.exports = router; 