const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Gerar token de atualização
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET + '-refresh',
    { expiresIn: '7d' }
  );
};

// Registrar um novo usuário
exports.register = async (req, res, next) => {
  try {
    const { email, password, displayName, profession, specialization, crm, phoneNumber } = req.body;

    // Verificar se o e-mail já está em uso
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'E-mail já está em uso'
      });
    }

    // Criar novo usuário
    const user = await User.create({
      email,
      password,
      displayName,
      profession,
      specialization,
      crm,
      phoneNumber
    });

    // Gerar tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Login de usuário
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verificar se o usuário existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Gerar tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Atualizar token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token não fornecido'
      });
    }

    // Verificar refresh token
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET + '-refresh');
      
      // Verificar se o usuário existe
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Gerar novos tokens
      const token = generateToken(user.id);
      const newRefreshToken = generateRefreshToken(user.id);

      res.status(200).json({
        success: true,
        token,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token inválido ou expirado'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Enviar e-mail de redefinição de senha
exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Verificar se o usuário existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Por segurança, não informamos se o e-mail existe ou não
      return res.status(200).json({
        success: true,
        message: 'Se o e-mail existir, um link de redefinição de senha será enviado'
      });
    }

    // Em uma implementação real, enviaríamos um e-mail com o link de redefinição
    // Por enquanto, apenas simulamos o envio
    console.log(`Enviando e-mail de redefinição para ${email}`);

    res.status(200).json({
      success: true,
      message: 'Se o e-mail existir, um link de redefinição de senha será enviado'
    });
  } catch (error) {
    next(error);
  }
}; 