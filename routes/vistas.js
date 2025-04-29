const express = require('express');
const router = express.Router();
const { CustomView } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// @desc    Obtener todas las vistas del usuario
// @route   GET /api/vistas
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Buscar vistas del usuario autenticado
    const vistas = await CustomView.find({ userId: req.user._id });

    res.json({
      success: true,
      count: vistas.length,
      vistas
    });
  } catch (error) {
    console.error('Error al obtener vistas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener vistas',
      error: error.message
    });
  }
});

// @desc    Crear nueva vista
// @route   POST /api/vistas
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { nombre, filtros, ordenamientos } = req.body;

    // Verificar si ya existe una vista con ese nombre
    const vistaExistente = await CustomView.findOne({
      nombre,
      userId: req.user._id
    });

    if (vistaExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una vista con ese nombre'
      });
    }

    // Crear vista
    const vista = await CustomView.create({
      userId: req.user._id,
      nombre,
      filtros: filtros || {},
      ordenamientos: ordenamientos || {},
      ultimoUso: Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Vista creada correctamente',
      vista
    });
  } catch (error) {
    console.error('Error al crear vista:', error);
    
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      const message = messages[0] || 'Error de validación';
      return res.status(400).json({ success: false, message });
    }

    // Duplicate key
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ya existe una vista con ese nombre' });
    }
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al crear vista'
    });
  }
});

// @desc    Obtener vista específica
// @route   GET /api/vistas/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const vista = await CustomView.findById(req.params.id);

    if (!vista) {
      return res.status(404).json({
        success: false,
        message: 'Vista no encontrada'
      });
    }

    // Verificar propiedad
    if (vista.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver esta vista'
      });
    }

    // Actualizar fecha de último uso
    vista.ultimoUso = Date.now();
    await vista.save();

    res.json({
      success: true,
      vista
    });
  } catch (error) {
    console.error('Error al obtener vista:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de vista inválido' });
    }
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al obtener vista'
    });
  }
});

// @desc    Actualizar vista
// @route   PUT /api/vistas/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { nombre, filtros, ordenamientos, activa } = req.body;

    // Buscar vista
    let vista = await CustomView.findById(req.params.id);

    if (!vista) {
      return res.status(404).json({
        success: false,
        message: 'Vista no encontrada'
      });
    }

    // Verificar propiedad
    if (vista.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para modificar esta vista'
      });
    }

    // Si cambiamos el nombre, verificar que no exista otra vista con ese nombre
    if (nombre && nombre !== vista.nombre) {
      const vistaExistente = await CustomView.findOne({
        nombre,
        userId: req.user._id
      });

      if (vistaExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una vista con ese nombre'
        });
      }
    }

    // Actualizar vista
    const updateData = {
      ultimoUso: Date.now()
    };
    
    if (nombre) updateData.nombre = nombre;
    if (filtros) updateData.filtros = filtros;
    if (ordenamientos) updateData.ordenamientos = ordenamientos;
    if (activa !== undefined) updateData.activa = activa;

    vista = await CustomView.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Vista actualizada correctamente',
      vista
    });
  } catch (error) {
    console.error('Error al actualizar vista:', error);
    
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      const message = messages[0] || 'Error de validación';
      return res.status(400).json({ success: false, message });
    }

    // Invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de vista inválido' });
    }

    // Duplicate key
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ya existe una vista con ese nombre' });
    }
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al actualizar vista'
    });
  }
});

// @desc    Eliminar vista
// @route   DELETE /api/vistas/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    // Buscar vista
    const vista = await CustomView.findById(req.params.id);

    if (!vista) {
      return res.status(404).json({
        success: false,
        message: 'Vista no encontrada'
      });
    }

    // Verificar propiedad
    if (vista.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para eliminar esta vista'
      });
    }

    // Eliminar vista
    await CustomView.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vista eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar vista:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de vista inválido' });
    }
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al eliminar vista'
    });
  }
});

module.exports = router; 