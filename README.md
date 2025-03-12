# Generador-de-listas-etiquetadas
Proyecto de Desarrollo de aplicaiones y servicios WEB

*Objetivo del proyecto*
    El proyecto consiste en desarrollar una aplicación web, denominada "Generador de listas etiquetadas", que permite a los usuarios crear y gestionar listas de elementos (ítems). Cada ítem dentro de una lista puede ser etiquetado con una o varias etiquetas y tener un estado (activo, inactivo o pendiente). Los usuarios podrán filtrar sus listas para visualizar únicamente los ítems que cumplan con criterios específicos de etiquetas y estados. Adicionalmente, la aplicación permitirá agregar campos espaciales personalizados por lista y generar vistas personalizadas con filtros y ordenamientos para una gestión más eficiente de la información.
    El objetivo principal es proporcionar una herramienta flexible y personalizable para la organización de información a través de listas, facilitando la categorización y el seguimiento de elementos mediante etiquetas y estados.

*Entidades que se guardaran en la base de datos*
    * **Usuarios:**
    * `username` (string): Nombre de usuario único. Ejemplo: `juanp`.
    * `email` (string): Correo electrónico único. Ejemplo: `juanp@gmail.com`.
    * `nombre` (string): Nombre completo del usuario. Ejemplo: `Juan Pérez López`.
    * `password` (string, hash): Contraseña del usuario (almacenada de forma segura con hash).
    * `fecha_registro` (string, fecha año-mes-día): Fecha en que el usuario se registró.
    * `fecha_nacimiento` (string, fecha año-mes-día): Fecha de nacimiento del usuario.
    * `listasFavoritas` (Array de ObjectId, referencia a Listas): Listas marcadas como favoritas por el usuario.
    * `listasArchivadas` (Array de ObjectId, referencia a Listas): Listas archivadas por el usuario.
    * `createdAt` (Date): Fecha de creación del usuario.
    * **Listas:**
    * `userId` (ObjectId, referencia a Usuario): Identificador del usuario que creó la lista.
    * `title` (String): Título de la lista. Ejemplo: `Tareas Pendientes`.
    * `description` (String): Descripción opcional de la lista.
    * `camposEspaciales` (Objeto):  Campos personalizados definidos para la lista.
    * `createdAt` (Date): Fecha de creación de la lista.
    * `updatedAt` (Date): Fecha de última modificación de la lista.
    * **Ítems:**
    * `listId` (ObjectId, referencia a Lista): Identificador de la lista a la que pertenece el ítem.
    * `title` (String): Título del ítem. Ejemplo: `Comprar leche`.
    * `description` (String): Descripción detallada del ítem.
    * `estado` (String, enum: ['activo', 'inactivo', 'pendiente']): Estado actual del ítem.
    * `etiquetas` (Array de Strings):  Lista de etiquetas asignadas al ítem. Ejemplo: `['compras', 'urgente']`.
    * `imagenUrl` (String): URL de una imagen asociada al ítem (opcional).
    * `createdAt` (Date): Fecha de creación del ítem.
    * `updatedAt` (Date): Fecha de última modificación del ítem.
    * **Etiquetas:**
    * `nombre` (String, único por usuario): Nombre de la etiqueta. Ejemplo: `trabajo`.
    * `userId` (ObjectId, referencia a Usuario): Usuario que creó la etiqueta (para etiquetas personalizadas).
    * **Relaciones Ítem-Etiquetas:**
    * `itemId` (ObjectId, referencia a Ítem): Identificador del ítem.
    * `tagId` (ObjectId, referencia a Etiqueta): Identificador de la etiqueta.
    * **Vistas Personalizadas:**
    * `userId` (ObjectId, referencia a Usuario): Usuario que guardó la vista personalizada.
    * `nombre` (String): Nombre de la vista personalizada.
    * `filtros` (Objeto): Criterios de filtrado guardados (ej., por etiquetas, estados).
    * `ordenamientos` (Objeto):  Criterios de ordenamiento guardados (ej., por fecha de creación, título).

*Tipos de usuario que hay en la aplicacion*
    * **Administrador:**  Usuario con permisos para gestionar todos los aspectos de la aplicación, incluyendo la gestión de usuarios, la configuración general y la supervisión del sistema.
    * **Usuario Común (Cliente/Profesor/Estudiante):** Usuario regular que puede crear y gestionar sus propias listas, ítems y etiquetas.  En un contexto educativo, podrían diferenciarse roles como Profesor y Estudiante con permisos específicos, aunque inicialmente se considera un usuario común genérico.

*Personas encargadas de cada actividad*
    * *Alumno 1 (Federico Humberto Zaragoza Manuel):*  Responsable del módulo de **Administración de Usuarios** y la implementación de las funcionalidades de **Usuarios y Ventas** (en un contexto extendido).  También del diseño e implementación del menú de navegación y la página principal.
    * 
    * *Alumno 2 (Luis Eduardo González Gloria):*  Responsable del módulo de **Administración de Productos** (en un contexto extendido) y la implementación del **Registro y Detalle de Usuarios**.
    * 
    * *Alumno 3 (Diego Mercado Coello):* Responsable del módulo de **Cliente/Usuario Común**, incluyendo el **Carrito de Compra**, **Historial de Compras**, y la gestión de imágenes en la base de datos. También de la **Consulta de Productos en Venta** y el **Detalle de Productos en Venta**, así como el **Carrito de Compra** y el **Historial de Compras**.

*Flujo de la informacion*
    El flujo de información desde la perspectiva de cada tipo de usuario (producto mínimo viable) se describe a continuación:
    **Usuario Común:**
    1. **Login:** El usuario introduce sus credenciales para acceder a la aplicación.
    2. **Visualización de Listas:** Tras el login, el usuario visualiza un listado de sus listas creadas.
    3. **Creación de Lista:** El usuario puede crear nuevas listas, definiendo título y descripción.
    4. **Visualización de Ítems en Lista:** Al seleccionar una lista, el usuario accede a la vista detallada de la lista, que muestra los ítems asociados.
    5. **Creación de Ítem:** Dentro de una lista, el usuario puede crear nuevos ítems, asignándoles título, descripción, estado y etiquetas.
    6. **Edición y Eliminación de Ítems:** El usuario puede modificar o eliminar ítems existentes en una lista.
    7. **Filtrado y Ordenamiento de Ítems:** El usuario puede aplicar filtros por etiquetas y estados, y ordenar los ítems dentro de la lista.
    8. **Logout:** El usuario puede cerrar sesión en la aplicación.
    **Administrador:**
    1. **Login:** El administrador introduce sus credenciales de administrador.
    2. **Acceso a Gestión de Usuarios:** El administrador puede acceder a una sección para gestionar usuarios (consultar, eliminar, modificar roles).
    3. **Acceso a Gestión de Productos (Contexto Extendido):** El administrador puede gestionar el catálogo de productos.
    4. **Acceso a Ventas (Contexto Extendido):** El administrador puede consultar informes de ventas.
    5. **Funcionalidades de Usuario Común:** El administrador también tiene acceso a todas las funcionalidades de un usuario común para gestionar listas e ítems.

*Tecnologias a utilizar*
    * **Front-end:** HTML, CSS (Bootstrap para estilos responsivos), JavaScript.
    * **Back-end:** Node.js con Express.
    * **Base de Datos:** MongoDB.
    * **Autenticación:** JWT (JSON Web Tokens).
