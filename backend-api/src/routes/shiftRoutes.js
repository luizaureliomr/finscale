const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Rota temporária para listar plantões disponíveis
router.get('/available', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Função para obter plantões disponíveis - em implementação',
    data: []
  });
});

// Outras rotas serão implementadas posteriormente

module.exports = router; 