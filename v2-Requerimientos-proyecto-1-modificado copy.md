# Documento: Requerimientos Generales del Proyecto "Generador de Listas Etiquetadas"

(Versión integrada con base en los documentos de requerimientos de front-end, back-end y el borrador inicial)

## 1. Descripción General del Proyecto

Nuestro proyecto, denominado "Generador de Listas Etiquetadas", consiste en el desarrollo de una aplicación web que permita a los usuarios crear y gestionar listas. Cada lista contiene ítems, y cada ítem puede tener múltiples etiquetas y un estado (activo, inactivo o pendiente). Además, el usuario podrá:

* Filtrar los ítems de acuerdo con las etiquetas y estados.
* Agregar campos especiales (o campos personalizados) en cada lista.
* Gestionar vistas personalizadas por filtros u ordenamientos.
* Autenticarse en el sistema (Login/Register) y autorización mediante JWT.
* Disponer de funcionalidades adicionales, como marcar listas como favoritas, archivarlas o compartirlas (extensible en iteraciones posteriores).
* Visualizar estadísticas de uso de etiquetas
* Personalizar colores de etiquetas
* Previsualizar cambios en tiempo real al aplicar filtros
* **Interfaz moderna y responsive con Bootstrap**
* **Sistema de drag & drop para organización de items**
* **Sistema de notificaciones para cambios en listas compartidas**

El objetivo es proporcionar una herramienta flexible y personalizable para la organización de información a través de listas, facilitando la categorización de sus elementos mediante etiquetas y estados, y permitiendo una búsqueda/filtrado eficiente.

## 2. Entidades en la Base de Datos

Para cubrir la funcionalidad descrita, se ha optado por usar MongoDB. Las principales entidades que se manejarán son las siguientes:

1. Usuarios
2. Listas
3. Ítems
4. Etiquetas (para casos en que se manejen como entidad aparte, según la necesidad de cada implementación)
5. Relaciones Ítem-Etiquetas (en caso de optar por un modelo muchos-a-muchos explícito)
6. Vistas Personalizadas (opcional, para almacenar configuraciones de filtros/ordenamientos guardados por cada usuario)

## 3. Atributos de Cada Entidad

A continuación, se describen los atributos principales de cada entidad. Cabe señalar que, en su mayoría, se prevé usar ObjectId como referencia a la base de datos de MongoDB, y se incluyen algunos campos obligatorios y otros opcionales.

### 3.1 Usuarios

* **username** (String, requerido, único). Ej: "juanp"
* **email** (String, requerido, único). Ej: "juanp@gmail.com"
* **nombre** (String). Ej: "Juan Pérez López"
* **password** (String, en formato de hash).
* **fecha_registro** (String de fecha en formato año-mes-día) o tipo Date. Ej: "2025-02-25"
* **fecha_nacimiento** (String de fecha año-mes-día) o tipo Date (opcional).
* **listasFavoritas** (Array de ObjectId, referencia a Listas).
* **listasArchivadas** (Array de ObjectId, referencia a Listas).
* **createdAt** (Date, default: Date.now).

### 3.2 Listas

* **userId** (ObjectId, referencia a Usuarios, requerido).
* **title** (String, requerido). Ej: "Tareas Pendientes"
* **description** (String, opcional).
* **camposEspaciales** (Objeto) o campos personalizados que la lista requiera.
* **createdAt** (Date, default: Date.now).
* **updatedAt** (Date, default: Date.now).

### 3.3 Ítems

* **listId** (ObjectId, referencia a Listas, requerido).
* **title** (String, requerido). Ej: "Comprar leche"
* **description** (String, opcional).
* **estado** (String, enum: ['activo', 'inactivo', 'pendiente'], default: 'pendiente').
* **etiquetas** (Array de Strings) o (relación muchos-a-muchos con entidad Etiqueta). Ej: `["compras", "urgente"]`
* **imagenUrl** (String, opcional).
* **createdAt** (Date, default: Date.now).
* **updatedAt** (Date, default: Date.now).

### 3.4 Etiquetas

**Entidad principal para gestionar etiquetas de manera centralizada:**

* **nombre** (String, único por usuario).
* **userId** (ObjectId, referencia a Usuario).
* **color** (String, código de color hexadecimal).
* **contador_uso** (Number, default: 0).

### 3.5 Relaciones Ítem-Etiquetas

**Implementación necesaria para el sistema de estadísticas de etiquetas:**

* **itemId** (ObjectId, referencia a Ítem).
* **tagId** (ObjectId, referencia a Etiqueta).
* **createdAt** (Date, default: Date.now).

### 3.6 Vistas Personalizadas

**Componente esencial para la personalización de la experiencia del usuario:**

* **userId** (ObjectId, referencia a Usuario).
* **nombre** (String).
* **filtros** (Objeto con criterios de filtrado).
* **ordenamientos** (Objeto con criterios de ordenamiento).
* **activa** (Boolean, default: true).
* **ultimoUso** (Date, default: Date.now).

## 4. Tipos de Usuarios en la Aplicación

Se contemplan al menos dos tipos de usuarios:

1. **Administrador:**
   * Posee privilegios para gestionar a todos los usuarios, cambiar roles y tener acceso a funcionalidades internas de mantenimiento.
   * Puede realizar todas las acciones de un usuario común, además de las de administración.
2. **Usuario Común:**
   * Rol principal para los usuarios finales.
   * Puede crear, editar y eliminar sus listas e ítems, así como gestionar sus etiquetas.

(En algunos contextos, podría haber roles como "Profesor" y "Estudiante", u otros roles específicos, pero para este MVP se ha simplificado a Administrador y Usuario Común.)

## 5. Operaciones Disponibles (por Rol)

### 5.1 Administrador

* **Gestión de Usuarios:**
  * Consultar usuarios registrados.
  * Eliminar usuarios o cambiarles el rol a administrador.
  * Puede realizar las mismas operaciones que un usuario común (login, logout, etc.).
* **Gestión de Listas / Ítems (Interno):**
  * Crear, editar, eliminar cualquier lista o ítem (por motivos de mantenimiento o soporte).
* **Revisión General / Mantenimiento:**
  * Puede acceder a reportes o estadísticas generales (p. ej. número total de listas creadas).

(Si la aplicación evoluciona a una tienda o a un sistema de ventas, el administrador también revisaría productos y ventas, pero en el caso de este proyecto, se centra en Listas e Ítems.)

### 5.2 Usuario Común

* **Usuarios (Perfil):**
  * Registro (signup).
  * Login (inicio de sesión).
  * Logout (cierre de sesión).
  * Editar datos básicos de su perfil (por ejemplo, cambiar contraseña).
* **Listas:**
  * Crear listas.
  * Consultar (ver) sus propias listas.
  * Editar / actualizar listas.
  * Eliminar listas.
  * Marcar / desmarcar listas como favoritas o archivadas (si se implementa).
* **Ítems:**
  * Crear ítems dentro de una lista.
  * Consultar ítems, filtrarlos por estado o etiquetas.
  * Editar / actualizar ítems.
  * Eliminar ítems.

## 6. Requerimientos Adicionales de Back-end

Además de las funcionalidades CRUD principales, se contempla:

* **Autenticación y Autorización de Usuarios:**
  * Uso de JWT (JSON Web Tokens) para proteger las rutas que requieran autenticación.
* **Validación de Datos:**
  * Se validará la información en el back-end (por ejemplo, que "title" no venga vacío al crear listas o ítems).
* **Manejo de Errores Centralizado:**
  * Enviar respuestas consistentes al front-end y facilitar la depuración.
* **Gestión de Imágenes o Archivos (opcional):**
  * Se permite asociar una "imagenUrl" a un ítem, subiendo la imagen a un servidor externo o almacenándola como URL pública.
* **Consumo de Servicios Externos (futuro, opcional):**
  * Podría integrarse con APIs de terceros para funcionalidades avanzadas (no requerido en este MVP).

## 7. Información Precargada y Trato Especial a la Información

En la versión actual (MVP), **Se requiere precargar:**
* **Usuario administrador inicial**
* **Conjunto básico de etiquetas comunes**
* **Vistas personalizadas predefinidas**
* **Estados predeterminados para items**

Para las imágenes, se manejarán simplemente como URLs, sin almacenar el archivo físico en la base de datos.

## 8. Distribución de Actividades en el Equipo

La distribución entre los integrantes se enfocará en los siguientes aspectos relacionados con la base de datos:

1. **Federico Humberto Zaragoza Manuel:**
   * Usuarios: registro, login/logout
   * Gestión de perfiles y roles
   * Control de accesos y autenticación JWT
   * Administración de usuarios (CRUD completo)
   * Estadísticas de uso del sistema
   * **Menú de navegación responsivo**
   * **Interfaz de administrador**

2. **Luis Eduardo González Gloria:**
   * Listas: CRUD completo
   * Gestión de campos especiales
   * Filtrado y búsqueda de listas
   * Sistema de archivado
   * Ordenamiento personalizado
   * **Dashboard principal con listas**
   * **Sistema de campos personalizados mejorado**

3. **Diego Mercado Coello:**
   * Items: CRUD completo con etiquetas
   * Sistema de etiquetas y estados
   * Vistas personalizadas y filtros
   * Gestión de imágenes
   * Estadísticas de etiquetas
   * **Sistema de gestión centralizada de etiquetas**
   * **Constructor avanzado de vistas personalizadas**
   * **Vista previa en tiempo real de filtros**

## 9. Flujo de Información (MVP)

El flujo básico de la aplicación es:

**Usuario Común:**

1. Registro y Login: El usuario se registra (o inicia sesión si ya existe).
2. Visualización de Listas: Tras autenticarse, ve su panel principal con todas sus listas.
3. Creación de Lista: El usuario puede crear nuevas listas.
4. Detalle de Lista: Al hacer clic en una lista, ve los ítems que contiene.
5. Gestión de Items:
   * Puede crear nuevos ítems, indicando título, descripción, estado y etiquetas.
   * Puede editar o eliminar ítems existentes.
   * Aplicar filtros u ordenamientos (por estado, fecha, etiquetas, etc.).
6. Opciones Adicionales:
   * Marcar listas como favoritas o archivadas.
   * Configurar vistas personalizadas.
7. Logout: Finaliza la sesión.

**Administrador:**

1. Login de Administrador: Ingresa con credenciales de administrador.
2. Gestión de Usuarios: Visualiza la lista de usuarios, puede eliminarlos o cambiarles el rol.
3. Gestión Global (opcional): Puede ver el estado general de las listas o dar soporte a usuarios.
4. Acceso a Funciones de Usuario Común: También puede gestionar sus propias listas o ítems.

## 10. Tabla de Ventanas/Páginas Principales

**Tabla completa de componentes y páginas del sistema:**

| Ventana/Componente      | Recurso (BD) | Usuarios con Acceso | Descripción Breve                                                                                                | Responsable   |
| :---------------------- | :----------- | :------------------ | :--------------------------------------------------------------------------------------------------------------- | :------------ |
| **Menú de Navegación**  | (datos de sesión) | Todos los usuarios  | Barra de navegación con enlaces a las secciones principales (login, logout, dashboard, etc.).                      | Federico      |
| **Página de Login**     | Usuarios     | Todos los usuarios  | Formulario de inicio de sesión (validación de credenciales).                                                       | Federico      |
| **Página de Registro**  | Usuarios     | Todos los usuarios  | Formulario de registro de nuevo usuario con validaciones.                                                        | Federico      |
| **Dashboard (Listas)**  | Listas, Ítems | Usuarios Logueados  | Muestra el listado de listas del usuario, permite crear/editar/eliminar listas.                                  | Luis Eduardo  |
| **Detalle de Lista**    | Ítems        | Usuarios Logueados  | Muestra y gestiona los ítems de la lista seleccionada (crear, filtrar, editar, eliminar).                          | Diego         |
| **Página de Perfil**    | Usuarios     | Usuario Logueado    | Permite modificar datos personales (cambiar contraseña, actualizar email, etc.).                                  | Federico      |
| **Administración de Usuarios** | Usuarios     | Administrador       | Muestra la lista de usuarios, con opciones de eliminar usuario o cambiar su rol.                               | Federico      |
| **Gestor de Etiquetas** | Etiquetas    | Usuarios Logueados  | Gestión centralizada de etiquetas con estadísticas de uso y personalización.                                  | Diego         |
| **Vistas Personalizadas** | Vistas      | Usuarios Logueados  | Constructor de vistas con filtros avanzados y previsualización en tiempo real.                                | Diego         |
| **Editor de Item** | Items, Etiquetas | Usuarios Logueados | **Modal o página completa para crear/editar ítems con gestión de etiquetas, imágenes y campos personalizados** | Diego |

## 11. Diferenciadores del Proyecto

**Las características diferenciadoras incluyen:**
* Sistema de estadísticas en tiempo real para etiquetas
* Personalización avanzada de etiquetas con colores
* Vista previa instantánea de filtros
* Interfaz moderna y responsive con Bootstrap
* Sistema robusto de gestión de etiquetas
* Constructor avanzado de vistas personalizadas
* **Sistema de drag & drop para organización de items**
* **Notificaciones para cambios en listas compartidas**
* **Panel lateral de acceso rápido a listas y etiquetas**
* **Mejoras en UX con retroalimentación visual inmediata**

Asimismo, se busca flexibilidad total en la creación de listas con "campos espaciales" o campos personalizados, permitiendo que cada lista tenga atributos dinámicos que el propio usuario defina.

## 12. Tecnologías a Utilizar

* **Front-end:** HTML, CSS (Bootstrap para estilos responsivos), JavaScript (consumiendo la API mediante fetch o Axios).
* **Back-end:** Node.js con Express.
* **Base de Datos:** MongoDB.
* **Autenticación:** JWT (JSON Web Tokens).
* **Control de Versiones:** Git (GitHub o similar).
* **Despliegue:** Heroku, Render u otro servicio de hosting en la nube.

## Cambios Realizados

### Adiciones:
1. Sistema de estadísticas para etiquetas
2. Personalización de colores para etiquetas
3. Vista previa en tiempo real para filtros
4. Interfaz más moderna y responsive con Bootstrap
5. Panel de gestión centralizada de etiquetas
6. Constructor de vistas personalizadas más robusto
7. Sistema de campos especiales mejorado
8. **Sistema de drag & drop para organización**
9. **Notificaciones para cambios en listas compartidas**
10. **Panel lateral de acceso rápido a favoritos y archivados**
11. **Retroalimentación visual mejorada en la interfaz**
12. **Componente específico Editor de Item como modal o página completa**
13. **Gestión avanzada de etiquetas con estadísticas visuales**

### Modificaciones:
1. Redistribución de responsabilidades entre los integrantes
2. Mayor énfasis en la experiencia de usuario
3. Interfaz más intuitiva y moderna
4. Mejora en la gestión de etiquetas
5. **Enfoque en diseño responsive para todos los dispositivos**
6. **Mayor detalle en los mockups de las interfaces principales**

### Notas:
- Se mantienen todas las funcionalidades base originales
- Se han agregado mejoras en la interfaz de usuario sin modificar la estructura de datos
- Las nuevas funcionalidades son extensiones de los requerimientos originales
- Se mantiene la compatibilidad con futuras iteraciones del proyecto

## Resumen de Enfoque por Integrante (Relacionado a Base de Datos)

* **Federico Humberto Zaragoza Manuel**: Usuarios: registro, login/logout, gestión de perfiles y roles, control de accesos y autenticación JWT, administración de usuarios (CRUD completo), estadísticas de uso del sistema

* **Luis Eduardo González Gloria**: Listas: CRUD completo, gestión de campos especiales personalizados, filtrado y búsqueda de listas, sistema de archivado, ordenamiento personalizado

* **Diego Mercado Coello**: Items: CRUD completo con etiquetas, sistema de etiquetas y estados, vistas personalizadas y filtros avanzados, gestión de imágenes, estadísticas detalladas de etiquetas

## Conclusión

El Generador de Listas Etiquetadas responde a la necesidad de organizar información de manera flexible y filtrable, utilizando etiquetas y estados. Se espera que, mediante el MVP descrito, el usuario final cuente con una interfaz sencilla e intuitiva para gestionar sus listas y un back-end robusto con autenticación y validaciones. El proyecto está diseñado para permitir iteraciones futuras, añadiendo funcionalidades como compartir listas, notificaciones en tiempo real, etiquetas colaborativas, etc.

Con esto, se completan los requerimientos generales del proyecto, integrando la información recabada sobre front-end y back-end, así como el contenido descrito en el borrador inicial. 