const express = require('express');
const router = express.Router();
const { Tag } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @desc    Obtener estadísticas de uso de etiquetas
// @route   GET /api/etiquetas/estadisticas
// @access  Private
router.get('/estadisticas', protect, async (req, res) => {
  try {
    // Obtener todas las etiquetas del usuario y globales
    const etiquetas = await Tag.find({
      $or: [
        { userId: null },
        { userId: req.user._id }
      ]
    }).sort('-contador_uso');

    // Preparar datos de estadísticas
    const estadisticas = etiquetas.map(etiqueta => ({
      id: etiqueta._id,
      nombre: etiqueta.nombre,
      contador_uso: etiqueta.contador_uso,
      color: etiqueta.color,
      esGlobal: etiqueta.userId === null
    }));

    res.json({
      success: true,
      estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de etiquetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de etiquetas',
      error: error.message
    });
  }
});

// @desc    Obtener todas las etiquetas (globales y del usuario)
// @route   GET /api/etiquetas
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Buscar etiquetas globales y del usuario
    const etiquetas = await Tag.find({
      $or: [
        { userId: null },
        { userId: req.user._id }
      ]
    });

    res.json({
      success: true,
      count: etiquetas.length,
      etiquetas
    });
  } catch (error) {
    console.error('Error al obtener etiquetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener etiquetas',
      error: error.message
    });
  }
});

// @desc    Crear nueva etiqueta
// @route   POST /api/etiquetas
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { nombre, color } = req.body;

    // Verificar si ya existe la etiqueta
    const etiquetaExistente = await Tag.findOne({
      nombre,
      $or: [
        { userId: req.user._id },
        { userId: null }
      ]
    });

    if (etiquetaExistente) {
      return res.status(400).json({
        success: false,
        message: 'La etiqueta ya existe'
      });
    }

    // Crear etiqueta
    const etiqueta = await Tag.create({
      nombre,
      userId: req.user._id,
      color: color || '#007bff'
    });

    res.status(201).json({
      success: true,
      message: 'Etiqueta creada correctamente',
      etiqueta
    });
  } catch (error) {
    console.error('Error al crear etiqueta:', error);
    
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      const message = messages[0] || 'Error de validación';
      return res.status(400).json({ success: false, message });
    }

    // Duplicate key
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'La etiqueta ya existe' });
    }
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al crear etiqueta'
    });
  }
});

// @desc    Actualizar etiqueta
// @route   PUT /api/etiquetas/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { nombre, color } = req.body;

    // Buscar etiqueta
    let etiqueta = await Tag.findById(req.params.id);

    if (!etiqueta) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
    }

    // Verificar propiedad o si es global y el usuario es admin
    if (
      (etiqueta.userId && etiqueta.userId.toString() !== req.user._id.toString()) &&
      !(etiqueta.userId === null && req.user.role === 'admin')
    ) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para modificar esta etiqueta'
      });
    }

    // Si cambiamos el nombre, verificar que no exista otra etiqueta con ese nombre
    if (nombre && nombre !== etiqueta.nombre) {
      const etiquetaExistente = await Tag.findOne({
        nombre,
        $or: [
          { userId: req.user._id },
          { userId: null }
        ]
      });

      if (etiquetaExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una etiqueta con ese nombre'
        });
      }
    }

    // Actualizar etiqueta
    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (color) updateData.color = color;

    etiqueta = await Tag.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Etiqueta actualizada correctamente',
      etiqueta
    });
  } catch (error) {
    console.error('Error al actualizar etiqueta:', error);
    
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      const message = messages[0] || 'Error de validación';
      return res.status(400).json({ success: false, message });
    }

    // Invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de etiqueta inválido' });
    }

    // Duplicate key
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ya existe una etiqueta con ese nombre' });
    }
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al actualizar etiqueta'
    });
  }
});

// @desc    Eliminar etiqueta
// @route   DELETE /api/etiquetas/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    // Buscar etiqueta
    const etiqueta = await Tag.findById(req.params.id);

    if (!etiqueta) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
    }

    // Verificar propiedad o si es global y el usuario es admin
    if (
      (etiqueta.userId && etiqueta.userId.toString() !== req.user._id.toString()) &&
      !(etiqueta.userId === null && req.user.role === 'admin')
    ) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para eliminar esta etiqueta'
      });
    }

    // Eliminar etiqueta
    await Tag.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Etiqueta eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar etiqueta:', error);
    
    // Invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de etiqueta inválido' });
    }
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al eliminar etiqueta'
    });
  }
});

module.exports = router; 