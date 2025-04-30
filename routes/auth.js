const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { protect } = require('../middleware/auth');

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    // Map front-end field names to model fields
    const { username, email, password, fullName: nombre, birthDate: fecha_nacimiento } = req.body;
    // Log data received (without full password)
    console.log('Register attempt:', { 
      username, 
      email, 
      password_length: password?.length, 
      nombre, 
      fecha_nacimiento,
      fecha_nacimiento_type: fecha_nacimiento ? typeof fecha_nacimiento : 'undefined'
    });

    // Validaciones explícitas
    if (!username || !email || !password || !nombre) {
      console.log('Missing required fields:', { 
        username: !!username, 
        email: !!email, 
        password: !!password, 
        nombre: !!nombre 
      });
      return res.status(400).json({
        success: false,
        message: 'Todos los campos requeridos deben ser proporcionados'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    console.log('Checking if user exists...');
    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    console.log('User exists check result:', userExists);

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El usuario o correo ya existe'
      });
    }

    // Preparar el objeto para crear el usuario
    const userData = {
      username,
      email,
      password,
      nombre,
      fecha_registro: Date.now()
    };
    
    // Añadir fecha_nacimiento solo si es válida
    if (fecha_nacimiento) {
      try {
        const fecha = new Date(fecha_nacimiento);
        if (!isNaN(fecha.getTime())) { // Verificar que sea una fecha válida
          userData.fecha_nacimiento = fecha;
        } else {
          console.log('Invalid birth date format, ignoring');
        }
      } catch (error) {
        console.log('Error processing birth date, ignoring:', error.message);
      }
    }

    console.log('Attempting to create user in DB with data:', {
      ...userData,
      password: '[REDACTED]'
    });
    
    // Crear el usuario
    const user = await User.create(userData);
    
    if (!user) {
      console.log('User.create returned null/undefined');
      return res.status(500).json({
        success: false,
        message: 'Error al crear el usuario en la base de datos'
      });
    }
    
    console.log('User created in DB:', {
      _id: user._id,
      username: user.username,
      email: user.email,
      nombre: user.nombre,
      role: user.role
    });

    console.log('Generating token...');
    // Generar token
    const token = generateToken(user._id);

    console.log('Sending success response to client...');
    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('FATAL ERROR during registration:', error);
    
    // Mensajes específicos según el tipo de error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      console.error('Validation error details:', messages);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Error de validación',
        errors: messages
      });
    }
    
    // Error de clave duplicada (mongoose)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      console.error('Duplicate key error:', field);
      return res.status(400).json({
        success: false,
        message: `El campo ${field} ya está en uso`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
});

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt with email:', req.body.email);
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('Authentication failed: User not found');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    console.log('Verifying password...');
    // Verificar si la contraseña coincide
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Authentication failed: Password does not match');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    console.log('Authentication successful, generating token');
    // Generar token
    const token = generateToken(user._id);

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
});

// @desc    Obtener perfil de usuario
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
        fecha_registro: user.fecha_registro,
        fecha_nacimiento: user.fecha_nacimiento
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil de usuario',
      error: error.message
    });
  }
});

// @desc    Actualizar datos de perfil de usuario
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, nombre, fecha_nacimiento, email } = req.body;

    // Validar entrada
    if (!username || !nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario y nombre son requeridos'
      });
    }

    // Validar email si se está actualizando
    if (email && email !== req.user.email) {
      // Verificar si el email ya está en uso por otro usuario
      const existingUser = await User.findOne({ 
        email: email, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso por otro usuario'
        });
      }
    }

    // Preparar datos a actualizar
    const updateData = { 
      username, 
      nombre,
      email,
      fecha_nacimiento
    };

    // Actualizar usuario
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    // Respuesta
    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
        fecha_registro: user.fecha_registro,
        fecha_nacimiento: user.fecha_nacimiento,
        listasFavoritas: user.listasFavoritas,
        listasArchivadas: user.listasArchivadas
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    
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

    // Duplicate key (username o email ya existen)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue).join(', ');
      const message = `El ${field} ya está en uso`;
      return res.status(400).json({ success: false, message });
    }
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al actualizar perfil'
    });
  }
});

// @desc    Cambiar contraseña
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Obtener usuario con contraseña
    const user = await User.findById(req.user._id).select('+password');

    // Verificar contraseña actual
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
});

// @desc    Actualizar contraseña (ruta alternativa)
// @route   PUT /api/auth/updatepassword
// @access  Private
router.put('/updatepassword', protect, async (req, res) => {
  try {
    console.log('Password update attempt for user ID:', req.user._id);
    const { currentPassword, newPassword } = req.body;
    console.log('Current password provided:', !!currentPassword);
    console.log('New password provided:', !!newPassword);

    if (!currentPassword || !newPassword) {
      console.log('Missing password data');
      return res.status(400).json({
        success: false,
        message: 'Se requieren contraseña actual y nueva contraseña'
      });
    }

    // Obtener usuario con la contraseña
    const user = await User.findById(req.user._id).select('+password');
    console.log('User found with password:', !!user);

    // Verificar si la contraseña actual es correcta
    console.log('Verifying current password...');
    const isMatch = await user.matchPassword(currentPassword);
    console.log('Current password match:', isMatch);

    if (!isMatch) {
      console.log('Current password verification failed');
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar la contraseña
    console.log('Setting new password...');
    user.password = newPassword;
    console.log('Saving user with new password...');
    await user.save(); // El hook pre('save') hasheará la nueva contraseña
    console.log('Password update successful');

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar contraseña',
      error: error.message
    });
  }
});

// @desc    Actualizar contraseña del usuario
// @route   PUT /api/auth/update-password
// @access  Private
router.put('/update-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verificar datos de entrada
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Por favor proporciona la contraseña actual y la nueva' 
      });
    }

    // Verifica longitud de contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Obtener usuario
    const user = await User.findById(req.user._id).select('+password');

    // Verificar que la contraseña actual sea correcta
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    // En lugar de findByIdAndUpdate, usamos save() para activar el middleware de hash

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    
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
    
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Error al actualizar contraseña'
    });
  }
});

module.exports = router; 