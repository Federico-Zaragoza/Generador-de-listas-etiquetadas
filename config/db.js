const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/generador_listas');
    
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    // No finalizamos el proceso en caso de error para permitir el modo fallback
    // process.exit(1);
    return null;
  }
};

module.exports = connectDB; 