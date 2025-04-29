const { verifyToken } = require('../utils/jwt');
const { User, List } = require('../models');

// Middleware para proteger rutas
const protect = async (req, res, next) => {
  let token;

  // Verificar si hay token en el header de Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar el token
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado, token inválido'
        });
      }

      // Buscar usuario por ID y excluir password
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado, usuario no encontrado'
        });
      }

      // Agregar usuario a la solicitud
      req.user = user;
      next();
    } catch (error) {
      console.error('Error en middleware de autenticación:', error);
      return res.status(401).json({
        success: false,
        message: 'No autorizado, error de autenticación'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'No autorizado, no se proporcionó token'
    });
  }
};

// Middleware para restringir acceso a roles específicos
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado, usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Rol ${req.user.role} no tiene permiso para esta acción`
      });
    }

    next();
  };
};

// Helper to check if a user has access to a list (owner, admin, or collaborator with required permission)
const checkListAccess = async (listId, user, requiredPermission = 'ver') => {
  const lista = await List.findById(listId).populate('colaboradores.userId');
  if (!lista) {
    const err = new Error('Lista no encontrada');
    err.status = 404;
    throw err;
  }
  // Owner or admin
  if (lista.userId.toString() === user._id.toString() || user.role === 'admin') {
    return lista;
  }
  // Collaborator check
  const collaborator = lista.colaboradores.find(collab => {
    const collabUserId = collab.userId._id
      ? collab.userId._id.toString()
      : collab.userId.toString();
    return collabUserId === user._id.toString();
  });
  if (!collaborator) {
    const err = new Error('No autorizado para acceder a esta lista');
    err.status = 403;
    throw err;
  }
  // Permission check
  if (requiredPermission === 'ver') {
    return lista;
  }
  if (requiredPermission === 'editar' && collaborator.permiso === 'editar') {
    return lista;
  }
  const err = new Error('No autorizado para acceder a esta lista');
  err.status = 403;
  throw err;
};

module.exports = { protect, authorize, checkListAccess }; 