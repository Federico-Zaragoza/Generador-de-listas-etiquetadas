const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const seedDatabase = require('./utils/seeder');

// Cargar variables de entorno SOLO si no estamos en producción
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para análisis de JSON y datos de formulario
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Conectar a MongoDB
connectDB()
  .then(() => {
    // Sembrar datos iniciales (sin condición)
    seedDatabase();
  })
  .catch(err => {
    console.log('Error al conectar a MongoDB. Usando modo sin persistencia.');
    console.error(err);
  });

// Importar rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const listasRoutes = require('./routes/listas');
const itemsRoutes = require('./routes/items');
const etiquetasRoutes = require('./routes/etiquetas');
const vistasRoutes = require('./routes/vistas');

// Montar rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/listas', listasRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/etiquetas', etiquetasRoutes);
app.use('/api/vistas', vistasRoutes);

// Servir archivos estáticos desde la carpeta 'src'
app.use(express.static(path.join(__dirname, 'src')));

// Modo de fallback para funcionar sin base de datos
// Definir datos simulados solo si no hay conexión a MongoDB

// Variables para almacenar datos simulados (solo se usan si no hay MongoDB)
let mongoConnected = false;

// Verificar estado de conexión después de 3 segundos
setTimeout(() => {
  mongoConnected = mongoose && mongoose.connection && mongoose.connection.readyState === 1;
  if (!mongoConnected) {
    console.log('Usando datos simulados debido a falta de conexión MongoDB');
    setupFallbackApi();
  } else {
    console.log('Usando MongoDB para persistencia de datos');
  }
}, 3000);

// Configurar API simulada como fallback
function setupFallbackApi() {
  // Datos simulados
  const users = [
    { 
      id: 1, 
      username: 'admin', 
      email: 'admin@example.com', 
      nombre: 'Administrador', 
      password: 'admin123', 
      role: 'admin',
      fecha_registro: '2024-01-01',
      fecha_nacimiento: '1990-01-01'
    },
    { 
      id: 2, 
      username: 'user', 
      email: 'user@example.com', 
      nombre: 'Usuario Común', 
      password: 'user123', 
      role: 'user',
      fecha_registro: '2024-01-15',
      fecha_nacimiento: '1995-05-10'
    }
  ];

  const listas = [
    {
      id: 1,
      userId: 2,
      title: 'Lista de Compras',
      description: 'Lista para el supermercado',
      createdAt: '2024-05-01T10:00:00Z',
      updatedAt: '2024-05-05T15:30:00Z'
    },
    {
      id: 2,
      userId: 2,
      title: 'Tareas Pendientes',
      description: 'Cosas por hacer esta semana',
      createdAt: '2024-05-02T14:20:00Z',
      updatedAt: '2024-05-04T09:15:00Z'
    }
  ];

  const items = [
    {
      id: 1,
      listId: 1,
      title: 'Leche',
      description: 'Comprar leche deslactosada',
      estado: 'pendiente',
      etiquetas: ['compras', 'alimentos'],
      createdAt: '2024-05-01T10:30:00Z',
      updatedAt: '2024-05-05T15:30:00Z'
    },
    {
      id: 2,
      listId: 1,
      title: 'Pan',
      description: 'Pan integral',
      estado: 'pendiente',
      etiquetas: ['compras', 'alimentos'],
      createdAt: '2024-05-01T10:35:00Z',
      updatedAt: '2024-05-01T10:35:00Z'
    },
    {
      id: 3,
      listId: 2,
      title: 'Llamar al dentista',
      description: 'Agendar cita para revisión',
      estado: 'pendiente',
      etiquetas: ['salud', 'urgente'],
      createdAt: '2024-05-02T14:25:00Z',
      updatedAt: '2024-05-02T14:25:00Z'
    }
  ];

  const etiquetas = [
    { id: 1, nombre: 'trabajo', userId: null, color: '#ff5722' },
    { id: 2, nombre: 'personal', userId: null, color: '#2196f3' },
    { id: 3, nombre: 'compras', userId: null, color: '#4caf50' },
    { id: 4, nombre: 'salud', userId: 2, color: '#9c27b0' },
    { id: 5, nombre: 'urgente', userId: 2, color: '#f44336' },
    { id: 6, nombre: 'alimentos', userId: 2, color: '#8bc34a' }
  ];

  // Rutas de fallback
  
  // Login simulado
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nombre: user.nombre,
          role: user.role
        },
        token: 'jwt-token-simulado'
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }
  });

  // Registro simulado
  app.post('/api/auth/register', (req, res) => {
    const { username, email, password, nombre, fecha_nacimiento } = req.body;
    
    if (users.some(u => u.email === email || u.username === username)) {
      return res.status(400).json({ 
        success: false, 
        message: 'El usuario o correo ya existe' 
      });
    }
    
    const newUser = {
      id: users.length + 1,
      username,
      email,
      nombre,
      password,
      role: 'user',
      fecha_registro: new Date().toISOString().split('T')[0],
      fecha_nacimiento
    };
    
    users.push(newUser);
    
    res.status(201).json({ 
      success: true, 
      message: 'Usuario registrado correctamente',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        nombre: newUser.nombre,
        role: newUser.role
      }
    });
  });

  // Obtener listas del usuario
  app.get('/api/listas', (req, res) => {
    const userId = parseInt(req.query.userId) || 2;
    const listasUsuario = listas.filter(lista => lista.userId === userId);
    
    res.json({ 
      success: true, 
      listas: listasUsuario 
    });
  });

  // Obtener detalle de lista
  app.get('/api/listas/:id', (req, res) => {
    const listaId = parseInt(req.params.id);
    const lista = listas.find(l => l.id === listaId);
    
    if (!lista) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lista no encontrada' 
      });
    }
    
    const itemsLista = items.filter(item => item.listId === listaId);
    
    res.json({ 
      success: true, 
      lista, 
      items: itemsLista 
    });
  });

  // Crear lista
  app.post('/api/listas', (req, res) => {
    const { title, description, userId } = req.body;
    
    const newLista = {
      id: listas.length + 1,
      userId: userId || 2,
      title,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    listas.push(newLista);
    
    res.status(201).json({ 
      success: true, 
      message: 'Lista creada correctamente',
      lista: newLista
    });
  });

  // Obtener etiquetas
  app.get('/api/etiquetas', (req, res) => {
    const userId = parseInt(req.query.userId) || 2;
    const etiquetasDisponibles = etiquetas.filter(e => e.userId === null || e.userId === userId);
    
    res.json({ 
      success: true, 
      etiquetas: etiquetasDisponibles 
    });
  });

  // Crear etiqueta
  app.post('/api/etiquetas', (req, res) => {
    const { nombre, userId, color } = req.body;
    
    const newEtiqueta = {
      id: etiquetas.length + 1,
      nombre,
      userId: userId || null,
      color: color || '#007bff'
    };
    
    etiquetas.push(newEtiqueta);
    
    res.status(201).json({ 
      success: true, 
      message: 'Etiqueta creada correctamente',
      etiqueta: newEtiqueta
    });
  });

  // Filtrar items
  app.get('/api/items/filtrar', (req, res) => {
    const { listId, etiquetas: etqStr, estado } = req.query;
    
    if (!listId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID de la lista'
      });
    }
    
    const listIdNum = parseInt(listId);
    let filteredItems = items.filter(item => item.listId === listIdNum);
    
    if (estado) {
      filteredItems = filteredItems.filter(item => item.estado === estado);
    }
    
    if (etqStr) {
      const etqArray = etqStr.split(',');
      filteredItems = filteredItems.filter(item => 
        item.etiquetas.some(etq => etqArray.includes(etq))
      );
    }
    
    res.json({
      success: true,
      count: filteredItems.length,
      items: filteredItems
    });
  });

  // Usuarios (admin)
  app.get('/api/users', (req, res) => {
    const usersData = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      nombre: user.nombre,
      role: user.role,
      fecha_registro: user.fecha_registro
    }));
    
    res.json({ 
      success: true, 
      users: usersData 
    });
  });
}

// Manejar cualquier otra solicitud sirviendo index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error en middleware global:', err);
  
  // Determinar el código de estado y mensaje apropiados
  const statusCode = err.statusCode || 500;
  
  // Enviar respuesta JSON al cliente sin exponer detalles internos del error
  res.status(statusCode).json({ 
    success: false, 
    message: err.message || 'Error interno del servidor' 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
}); 