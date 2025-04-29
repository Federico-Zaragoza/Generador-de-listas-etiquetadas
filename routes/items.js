const express = require('express');
const router = express.Router();
const { Item, List, Tag } = require('../models');
const { protect, authorize, checkListAccess } = require('../middleware/auth');

// @desc    Filtrar ítems por etiquetas y estado
// @route   GET /api/items/filtrar
// @access  Private
router.get('/filtrar', protect, async (req, res) => {
  try {
    const { 
      listId, 
      etiquetas, 
      estado, 
      etiqueta_logica,
      sortField, 
      sortDir 
    } = req.query;

    if (!listId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID de la lista'
      });
    }

    // Verificar acceso a la lista
    let lista;
    try {
      lista = await checkListAccess(listId, req.user, 'ver');
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      throw error;
    }

    // Construir filtros
    const filtros = { listId };
    
    if (estado && estado !== 'todos') {
      filtros.estado = estado;
    }
    
    // Filtrar por etiquetas
    if (etiquetas) {
      const etiquetasArray = etiquetas.split(',');
      
      // Aplicar lógica de filtrado por etiquetas (AND o OR)
      if (etiqueta_logica === 'all') {
        // Lógica AND: debe tener TODAS las etiquetas seleccionadas
        filtros.etiquetas = { $all: etiquetasArray };
      } else {
        // Lógica OR (por defecto): puede tener CUALQUIERA de las etiquetas
        filtros.etiquetas = { $in: etiquetasArray };
      }
    }

    // Configurar opciones de ordenamiento
    const opcionesOrdenamiento = {};
    
    if (sortField) {
      // Determinar dirección del ordenamiento (1 para ascendente, -1 para descendente)
      const direccion = sortDir === 'desc' ? -1 : 1;
      opcionesOrdenamiento[sortField] = direccion;
    } else {
      // Ordenamiento por defecto
      opcionesOrdenamiento.createdAt = 1;
    }

    // Buscar ítems que coincidan con los filtros, aplicando ordenamiento
    const items = await Item.find(filtros)
      .populate('etiquetas')
      .sort(opcionesOrdenamiento);

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    console.error('Error al filtrar ítems:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID de lista inválido' });
    }
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al filtrar ítems'
    });
  }
});

// @desc    Crear nuevo ítem
// @route   POST /api/items
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { listId, title, description, estado, etiquetas, imagenUrl, valoresCamposEspaciales } = req.body;

    // Verificar acceso a la lista
    let lista;
    try {
      lista = await checkListAccess(listId, req.user, 'editar');
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      throw error;
    }

    // Crear el ítem con array de ObjectId para etiquetas
    const itemData = {
      listId,
      title,
      description,
      estado: estado || 'pendiente',
      etiquetas: Array.isArray(etiquetas) ? etiquetas : [],
      imagenUrl,
      valoresCamposEspaciales: valoresCamposEspaciales || {}
    };
    const item = await Item.create(itemData);

    res.status(201).json({
      success: true,
      message: 'Ítem creado correctamente',
      item
    });
  } catch (error) {
    console.error('Error al crear ítem:', error);
    
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

    // Cualquier otro error
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, message: error.message || 'Error al crear ítem' });
  }
});

// @desc    Obtener ítem específico
// @route   GET /api/items/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('etiquetas');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Ítem no encontrado'
      });
    }

    // Verificar acceso a la lista
    let lista;
    try {
      lista = await checkListAccess(item.listId, req.user, 'ver');
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      throw error;
    }

    res.json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Error al obtener ítem:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al obtener ítem'
    });
  }
});

// @desc    Actualizar ítem
// @route   PUT /api/items/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, estado, etiquetas, imagenUrl, valoresCamposEspaciales } = req.body;

    // Buscar ítem
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Ítem no encontrado'
      });
    }

    // Verificar acceso a la lista
    let lista;
    try {
      lista = await checkListAccess(item.listId, req.user, 'editar');
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      throw error;
    }

    // Preparar datos de actualización
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (estado) updateData.estado = estado;
    if (imagenUrl !== undefined) updateData.imagenUrl = imagenUrl;
    if (valoresCamposEspaciales !== undefined) updateData.valoresCamposEspaciales = valoresCamposEspaciales;

    // Actualizar etiquetas si se proporcionan (array de ObjectId)
    if (etiquetas) {
      updateData.etiquetas = Array.isArray(etiquetas) ? etiquetas : [];
    }

    // Actualizar ítem
    item = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Ítem actualizado correctamente',
      item
    });
  } catch (error) {
    console.error('Error al actualizar ítem:', error);
    
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
      message: error.message || 'Error al actualizar ítem'
    });
  }
});

// @desc    Eliminar ítem
// @route   DELETE /api/items/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    // Buscar ítem
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Ítem no encontrado'
      });
    }

    // Verificar acceso a la lista
    let lista;
    try {
      lista = await checkListAccess(item.listId, req.user, 'editar');
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      throw error;
    }

    // No hay relaciones externas a eliminar (array necesita solo ser removido con el item)

    // Eliminar ítem
    await Item.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Ítem eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar ítem:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al eliminar ítem'
    });
  }
});

module.exports = router; 