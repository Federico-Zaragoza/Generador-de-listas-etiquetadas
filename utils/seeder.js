const bcrypt = require('bcrypt');
const { User, Tag, CustomView } = require('../models');

// Función para sembrar datos iniciales
const seedDatabase = async () => {
  try {
    console.log('Iniciando proceso de sembrado de datos...');
    
    // 1. Buscar o crear usuario administrador y actualizar su contraseña
    let adminUser = await User.findOne({
      $or: [
        { email: 'admin@example.com' },
        { username: 'admin' }
      ]
    });
    
    if (!adminUser) {
      console.log('Creando usuario administrador...');
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        nombre: 'Administrador',
        password: 'admin123', // el hook pre('save') lo hasheará
        role: 'admin',
        fecha_registro: new Date(),
        fecha_nacimiento: new Date('1990-01-01')
      });
      console.log('Usuario administrador creado exitosamente');
    } else {
      console.log('Usuario administrador encontrado, actualizando contraseña...');
      adminUser.password = 'admin123'; // el hook pre('save') lo hasheará
      await adminUser.save();
      console.log('Contraseña del administrador actualizada exitosamente');
    }
    
    // 2. Buscar o crear usuario común y actualizar su contraseña
    let regularUser = await User.findOne({
      $or: [
        { email: 'user@example.com' },
        { username: 'user' }
      ]
    });
    
    if (!regularUser) {
      console.log('Creando usuario común...');
      regularUser = await User.create({
        username: 'user',
        email: 'user@example.com',
        nombre: 'Usuario Común',
        password: 'user123', // el hook pre('save') lo hasheará
        role: 'user',
        fecha_registro: new Date(),
        fecha_nacimiento: new Date('1995-05-10')
      });
      console.log('Usuario común creado exitosamente');
    } else {
      console.log('Usuario común encontrado, actualizando contraseña...');
      regularUser.password = 'user123'; // el hook pre('save') lo hasheará
      await regularUser.save();
      console.log('Contraseña del usuario común actualizada exitosamente');
    }
    
    // 3. Sembrar etiquetas globales básicas
    const etiquetasGlobales = [
      { nombre: 'trabajo', color: '#ff5722' },
      { nombre: 'personal', color: '#2196f3' },
      { nombre: 'compras', color: '#4caf50' },
      { nombre: 'urgente', color: '#f44336' },
      { nombre: 'pendiente', color: '#ff9800' },
      { nombre: 'completado', color: '#8bc34a' }
    ];
    
    let etiquetasCreadas = 0;
    for (const etiqueta of etiquetasGlobales) {
      const etiquetaExiste = await Tag.findOne({
        nombre: etiqueta.nombre,
        userId: null
      });
      if (!etiquetaExiste) {
        await Tag.create({
          nombre: etiqueta.nombre,
          color: etiqueta.color,
          userId: null
        });
        etiquetasCreadas++;
      }
    }
    console.log(`${etiquetasCreadas} etiquetas globales creadas`);
    
    // 4. Sembrar vistas personalizadas predefinidas para el usuario común
    const userId = regularUser._id;
    const vistasPredefinidas = [
      { nombre: 'Pendientes primero', filtros: {}, ordenamientos: { estado: 'asc' } },
      { nombre: 'Urgentes',        filtros: { etiquetas: ['urgente'] }, ordenamientos: {} },
      { nombre: 'Recientes',       filtros: {}, ordenamientos: { createdAt: 'desc' } }
    ];
    
    let vistasCreadas = 0;
    for (const vista of vistasPredefinidas) {
      const vistaExiste = await CustomView.findOne({
        nombre: vista.nombre,
        userId
      });
      if (!vistaExiste) {
        await CustomView.create({
          userId,
          nombre: vista.nombre,
          filtros: vista.filtros,
          ordenamientos: vista.ordenamientos
        });
        vistasCreadas++;
      }
    }
    console.log(`${vistasCreadas} vistas predefinidas creadas para el usuario común`);
    
    console.log('Proceso de sembrado de datos completado exitosamente');
  } catch (error) {
    console.error('Error al sembrar datos:', error);
  }
};

module.exports = seedDatabase; 