const mongoose = require('mongoose');

const ItemEtiquetaSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  tagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etiqueta',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Asegurar que la relación ítem-etiqueta sea única
ItemEtiquetaSchema.index({ itemId: 1, tagId: 1 }, { unique: true });

module.exports = mongoose.model('ItemEtiqueta', ItemEtiquetaSchema); 