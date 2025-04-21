# Documentación de la API REST - Generador de Listas Etiquetadas

## Portada

**Universidad:** ITESO  
**Proyecto:** Generador de Listas Etiquetadas  
**Materia:** Desarrollo de Aplicaciones y Servicios Web  
**Integrantes:**
- Federico Humberto Zaragoza Manuel
- Luis Eduardo González Gloria
- Diego Mercado Coello

**Fecha:** Marzo 2024

## Descripción del Proyecto

El "Generador de Listas Etiquetadas" es una aplicación web que permite a los usuarios crear y gestionar listas personalizadas. Cada lista contiene ítems que pueden ser etiquetados y tener diferentes estados (activo, inactivo o pendiente). La aplicación ofrece funcionalidades avanzadas como filtrado por etiquetas, campos personalizados, vistas personalizadas, y un sistema de autenticación robusto mediante JWT.

## Documentación de la API REST

### Tabla de Endpoints

| Ruta | Método | Header | Body | Comentarios | Responsable |
|------|--------|--------|------|-------------|-------------|
| `/api/auth/register` | POST | Content-Type: application/json | ```{ "username": "string", "email": "string", "password": "string", "nombre": "string", "fecha_nacimiento": "YYYY-MM-DD" }``` | **Status Codes:** 201 (Created), 400 (Bad Request), 409 (Conflict - Usuario existente)<br>**Returns:** Token JWT y datos del usuario | Federico |
| `/api/auth/login` | POST | Content-Type: application/json | ```{ "email": "string", "password": "string" }``` | **Status Codes:** 200 (OK), 401 (Unauthorized)<br>**Returns:** Token JWT y datos del usuario | Federico |
| `/api/auth/profile` | GET | Authorization: Bearer {token} | - | **Status Codes:** 200 (OK), 401 (Unauthorized)<br>**Returns:** Datos del perfil del usuario | Federico |
| `/api/auth/profile` | PUT | Authorization: Bearer {token} | ```{ "nombre": "string", "fecha_nacimiento": "YYYY-MM-DD" }``` | **Status Codes:** 200 (OK), 400 (Bad Request), 401 (Unauthorized)<br>**Returns:** Datos actualizados del usuario | Federico |
| `/api/admin/users` | GET | Authorization: Bearer {token} | - | **Status Codes:** 200 (OK), 401 (Unauthorized), 403 (Forbidden)<br>**Returns:** Lista de usuarios<br>**Query Params:** page, limit | Federico |
| `/api/admin/users/{userId}` | DELETE | Authorization: Bearer {token} | - | **Status Codes:** 200 (OK), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found) | Federico |
| `/api/lists` | GET | Authorization: Bearer {token} | - | **Status Codes:** 200 (OK), 401 (Unauthorized)<br>**Returns:** Lista de listas del usuario<br>**Query Params:** page, limit, archived, favorite | Luis Eduardo |
| `/api/lists` | POST | Authorization: Bearer {token} | ```{ "title": "string", "description": "string", "camposEspeciales": {} }``` | **Status Codes:** 201 (Created), 400 (Bad Request), 401 (Unauthorized)<br>**Returns:** Lista creada | Luis Eduardo |
| `/api/lists/{listId}` | GET | Authorization: Bearer {token} | - | **Status Codes:** 200 (OK), 401 (Unauthorized), 404 (Not Found)<br>**Returns:** Detalles de la lista | Luis Eduardo |
| `/api/lists/{listId}` | PUT | Authorization: Bearer {token} | ```{ "title": "string", "description": "string", "camposEspeciales": {} }``` | **Status Codes:** 200 (OK), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found) | Luis Eduardo |
| `/api/lists/{listId}` | DELETE | Authorization: Bearer {token} | - | **Status Codes:** 200 (OK), 401 (Unauthorized), 404 (Not Found) | Luis Eduardo |
| `/api/lists/{listId}/items` | GET | Authorization: Bearer {token} | - | **Status Codes:** 200 (OK), 401 (Unauthorized)<br>**Query Params:** estado, etiquetas, page, limit<br>**Returns:** Items de la lista | Diego |
| `/api/lists/{listId}/items` | POST | Authorization: Bearer {token} | ```{ "title": "string", "description": "string", "estado": "string", "etiquetas": ["string"], "imagenUrl": "string" }``` | **Status Codes:** 201 (Created), 400 (Bad Request), 401 (Unauthorized) | Diego |
| `/api/lists/{listId}/items/{itemId}` | PUT | Authorization: Bearer {token} | ```{ "title": "string", "description": "string", "estado": "string", "etiquetas": ["string"], "imagenUrl": "string" }``` | **Status Codes:** 200 (OK), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found) | Diego |
| `/api/lists/{listId}/items/{itemId}` | DELETE | Authorization: Bearer {token} | - | **Status Codes:** 200 (OK), 401 (Unauthorized), 404 (Not Found) | Diego |
| `/api/tags` | GET | Authorization: Bearer {token} | - | **Status Codes:** 200 (OK), 401 (Unauthorized)<br>**Returns:** Lista de etiquetas del usuario con estadísticas | Diego |
| `/api/tags` | POST | Authorization: Bearer {token} | ```{ "nombre": "string", "color": "string" }``` | **Status Codes:** 201 (Created), 400 (Bad Request), 401 (Unauthorized) | Diego |
| `/api/views` | GET | Authorization: Bearer {token} | - | **Status Codes:** 200 (OK), 401 (Unauthorized)<br>**Returns:** Vistas personalizadas del usuario | Diego |
| `/api/views` | POST | Authorization: Bearer {token} | ```{ "nombre": "string", "filtros": {}, "ordenamientos": {} }``` | **Status Codes:** 201 (Created), 400 (Bad Request), 401 (Unauthorized) | Diego |

## Conclusión

La API REST diseñada cumple con todos los requerimientos especificados en el documento original:

1. **Cobertura Completa:** La API proporciona endpoints para todas las funcionalidades requeridas:
   - Autenticación y gestión de usuarios
   - CRUD completo de listas
   - Gestión de ítems con etiquetas
   - Sistema de vistas personalizadas
   - Gestión de etiquetas con estadísticas

2. **Seguridad:** 
   - Implementación de JWT para autenticación
   - Protección de rutas mediante tokens
   - Validación de roles para acciones administrativas

3. **Soporte para el Front-end:**
   - Endpoints diseñados para soportar todas las funcionalidades de UI
   - Soporte para paginación y filtrado
   - Respuestas estructuradas para fácil integración

4. **Escalabilidad:**
   - Estructura modular que permite agregar nuevos endpoints
   - Soporte para futuras características como compartir listas
   - Sistema de vistas personalizable

La API proporciona una base sólida para el desarrollo del front-end y cumple con los estándares REST, incluyendo:
- Uso apropiado de métodos HTTP
- Códigos de estado significativos
- Rutas semánticas y consistentes
- Documentación clara de parámetros y respuestas

Se recomienda implementar esta API utilizando Swagger/OpenAPI para documentación interactiva, lo que facilitará las pruebas y la integración con el front-end. 