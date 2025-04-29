const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Por favor ingrese un nombre de usuario'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Por favor ingrese un correo electrónico'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingrese un correo electrónico válido'
    ]
  },
  nombre: {
    type: String,
    required: [true, 'Por favor ingrese su nombre completo']
  },
  password: {
    type: String,
    required: [true, 'Por favor ingrese una contraseña'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  },
  fecha_nacimiento: {
    type: Date
  },
  listasFavoritas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  }],
  listasArchivadas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encriptar contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  console.log('Pre-save hook triggered');
  console.log('Password modified:', this.isModified('password'));
  
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hashing');
    return next();
  }
  
  console.log('Hashing new password...');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('Password hashed successfully');
  next();
});

// Método para comparar contraseñas
UserSchema.methods.matchPassword = async function(enteredPassword) {
  console.log('Comparing passwords...');
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  console.log('Passwords match:', isMatch);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema); 