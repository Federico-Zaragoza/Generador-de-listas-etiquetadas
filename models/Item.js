const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo', 'pendiente', 'completado'],
    default: 'pendiente'
  },
  etiquetas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  valoresCamposEspaciales: {
    type: Object,
    default: {}
  },
  imagenUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar la fecha de actualización al modificar
ItemSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model('Item', ItemSchema); 