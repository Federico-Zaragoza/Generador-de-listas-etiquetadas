const express = require('express');
const router = express.Router();
const { List, Item, User } = require('../models');
const { protect, authorize, checkListAccess } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @desc    Obtener todas las listas del usuario (propias y compartidas)
// @route   GET /api/listas
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Buscar listas propias o donde el usuario es colaborador
    const listas = await List.find({
      $or: [
        { userId: req.user._id },
        { 'colaboradores.userId': req.user._id }
      ]
    });

    res.json({
      success: true,
      count: listas.length,
      listas
    });
  } catch (error) {
    console.error('Error al obtener listas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener listas',
      error: error.message
    });
  }
});

// @desc    Crear nueva lista
// @route   POST /api/listas
// @access  Private
router.post('/', protect, [
  body('title', 'El título es requerido').notEmpty(),
  body('description').optional().isString(),
  body('camposEspaciales').optional().isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, description, camposEspaciales } = req.body;

    const lista = await List.create({
      userId: req.user._id,
      title,
      description,
      camposEspaciales
    });

    res.status(201).json({
      success: true,
      message: 'Lista creada correctamente',
      lista
    });
  } catch (error) {
    console.error('Error al crear lista:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear lista',
      error: error.message
    });
  }
});

// @desc    Obtener lista específica con sus ítems
// @route   GET /api/listas/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Verificar acceso a la lista
    let lista;
    try {
      lista = await checkListAccess(req.params.id, req.user, 'ver');
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      throw error;
    }

    // Re-popular colaboradores con datos básicos de usuario
    lista = await List.findById(lista._id)
      .populate('colaboradores.userId', 'username nombre email');

    // Obtener ítems de la lista con sus etiquetas populadas
    const items = await Item.find({ listId: lista._id }).populate('etiquetas');

    // Convertir documento a objeto plano y añadir bandera canRemove para cada colaborador
    const listaObj = lista.toObject();
    listaObj.colaboradores = listaObj.colaboradores.map(collab => ({
      ...collab,
      canRemove: listaObj.userId.toString() === req.user._id.toString()
    }));

    res.json({
      success: true,
      lista: listaObj,
      items
    });
  } catch (error) {
    console.error('Error al obtener lista:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lista',
      error: error.message
    });
  }
});

// @desc    Actualizar lista
// @route   PUT /api/listas/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, camposEspaciales } = req.body;

    // Buscar lista
    let lista = await List.findById(req.params.id);

    if (!lista) {
      return res.status(404).json({
        success: false,
        message: 'Lista no encontrada'
      });
    }

    // Verificar acceso
    try {
      await checkListAccess(req.params.id, req.user, 'editar');
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      throw error;
    }

    // Actualizar lista
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (camposEspaciales) updateData.camposEspaciales = camposEspaciales;

    const updatedList = await List.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Lista actualizada correctamente',
      lista: updatedList
    });
  } catch (error) {
    console.error('Error al actualizar lista:', error);
    
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      const message = messages[0] || 'Error de validación';
      return res.status(400).json({ success: false, message });
    }

    // Invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    // Duplicate key
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue).join(', ');
      const message = `El valor proporcionado para ${field} ya existe`;
      return res.status(400).json({ success: false, message });
    }
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al actualizar lista'
    });
  }
});

// @desc    Eliminar lista
// @route   DELETE /api/listas/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    // Buscar lista
    const lista = await List.findById(req.params.id);

    if (!lista) {
      return res.status(404).json({
        success: false,
        message: 'Lista no encontrada'
      });
    }

    // Verificar solo propietario
    if (lista.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para eliminar esta lista'
      });
    }

    // Eliminar lista e ítems asociados
    await List.findByIdAndDelete(req.params.id);
    await Item.deleteMany({ listId: req.params.id });

    res.json({
      success: true,
      message: 'Lista eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar lista:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al eliminar lista'
    });
  }
});

// @desc    Marcar lista como favorita
// @route   PUT /api/listas/:id/favorita
// @access  Private
router.put('/:id/favorita', protect, async (req, res) => {
  try {
    // Verificar que la lista existe
    const lista = await List.findById(req.params.id);

    if (!lista) {
      return res.status(404).json({
        success: false,
        message: 'Lista no encontrada'
      });
    }

    // Actualizar el usuario agregando la lista a favoritos
    const user = await User.findById(req.user._id);
    
    if (user.listasFavoritas.includes(req.params.id)) {
      // Quitar de favoritos si ya está
      user.listasFavoritas = user.listasFavoritas.filter(
        id => id.toString() !== req.params.id
      );
      await user.save();
      
      return res.json({
        success: true,
        message: 'Lista removida de favoritos',
        esFavorita: false
      });
    } else {
      // Agregar a favoritos
      user.listasFavoritas.push(req.params.id);
      await user.save();
      
      return res.json({
        success: true,
        message: 'Lista marcada como favorita',
        esFavorita: true
      });
    }
  } catch (error) {
    console.error('Error al marcar lista como favorita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar lista como favorita',
      error: error.message
    });
  }
});

// @desc    Marcar lista como archivada
// @route   PUT /api/listas/:id/archivada
// @access  Private
router.put('/:id/archivada', protect, async (req, res) => {
  try {
    // Verificar que la lista existe
    const lista = await List.findById(req.params.id);

    if (!lista) {
      return res.status(404).json({
        success: false,
        message: 'Lista no encontrada'
      });
    }

    // Actualizar el usuario agregando la lista a archivadas
    const user = await User.findById(req.user._id);
    
    if (user.listasArchivadas.includes(req.params.id)) {
      // Quitar de archivadas si ya está
      user.listasArchivadas = user.listasArchivadas.filter(
        id => id.toString() !== req.params.id
      );
      await user.save();
      
      return res.json({
        success: true,
        message: 'Lista desarchivada',
        estaArchivada: false
      });
    } else {
      // Agregar a archivadas
      user.listasArchivadas.push(req.params.id);
      await user.save();
      
      return res.json({
        success: true,
        message: 'Lista archivada',
        estaArchivada: true
      });
    }
  } catch (error) {
    console.error('Error al archivar lista:', error);
    res.status(500).json({
      success: false,
      message: 'Error al archivar lista',
      error: error.message
    });
  }
});

// @desc    Compartir lista con colaborador
// @route   POST /api/listas/:listId/share
// @access  Private (solo propietario)
router.post('/:listId/share', protect, async (req, res) => {
  try {
    const { listId } = req.params;
    const { emailOrUsername, permiso } = req.body;

    // Buscar lista
    const lista = await List.findById(listId);
    if (!lista) {
      return res.status(404).json({ success: false, message: 'Lista no encontrada' });
    }

    // Solo el propietario puede invitar
    if (lista.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para compartir esta lista' });
    }

    // Buscar usuario a invitar
    const userToInvite = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });
    if (!userToInvite) {
      return res.status(404).json({ success: false, message: 'Usuario a invitar no encontrado' });
    }

    // No invitar al propietario
    if (userToInvite._id.toString() === lista.userId.toString()) {
      return res.status(400).json({ success: false, message: 'No se puede invitar al propietario de la lista' });
    }

    // Verificar que no esté ya invitado
    const invitedIds = lista.colaboradores.map(c => c.userId.toString());
    if (invitedIds.includes(userToInvite._id.toString())) {
      return res.status(400).json({ success: false, message: 'Usuario ya invitado' });
    }

    // Crear colaborador
    const newCollaborator = { userId: userToInvite._id, permiso: permiso || 'ver' };

    // Añadir con addToSet
    const updatedList = await List.findByIdAndUpdate(
      listId,
      { $addToSet: { colaboradores: newCollaborator } },
      { new: true }
    ).populate('colaboradores.userId', 'username nombre email');

    res.json({ success: true, lista: updatedList });
  } catch (error) {
    console.error('Error al compartir lista:', error);
    res.status(500).json({ success: false, message: 'Error al invitar colaborador', error: error.message });
  }
});

// @desc    Quitar colaborador de una lista
// @route   DELETE /api/listas/:listId/share/:collaboratorUserId
// @access  Private (solo propietario)
router.delete('/:listId/share/:collaboratorUserId', protect, async (req, res) => {
  try {
    const { listId, collaboratorUserId } = req.params;

    // Buscar lista
    const lista = await List.findById(listId);
    if (!lista) {
      return res.status(404).json({ success: false, message: 'Lista no encontrada' });
    }

    // Verificar que el usuario sea el propietario de la lista
    if (lista.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'No autorizado para quitar colaboradores de esta lista' });
    }

    // Quitar el colaborador usando $pull
    const updatedList = await List.findByIdAndUpdate(
      listId,
      { $pull: { colaboradores: { userId: collaboratorUserId } } },
      { new: true }
    ).populate('colaboradores.userId', 'username nombre email');

    res.json({ success: true, lista: updatedList });
  } catch (error) {
    console.error('Error al quitar colaborador:', error);
    res.status(500).json({ success: false, message: 'Error al quitar colaborador', error: error.message });
  }
});

module.exports = router; 