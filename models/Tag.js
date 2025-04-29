const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  color: {
    type: String,
    default: '#007bff'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Asegurar que el nombre de la etiqueta sea único por usuario
TagSchema.index({ nombre: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Tag', TagSchema); 