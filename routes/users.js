const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { protect, authorize, checkListAccess } = require('../middleware/auth');

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
        fecha_registro: user.fecha_registro
      }))
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
});

// @desc    Obtener estadísticas de usuarios para administradores
// @route   GET /api/users/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    // Obtener fecha de inicio del día actual
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Obtener estadísticas
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const newTodayCount = await User.countDocuments({ 
      createdAt: { $gte: startOfDay } 
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        adminCount,
        newTodayCount
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

// @desc    Obtener un usuario
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
        fecha_registro: user.fecha_registro,
        fecha_nacimiento: user.fecha_nacimiento
      }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
});

// @desc    Eliminar un usuario
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
});

// @desc    Cambiar rol de usuario
// @route   PUT /api/users/:id/role
// @access  Private/Admin
router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'Rol de usuario actualizado correctamente',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar rol de usuario',
      error: error.message
    });
  }
});

// @desc    Toggle lista favorita para el usuario actual
// @route   PUT /api/users/me/lists/favorite/:listId
// @access  Private
router.put('/me/lists/favorite/:listId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const listId = req.params.listId;

    // Verificar que la lista existe
    const lista = await require('../models').List.findById(listId);
    if (!lista) {
      return res.status(404).json({
        success: false,
        message: 'Lista no encontrada'
      });
    }

    // Verificar permiso de lectura para esta lista
    try {
      await checkListAccess(listId, req.user, 'ver');
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      throw error;
    }

    // Consulta ligera para saber si la lista ya está en favoritos
    const userCheck = await User.findById(userId).select('listasFavoritas');
    const isFavorite = userCheck.listasFavoritas.includes(listId);
    
    // Definir operación de actualización basada en el estado actual
    const updateOperation = isFavorite 
      ? { $pull: { listasFavoritas: listId } } 
      : { $addToSet: { listasFavoritas: listId } };
    
    // Actualizar atómicamente con findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateOperation,
      { new: true, runValidators: true } // Devuelve el documento actualizado y ejecuta validaciones
    );

    res.json({
      success: true,
      isFavorite: !isFavorite,
      message: isFavorite 
        ? 'Lista removida de favoritos' 
        : 'Lista añadida a favoritos',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        nombre: updatedUser.nombre,
        role: updatedUser.role,
        listasFavoritas: updatedUser.listasFavoritas,
        listasArchivadas: updatedUser.listasArchivadas
      }
    });
  } catch (error) {
    console.error('Error al modificar lista favorita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
});

// @desc    Toggle lista archivada para el usuario actual
// @route   PUT /api/users/me/lists/archive/:listId
// @access  Private
router.put('/me/lists/archive/:listId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const listId = req.params.listId;

    // Verificar que la lista existe
    const lista = await require('../models').List.findById(listId);
    if (!lista) {
      return res.status(404).json({
        success: false,
        message: 'Lista no encontrada'
      });
    }

    // Verificar permiso de lectura para esta lista
    try {
      await checkListAccess(listId, req.user, 'ver');
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      throw error;
    }

    // Consulta ligera para saber si la lista ya está archivada
    const userCheck = await User.findById(userId).select('listasArchivadas');
    const isArchived = userCheck.listasArchivadas.includes(listId);
    
    // Definir operación de actualización basada en el estado actual
    const updateOperation = isArchived 
      ? { $pull: { listasArchivadas: listId } } 
      : { $addToSet: { listasArchivadas: listId } };
    
    // Actualizar atómicamente con findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateOperation,
      { new: true, runValidators: true } // Devuelve el documento actualizado y ejecuta validaciones
    );

    res.json({
      success: true,
      isArchived: !isArchived,
      message: isArchived 
        ? 'Lista desarchivada' 
        : 'Lista archivada',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        nombre: updatedUser.nombre,
        role: updatedUser.role,
        listasFavoritas: updatedUser.listasFavoritas,
        listasArchivadas: updatedUser.listasArchivadas
      }
    });
  } catch (error) {
    console.error('Error al archivar/desarchivar lista:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
});

// @desc    Actualizar usuario (solo admin)
// @route   PUT /api/users/:id
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { username, email, nombre, role } = req.body;

    // Verificar si el usuario existe
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Preparar datos a actualizar
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (nombre) updateData.nombre = nombre;
    if (role && ['user', 'admin'].includes(role)) updateData.role = role;

    // Actualizar atómicamente con findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Usuario actualizado correctamente',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        nombre: updatedUser.nombre,
        role: updatedUser.role,
        fecha_registro: updatedUser.fecha_registro
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      const message = messages[0] || 'Error de validación';
      return res.status(400).json({ success: false, message });
    }

    // Invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de usuario inválido' });
    }

    // Duplicate key (username o email ya existen)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue).join(', ');
      const message = `El ${field} ya está en uso`;
      return res.status(400).json({ success: false, message });
    }
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al actualizar usuario'
    });
  }
});

module.exports = router; 