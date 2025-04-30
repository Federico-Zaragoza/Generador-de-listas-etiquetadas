const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedDatabase = require('./utils/seeder');

// Cargar variables de entorno SOLO si no estamos en producción
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para análisis de JSON y datos de formulario
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Montar rutas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/listas', require('./routes/listas'));
app.use('/api/items', require('./routes/items'));
app.use('/api/etiquetas', require('./routes/etiquetas'));
app.use('/api/vistas', require('./routes/vistas'));

// Servir archivos estáticos desde la carpeta 'src'
app.use(express.static(path.join(__dirname, 'src')));

// Siempre servir index.html para rutas no-API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || 'Error interno del servidor' });
});

// Iniciar servidor solo después de conectar a MongoDB
const startServer = async () => {
  try {
    const conn = await connectDB();
    console.log(`MongoDB conectado: ${conn.connection.host}`);

    if (process.env.NODE_ENV !== 'production') {
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en ${process.env.NODE_ENV || 'development'} mode en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('ERROR FATAL AL INICIAR SERVIDOR:', error);
    process.exit(1);
  }
};

startServer(); 