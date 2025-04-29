const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  camposEspaciales: {
    type: [{
      nombre: { type: String, required: true },
      tipo: { 
        type: String, 
        required: true, 
        enum: ['texto', 'numero', 'fecha', 'booleano'] 
      },
      requerido: { type: Boolean, default: false }
    }],
    default: []
  },
  colaboradores: {
    type: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      permiso: { type: String, enum: ['ver', 'editar'], default: 'ver', required: true }
    }],
    default: []
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
ListSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model('List', ListSchema); 