const mongoose = require('mongoose');

const CustomViewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  filtros: {
    type: Object,
    default: {}
  },
  ordenamientos: {
    type: Object,
    default: {}
  },
  ultimoUso: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Asegurar que el nombre de la vista sea único por usuario
CustomViewSchema.index({ nombre: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('CustomView', CustomViewSchema); 