# Generador de Listas Etiquetadas

Aplicación web para crear y gestionar listas de elementos con etiquetas y estados personalizados.

## Descripción

El proyecto "Generador de listas etiquetadas" permite a los usuarios crear y gestionar listas de elementos (ítems). Cada ítem dentro de una lista puede ser etiquetado con una o varias etiquetas y tener un estado (activo, inactivo o pendiente). Los usuarios pueden filtrar sus listas para visualizar únicamente los ítems que cumplan con criterios específicos de etiquetas y estados.

## Características

- **Autenticación y Autorización:**
  - Registro e inicio de sesión de usuarios
  - Autenticación mediante JWT
  - Roles de usuario (administrador y usuario común)
  - Gestión de perfiles y contraseñas

- **Gestión de Listas:**
  - Crear, ver, editar y eliminar listas
  - Marcar listas como favoritas o archivarlas
  - Campos personalizados para cada lista
  - Filtrado y búsqueda de listas

- **Gestión de Ítems:**
  - Crear, ver, editar y eliminar ítems dentro de listas
  - Asignar etiquetas y estados a los ítems
  - Filtrar ítems por etiquetas o estado
  - Subir imágenes para los ítems

- **Sistema de Etiquetas:**
  - Gestión centralizada de etiquetas
  - Personalización de colores para etiquetas
  - Estadísticas de uso de etiquetas
  - Etiquetas globales y personales

- **Vistas Personalizadas:**
  - Guardar filtros y ordenamientos favoritos
  - Aplicar vistas personalizadas a las listas
  - Vista previa en tiempo real de filtros

- **Panel de Administración:**
  - Gestión de usuarios (solo administradores)
  - Ver, eliminar usuarios y cambiar roles

## Tecnologías utilizadas

- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend:** Node.js, Express
- **Base de datos:** MongoDB
- **Autenticación:** JWT (JSON Web Tokens)
- **Seguridad:** Bcrypt para hasheo de contraseñas

## Instalación

1. Clona este repositorio:
   ```
   git clone https://github.com/tu-usuario/generador-de-listas-etiquetadas.git
   cd generador-de-listas-etiquetadas
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura las variables de entorno:
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/generador_listas
   JWT_SECRET=tu_clave_secreta
   JWT_EXPIRE=7d
   PORT=3000
   ```

4. Inicia el servidor:
   ```
   npm start
   ```
   
   O para desarrollo con recarga automática:
   ```
   npm run dev
   ```

5. Abre en tu navegador:
   ```
   http://localhost:3000
   ```

## Uso

### Credenciales predeterminadas

Al iniciar la aplicación por primera vez, se crean automáticamente los siguientes usuarios:

- **Usuario administrador:**
  - Email: admin@example.com
  - Contraseña: admin123

- **Usuario regular:**
  - Email: user@example.com
  - Contraseña: user123

### Flujo básico

1. Inicia sesión o regístrate como nuevo usuario
2. En el dashboard, crea una nueva lista con el botón "Nueva Lista"
3. Accede a una lista para ver su detalle
4. Agrega nuevos ítems a la lista
5. Asigna etiquetas y estados a los ítems
6. Filtra ítems por etiquetas o estado
7. Guarda tus filtros como vistas personalizadas
8. Marca listas como favoritas o archívalas

## Estructura del proyecto

```
generador-de-listas-etiquetadas/
├── config/               # Configuración (base de datos)
├── middleware/           # Middlewares (autenticación)
├── models/               # Modelos de MongoDB
├── routes/               # Rutas de la API
├── src/                  # Frontend
│   ├── components/       # Componentes reutilizables
│   ├── js/               # Archivos JavaScript
│   ├── css/              # Hojas de estilo CSS
│   └── *.html            # Páginas HTML
├── utils/                # Utilidades (JWT, sembrado de datos)
├── .env                  # Variables de entorno
├── server.js             # Servidor Express
├── package.json          # Dependencias del proyecto
└── README.md             # Documentación
```

## Modos de funcionamiento

La aplicación puede funcionar en dos modos:

1. **Modo completo con MongoDB:** Utiliza MongoDB para persistencia de datos. Recomendado para producción.

2. **Modo simulado:** Si no se puede conectar a MongoDB, la aplicación funciona en modo simulado con datos en memoria. Útil para pruebas o desarrollo sin MongoDB.

## Equipo de desarrollo

- Federico Humberto Zaragoza Manuel
- Luis Eduardo González Gloria
- Diego Mercado Coello

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
