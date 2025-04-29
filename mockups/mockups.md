# Mockups - Generador de Listas Etiquetadas

## Portada
**Proyecto:** Generador de Listas Etiquetadas  
**Alumno:** Diego Mercado Coello  
**Materia:** Desarrollo de Aplicaciones y Servicios Web  
**Fecha:** 2024

## Descripción del Proyecto
El proyecto "Generador de listas etiquetadas" es una aplicación web que permite a los usuarios crear y gestionar listas de elementos (ítems). Cada ítem puede ser etiquetado con múltiples etiquetas y tener un estado específico (activo, inactivo o pendiente). La aplicación ofrece funcionalidades de filtrado por etiquetas y estados, además de permitir la creación de campos especiales personalizados por lista y vistas personalizadas con filtros y ordenamientos.

## Descripción de las Pantallas Principales

### 1. Página de Inicio (Login/Registro)
**Componente:** `LoginPage`  
**Descripción:** Pantalla inicial que permite a los usuarios acceder a su cuenta o registrarse. Incluye:
- Formulario de inicio de sesión con campos para email y contraseña
- Opción para registrarse como nuevo usuario
- Diseño limpio y minimalista con el logo de la aplicación

### 2. Dashboard Principal
**Componente:** `Dashboard`  
**Descripción:** Página principal después del login que muestra:
- Barra de navegación superior con el nombre del usuario y opciones de cuenta
- Panel lateral con acceso rápido a listas favoritas y archivadas
- Vista general de todas las listas del usuario
- Botón flotante para crear nueva lista
- Sección de búsqueda y filtros

### 3. Vista de Lista Individual
**Componente:** `ListView`  
**Descripción:** Pantalla que muestra el contenido detallado de una lista específica:
- Encabezado con título y descripción de la lista
- Barra de herramientas con opciones de filtrado y ordenamiento
- Grid/Lista de ítems con sus estados y etiquetas
- Panel lateral para campos especiales personalizados
- Botón para agregar nuevos ítems

### 4. Editor de Ítem
**Componente:** `ItemEditor`  
**Descripción:** Modal o página para crear/editar ítems:
- Formulario con campos para título y descripción
- Selector de estado (activo/inactivo/pendiente)
- Sistema de gestión de etiquetas con autocompletado
- Opción para subir imagen
- Campos especiales específicos de la lista

### 5. Gestor de Etiquetas
**Componente:** `TagManager`  
**Descripción:** Interfaz para administrar etiquetas:
- Lista de etiquetas existentes
- Formulario para crear nuevas etiquetas
- Opciones para editar y eliminar etiquetas
- Visualización de uso de etiquetas

### 6. Vista Personalizada
**Componente:** `CustomView`  
**Descripción:** Página para crear y gestionar vistas personalizadas:
- Constructor de filtros
- Opciones de ordenamiento
- Vista previa de resultados
- Guardado de configuraciones

## Reflexión sobre Componentes
Los componentes planteados representan una evolución respecto a los requerimientos iniciales, agregando:

1. **Nuevas Funcionalidades:**
   - Sistema de favoritos para listas
   - Vista de listas archivadas
   - Panel lateral para acceso rápido
   - Constructor de vistas personalizadas más robusto

2. **Mejoras de UX:**
   - Diseño responsivo para todos los dispositivos
   - Interfaz intuitiva con retroalimentación visual
   - Accesos rápidos y atajos de teclado
   - Sistema de drag & drop para organización

3. **Componentes Adicionales:**
   - `TagManager`: No contemplado inicialmente, pero necesario para una mejor gestión de etiquetas
   - `CustomView`: Expandido para ofrecer más opciones de personalización
   - Sistema de notificaciones para cambios en listas compartidas

Estas modificaciones se realizaron pensando en mejorar la experiencia del usuario y hacer la aplicación más funcional y eficiente. 