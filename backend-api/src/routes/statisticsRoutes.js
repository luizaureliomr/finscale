const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Rota temporária para obter estatísticas
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Função para obter estatísticas - em implementação',
    data: {
      earnings: [],
      shifts: { completed: 0, upcoming: 0, cancelled: 0 },
      specialties: []
    }
  });
});

// Outras rotas serão implementadas posteriormente

module.exports = router; 