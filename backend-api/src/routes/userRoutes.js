const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Rota temporária para testar a conexão
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

// Outras rotas serão implementadas posteriormente

module.exports = router; 