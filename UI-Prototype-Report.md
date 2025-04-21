# Reporte del Prototipo de Interfaz de Usuario
## Generador de Listas Etiquetadas

**Fecha de entrega:** Mayo 2024

**Equipo:**
- Federico Humberto Zaragoza Manuel
- Luis Eduardo González Gloria
- Diego Mercado Coello

## Descripción del Proyecto

El proyecto consiste en desarrollar una aplicación web, denominada "Generador de listas etiquetadas", que permite a los usuarios crear y gestionar listas de elementos (ítems). Cada ítem dentro de una lista puede ser etiquetado con una o varias etiquetas y tener un estado (activo, inactivo o pendiente). Los usuarios podrán filtrar sus listas para visualizar únicamente los ítems que cumplan con criterios específicos de etiquetas y estados. Adicionalmente, la aplicación permitirá agregar campos especiales personalizados por lista y generar vistas personalizadas con filtros y ordenamientos para una gestión más eficiente de la información.

El objetivo principal es proporcionar una herramienta flexible y personalizable para la organización de información a través de listas, facilitando la categorización y el seguimiento de elementos mediante etiquetas y estados.

## Enlace al Video de Demostración

[Enlace al video de demostración del prototipo de UI](https://enlace-al-video.com)

*Nota para el usuario: Aquí deberás incluir el enlace a tu video una vez lo hayas grabado y subido.*

## Descripción de las Pantallas Implementadas

### 1. Página de Login (index.html)

**Descripción:** Pantalla inicial donde los usuarios ingresan sus credenciales para acceder a la aplicación. Incluye formulario de inicio de sesión con validación de campos, opción para recordar usuario y enlace para recuperar contraseña.

**Asignado a:** Federico Humberto Zaragoza Manuel

*[AQUÍ IRÁN LOS PANTALLAZOS DE LA PÁGINA DE LOGIN]*

### 2. Página de Registro (register.html)

**Descripción:** Formulario completo para el registro de nuevos usuarios. Incluye validación de campos obligatorios, validación de formato de correo electrónico, requisitos de contraseña y aceptación de términos y condiciones.

**Asignado a:** Federico Humberto Zaragoza Manuel

*[AQUÍ IRÁN LOS PANTALLAZOS DE LA PÁGINA DE REGISTRO]*

### 3. Dashboard (dashboard.html)

**Descripción:** Panel principal que muestra todas las listas del usuario en formato de tarjetas. Incluye barra de navegación, buscador, acceso a notificaciones y perfil, filtrado por categorías, y opciones para crear nuevas listas.

**Asignado a:** Luis Eduardo González Gloria

*[AQUÍ IRÁN LOS PANTALLAZOS DEL DASHBOARD]*

### 4. Detalle de Lista (list-detail.html)

**Descripción:** Vista detallada de una lista específica que muestra todos sus ítems. Permite añadir, editar y eliminar ítems, marcarlos como completados, compartir la lista, visualizar progreso, y ver la actividad reciente.

**Asignado a:** Diego Mercado Coello

*[AQUÍ IRÁN LOS PANTALLAZOS DEL DETALLE DE LISTA]*

### 5. Perfil de Usuario (profile.html)

**Descripción:** Página que permite al usuario ver y editar su información personal. Incluye pestañas para información general, seguridad (cambio de contraseña) y registro de actividad reciente.

**Asignado a:** Federico Humberto Zaragoza Manuel

*[AQUÍ IRÁN LOS PANTALLAZOS DEL PERFIL DE USUARIO]*

### 6. Administración de Usuarios (admin-users.html)

**Descripción:** Panel de administración que permite gestionar todos los usuarios del sistema. Incluye funciones para buscar, filtrar, ver detalles, editar y eliminar usuarios. Solo accesible para administradores.

**Asignado a:** Federico Humberto Zaragoza Manuel

*[AQUÍ IRÁN LOS PANTALLAZOS DE LA ADMINISTRACIÓN DE USUARIOS]*

### 7. Gestor de Etiquetas (tags-manager.html)

**Descripción:** Herramienta especializada para administrar todas las etiquetas del usuario. Permite crear, editar y eliminar etiquetas, personalizar colores, ver estadísticas de uso y tendencias.

**Asignado a:** Diego Mercado Coello

*[AQUÍ IRÁN LOS PANTALLAZOS DEL GESTOR DE ETIQUETAS]*

## Tabla de Ventanas Implementadas

| Ventana/Componente | Asignado a | Estado |
|-------------------|------------|--------|
| Página de Login | Federico Humberto Zaragoza Manuel | Realizado |
| Página de Registro | Federico Humberto Zaragoza Manuel | Realizado |
| Dashboard | Luis Eduardo González Gloria | Realizado |
| Detalle de Lista | Diego Mercado Coello | Realizado |
| Perfil de Usuario | Federico Humberto Zaragoza Manuel | Realizado |
| Administración de Usuarios | Federico Humberto Zaragoza Manuel | Realizado |
| Gestor de Etiquetas | Diego Mercado Coello | Realizado |
| Vistas Personalizadas | Diego Mercado Coello | No realizado |
| Editor de Item Modal | Diego Mercado Coello | Parcialmente implementado |

## Guion para el Video de Demostración

**Duración estimada:** 4-5 minutos

1. **Introducción (30 segundos)**
   - Presentar brevemente el proyecto "Generador de Listas Etiquetadas"
   - Mencionar el objetivo principal de la aplicación
   - Presentar al equipo de desarrollo

2. **Registro e Inicio de Sesión (45 segundos)**
   - Mostrar la página de login y sus características
   - Demostrar la validación de campos
   - Mostrar la página de registro y sus validaciones
   - Crear un nuevo usuario de ejemplo

3. **Dashboard (45 segundos)**
   - Mostrar la vista principal con las listas del usuario
   - Explicar la organización por tarjetas
   - Demostrar la creación de una nueva lista
   - Mostrar los filtros y búsqueda

4. **Detalle de Lista (60 segundos)**
   - Abrir una lista específica
   - Mostrar la información general (título, descripción, progreso)
   - Añadir nuevos ítems a la lista
   - Marcar ítems como completados
   - Editar y eliminar ítems
   - Mostrar las opciones de compartir y exportar

5. **Gestor de Etiquetas (45 segundos)**
   - Navegar al gestor de etiquetas
   - Mostrar las vistas en grid y lista
   - Crear una nueva etiqueta personalizada
   - Editar el color de una etiqueta existente
   - Mostrar las estadísticas de uso

6. **Funciones de Administrador (45 segundos)**
   - Acceder al panel de administración de usuarios
   - Mostrar la lista de usuarios del sistema
   - Filtrar y buscar usuarios
   - Ver detalles de un usuario
   - Editar o añadir un nuevo usuario

7. **Conclusión (30 segundos)**
   - Resumen de las características principales
   - Mencionar los aspectos pendientes por implementar
   - Agradecimientos y cierre

## Reflexión sobre Cumplimiento de Requerimientos

Consideramos que el prototipo de interfaz de usuario cumple satisfactoriamente con los requerimientos especificados en el documento inicial. Hemos implementado todas las vistas principales necesarias para el flujo de la aplicación:

- ✅ Autenticación de usuarios (login/registro)
- ✅ Visualización y gestión de listas
- ✅ Visualización y gestión de ítems dentro de las listas
- ✅ Gestión de etiquetas con personalización de colores
- ✅ Visualización de estadísticas de uso
- ✅ Funcionalidades de administración de usuarios
- ✅ Interfaces responsivas adaptables a diferentes dispositivos
- ✅ Soporte para modo oscuro

Sin embargo, identificamos algunas áreas que requieren desarrollo adicional:

- ⚠️ La implementación completa del sistema de vistas personalizadas
- ⚠️ La funcionalidad de drag & drop para organización de ítems
- ⚠️ El sistema de notificaciones en tiempo real
- ⚠️ Mejoras en la accesibilidad general de la interfaz

Estas áreas pendientes se abordarán en las próximas iteraciones del proyecto, pero consideramos que el prototipo actual cumple con los requisitos mínimos necesarios para demostrar la funcionalidad principal y el flujo de la aplicación.

## Distribución del Trabajo

El trabajo se distribuyó de manera equilibrada entre los miembros del equipo, asignando responsabilidades según las fortalezas y experiencia de cada integrante:

- **Federico Humberto Zaragoza Manuel**: Se encargó de las interfaces de usuario relacionadas con la autenticación y gestión de usuarios, incluyendo el desarrollo del sistema de administración.

- **Luis Eduardo González Gloria**: Desarrolló la interfaz principal del dashboard y los componentes relacionados con la visualización y gestión de listas.

- **Diego Mercado Coello**: Implementó la vista detallada de listas, el gestor de etiquetas y las funcionalidades relacionadas con los ítems individuales.

Cada miembro del equipo cumplió con sus asignaciones dentro del plazo establecido, y se realizaron reuniones regulares para integrar el trabajo y asegurar la consistencia de la interfaz de usuario en toda la aplicación.

---

*Nota: Este reporte será convertido a PDF una vez completado con los pantallazos correspondientes.* 