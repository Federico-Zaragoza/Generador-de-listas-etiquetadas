const jwt = require('jsonwebtoken');

// Generar JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'generador_listas_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Verificar token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'generador_listas_secret_key');
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken }; 