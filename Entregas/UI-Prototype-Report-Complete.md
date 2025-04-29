# Reporte del Prototipo de Interfaz de Usuario
## Generador de Listas Etiquetadas

**Fecha de entrega:** Mayo 2024

**Equipo:**
- Federico Humberto Zaragoza Manuel
- Luis Eduardo González Gloria
- Diego Mercado Coello

## Descripción del Proyecto

El proyecto consiste en desarrollar una aplicación web, denominada "Generador de listas etiquetadas", que permite a los usuarios crear y gestionar listas de elementos (ítems). Cada ítem dentro de una lista puede ser etiquetado con una o varias etiquetas y tener un estado (activo, inactivo o pendiente). Los usuarios podrán filtrar sus listas para visualizar únicamente los ítems que cumplan con criterios específicos de etiquetas y estados. Adicionalmente, la aplicación permitirá agregar campos especiales personalizados por lista y generar vistas personalizadas con filtros y ordenamientos para una gestión más eficiente de la información.

El objetivo principal es proporcionar **una** herramienta flexible y personalizable para la organización de información a través de listas, facilitando la categorización y el seguimiento de elementos mediante etiquetas y estados.

## Enlace al Video de Demostración

[Enlace al video de demostración del prototipo de UI](https://enlace-al-video.com)

*Nota para el usuario: Aquí deberás incluir el enlace a tu video una vez lo hayas grabado y subido.*

## Descripción de las Pantallas Implementadas

### 1. Página de Login (index.html)

**Descripción:** Pantalla inicial donde los usuarios ingresan sus credenciales para acceder a la aplicación. Incluye formulario de inicio de sesión con validación de campos, opción para recordar usuario y enlace para recuperar contraseña.

**Asignado a:** Federico Humberto Zaragoza Manuel

<!-- 
SECCIÓN PARA AÑADIR SCREENSHOTS
Instrucciones: 
1. Tomar captura de pantalla de la página de login
2. Añadir la imagen aquí con el formato:
![Screenshot de la página de login](ruta/a/la/imagen.png)
3. Opcionalmente, añadir una breve descripción de lo que se muestra
-->

La página de login presenta una interfaz limpia y minimalista con un formulario centrado que incluye campos para correo electrónico y contraseña. El diseño utiliza Bootstrap para lograr un aspecto moderno con sombras suaves y bordes redondeados. Incluye validación visual de campos, opción para mostrar/ocultar contraseña, casilla de "Recordarme" y enlace para recuperación de contraseña. El logotipo de la aplicación se muestra en la parte superior, y en la parte inferior hay un botón para registrarse si el usuario no tiene cuenta.

### 2. Página de Registro (register.html)

**Descripción:** Formulario completo para el registro de nuevos usuarios. Incluye validación de campos obligatorios, validación de formato de correo electrónico, requisitos de contraseña y aceptación de términos y condiciones.

**Asignado a:** Federico Humberto Zaragoza Manuel

<!-- 
SECCIÓN PARA AÑADIR SCREENSHOTS
Instrucciones: 
1. Tomar captura de pantalla de la página de registro
2. Añadir la imagen aquí con el formato:
![Screenshot de la página de registro](ruta/a/la/imagen.png)
3. Opcionalmente, añadir una breve descripción de lo que se muestra
-->

La página de registro muestra un formulario más extenso que el de login, organizado en secciones lógicas. Incluye campos para nombre completo, correo electrónico, contraseña y confirmación de contraseña, todos con sus respectivas validaciones visuales. Se muestran los requisitos de seguridad para la contraseña y un checkbox para aceptar los términos y condiciones con enlace a los mismos. El diseño mantiene la coherencia visual con la página de login, utilizando los mismos elementos de estilo como las tarjetas con sombras y los botones con iconos. También incluye un enlace para regresar a la página de login si el usuario ya tiene una cuenta.

### 3. Dashboard (dashboard.html)

**Descripción:** Panel principal que muestra todas las listas del usuario en formato de tarjetas. Incluye barra de navegación, buscador, acceso a notificaciones y perfil, filtrado por categorías, y opciones para crear nuevas listas.

**Asignado a:** Luis Eduardo González Gloria

<!-- 
SECCIÓN PARA AÑADIR SCREENSHOTS
Instrucciones: 
1. Tomar captura de pantalla del dashboard
2. Añadir la imagen aquí con el formato:
![Screenshot del dashboard](ruta/a/la/imagen.png)
3. Opcionalmente, añadir una breve descripción de lo que se muestra
-->

El dashboard presenta una estructura de tres componentes principales: una barra de navegación superior con buscador y accesos rápidos, una barra lateral izquierda con filtros y categorías, y el área principal de contenido donde se muestran las listas en formato de tarjetas. Cada tarjeta de lista muestra el título, descripción breve, etiquetas asociadas, un indicador de progreso y la fecha de última actualización. El diseño es responsivo y se adapta a diferentes tamaños de pantalla, reorganizando las tarjetas según el espacio disponible. También se incluye una tarjeta especial para crear nuevas listas y un modal que se abre al hacer clic en ella.

### 4. Detalle de Lista (list-detail.html)

**Descripción:** Vista detallada de una lista específica que muestra todos sus ítems. Permite añadir, editar y eliminar ítems, marcarlos como completados, compartir la lista, visualizar progreso, y ver la actividad reciente.

**Asignado a:** Diego Mercado Coello

<!-- 
SECCIÓN PARA AÑADIR SCREENSHOTS
Instrucciones: 
1. Tomar captura de pantalla de la vista detalle de lista
2. Añadir la imagen aquí con el formato:
![Screenshot de detalle de lista](ruta/a/la/imagen.png)
3. Opcionalmente, añadir una breve descripción de lo que se muestra
-->

La vista de detalle de lista muestra una cabecera con el título de la lista, descripción y una barra de progreso general. Debajo se encuentran controles para filtrar elementos por etiquetas o estado, y un botón para añadir nuevos ítems. El contenido principal es una tabla o lista de elementos donde cada fila representa un ítem con su título, etiquetas, estado y opciones para editar o eliminar. Los ítems pueden marcarse como completados mediante casillas de verificación. En el lateral derecho se muestra información adicional como la actividad reciente y opciones para compartir la lista. La vista incluye un modal para editar o añadir nuevos ítems con campos para título, descripción, etiquetas y estado.

### 5. Perfil de Usuario (profile.html)

**Descripción:** Página que permite al usuario ver y editar su información personal. Incluye pestañas para información general, seguridad (cambio de contraseña) y registro de actividad reciente.

**Asignado a:** Federico Humberto Zaragoza Manuel

<!-- 
SECCIÓN PARA AÑADIR SCREENSHOTS
Instrucciones: 
1. Tomar captura de pantalla del perfil de usuario
2. Añadir la imagen aquí con el formato:
![Screenshot del perfil de usuario](ruta/a/la/imagen.png)
3. Opcionalmente, añadir una breve descripción de lo que se muestra
-->

La página de perfil de usuario está organizada en un sistema de pestañas para facilitar la navegación entre diferentes secciones. La pestaña principal muestra la información general del usuario como nombre, correo electrónico, foto de perfil y fecha de registro. Incluye un formulario para editar estos datos con validación en tiempo real. La segunda pestaña contiene opciones de seguridad, principalmente para cambio de contraseña con campos para la contraseña actual y la nueva. La tercera pestaña muestra un registro cronológico de la actividad reciente del usuario, incluyendo creación de listas, modificaciones y otros eventos relevantes. El diseño es limpio y consistente con el resto de la aplicación.

### 6. Administración de Usuarios (admin-users.html)

**Descripción:** Panel de administración que permite gestionar todos los usuarios del sistema. Incluye funciones para buscar, filtrar, ver detalles, editar y eliminar usuarios. Solo accesible para administradores.

**Asignado a:** Federico Humberto Zaragoza Manuel

<!-- 
SECCIÓN PARA AÑADIR SCREENSHOTS
Instrucciones: 
1. Tomar captura de pantalla de la administración de usuarios
2. Añadir la imagen aquí con el formato:
![Screenshot de la administración de usuarios](ruta/a/la/imagen.png)
3. Opcionalmente, añadir una breve descripción de lo que se muestra
-->

El panel de administración de usuarios presenta una interfaz más técnica y funcional, con una tabla principal que lista todos los usuarios registrados. Cada fila contiene información básica como nombre, correo, rol, estado y fecha de registro. En la parte superior hay controles para buscar usuarios por diferentes criterios y aplicar filtros. Las acciones disponibles para cada usuario incluyen ver detalles, editar información, cambiar permisos y eliminar cuenta, accesibles mediante botones o un menú desplegable. La vista incluye también indicadores visuales para distinguir entre administradores y usuarios regulares, así como cuentas activas e inactivas. Se complementa con un modal para editar o añadir usuarios y una vista de detalles expandible.

### 7. Gestor de Etiquetas (tags-manager.html)

**Descripción:** Herramienta especializada para administrar todas las etiquetas del usuario. Permite crear, editar y eliminar etiquetas, personalizar colores, ver estadísticas de uso y tendencias.

**Asignado a:** Diego Mercado Coello

<!-- 
SECCIÓN PARA AÑADIR SCREENSHOTS
Instrucciones: 
1. Tomar captura de pantalla del gestor de etiquetas
2. Añadir la imagen aquí con el formato:
![Screenshot del gestor de etiquetas](ruta/a/la/imagen.png)
3. Opcionalmente, añadir una breve descripción de lo que se muestra
-->

El gestor de etiquetas ofrece dos vistas: cuadrícula y lista, seleccionables mediante botones en la parte superior. En la vista de cuadrícula, cada etiqueta se muestra como una tarjeta con su nombre, color personalizado y un contador de uso. En la vista de lista, se presenta una tabla más compacta con la misma información. Ambas vistas incluyen opciones para editar o eliminar etiquetas. La interfaz cuenta con un botón prominente para crear nuevas etiquetas, que abre un modal con campos para el nombre y un selector de color visual. También incluye una sección de estadísticas que muestra gráficos sobre el uso de etiquetas en diferentes listas y su tendencia a lo largo del tiempo. El diseño es colorido pero profesional, utilizando los colores de las propias etiquetas como elementos visuales clave.

### 8. Vistas Personalizadas (custom-views.html)

**Descripción:** Interfaz que permite a los usuarios crear y gestionar vistas personalizadas de sus listas, con filtros, ordenamientos y campos visibles configurables.

**Asignado a:** Diego Mercado Coello

<!-- 
SECCIÓN PARA AÑADIR SCREENSHOTS
Instrucciones: 
1. Tomar captura de pantalla de las vistas personalizadas
2. Añadir la imagen aquí con el formato:
![Screenshot de vistas personalizadas](ruta/a/la/imagen.png)
3. Opcionalmente, añadir una breve descripción de lo que se muestra
-->

La página de vistas personalizadas presenta una interfaz dividida en dos secciones principales. A la izquierda se muestra un panel con las vistas guardadas por el usuario, organizadas por categorías. A la derecha se encuentra el área de configuración donde el usuario puede definir los parámetros de una vista personalizada. Esta área incluye controles para seleccionar la lista base, definir filtros (por etiquetas, estado, fecha), establecer criterios de ordenamiento, y seleccionar qué campos se mostrarán en la vista. La interfaz utiliza elementos interactivos como selectores múltiples, casillas de verificación y campos de texto con autocompletado. Un botón "Vista previa" permite al usuario visualizar cómo quedará la vista antes de guardarla. En la parte inferior hay opciones para guardar la vista actual, compartirla o exportarla en diferentes formatos.

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
| Vistas Personalizadas | Diego Mercado Coello | Realizado |
| Editor de Item Modal | Diego Mercado Coello | Realizado |

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

En nuestra evaluación detallada del prototipo, consideramos que hemos cumplido satisfactoriamente con la mayoría de los requerimientos establecidos. Todas las pantallas principales han sido implementadas con sus respectivas funcionalidades visuales y de interacción básica.

Sin embargo, identificamos algunas áreas que requieren desarrollo adicional en futuras iteraciones:

1. **Navegación completa entre páginas**: Si bien la estructura de navegación está definida y los enlaces están presentes, no todos los vínculos entre páginas están completamente funcionales. Especialmente desde el dashboard hacia otras secciones como perfil o configuración.

2. **Funcionalidad de arrastrar y soltar**: La organización de ítems mediante drag & drop está planteada en la interfaz pero no implementada completamente.

3. **Sistema de notificaciones en tiempo real**: Las notificaciones se muestran de manera estática, pero no se ha implementado la funcionalidad para actualizarse en tiempo real.

4. **Almacenamiento persistente de datos**: Al ser un prototipo UI, los datos son hardcodeados y no persisten entre sesiones o recarga de páginas.

Estas limitaciones están alineadas con el alcance definido para esta fase del proyecto, ya que el enfoque principal era el diseño visual y la estructura de la interfaz de usuario, no la implementación completa de la funcionalidad backend o la persistencia de datos.

## Distribución del Trabajo

El trabajo se distribuyó de manera equilibrada entre los miembros del equipo, asignando responsabilidades según las fortalezas y experiencia de cada integrante:

- **Federico Humberto Zaragoza Manuel**: Se encargó de las interfaces de usuario relacionadas con la autenticación y gestión de usuarios, incluyendo el desarrollo del sistema de administración.

- **Luis Eduardo González Gloria**: Desarrolló la interfaz principal del dashboard y los componentes relacionados con la visualización y gestión de listas.

- **Diego Mercado Coello**: Implementó la vista detallada de listas, el gestor de etiquetas y las funcionalidades relacionadas con los ítems individuales.

La distribución del trabajo resultó equitativa y eficiente, aprovechando las habilidades específicas de cada miembro del equipo. Federico se enfocó en las interfaces relacionadas con la administración y la autenticación, Luis Eduardo en la interfaz principal del sistema, y Diego en las funcionalidades específicas de gestión de contenido.

Entre los desafíos más significativos que enfrentamos estuvo la coordinación para mantener una coherencia visual y de experiencia de usuario a través de todas las páginas. Esto lo resolvimos estableciendo desde el inicio guías de estilo comunes y utilizando componentes de Bootstrap de manera consistente.

La comunicación regular a través de reuniones semanales y el uso de herramientas de control de versiones nos permitió integrar el trabajo de manera fluida. Para futuras iteraciones, consideramos que sería beneficioso:

1. Establecer un sistema de componentes reutilizables más estructurado
2. Implementar pruebas de usabilidad tempranas con usuarios potenciales
3. Mejorar la documentación de componentes y patrones de diseño utilizados

La experiencia de desarrollo colaborativo fue positiva y sentó las bases para las siguientes fases del proyecto, donde nos enfocaremos en la implementación de la funcionalidad completa y la integración con el backend.

---

*Nota: Este reporte será convertido a PDF una vez completado con los pantallazos correspondientes.* 