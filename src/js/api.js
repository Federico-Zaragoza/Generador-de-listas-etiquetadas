// API configuration for all frontend requests
const API_BASE_URL = '/api';

// Utility function for making API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set default headers
    if (!options.headers) {
        options.headers = {};
    }
    
    // Set content type if not specified
    if (!options.headers['Content-Type'] && options.method !== 'GET') {
        options.headers['Content-Type'] = 'application/json';
    }
    
    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log(`API response for ${endpoint}:`, data);
        return data;
    } catch (error) {
        console.error(`API error for ${endpoint}:`, error);
        throw error;
    }
}

// Common API functions
const api = {
    login: async (userData) => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    
    register: async (userData) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    
    getListas: async () => {
        return apiRequest('/listas', {
            method: 'GET'
        });
    },

    // Método para obtener una lista específica por ID
    getLista: async (id) => {
        return apiRequest(`/listas/${id}`, {
            method: 'GET'
        });
    },

    createLista: async (data) => {
        return apiRequest('/listas', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    deleteLista: async (id) => {
        return apiRequest(`/listas/${id}`, {
            method: 'DELETE'
        });
    },

    updateLista: async (id, data) => {
        return apiRequest(`/listas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // Métodos para Items
    createItem: async (data) => {
        return apiRequest('/items', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    updateItem: async (id, data) => {
        return apiRequest(`/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    deleteItem: async (id) => {
        return apiRequest(`/items/${id}`, {
            method: 'DELETE'
        });
    },

    // Método para obtener un ítem específico por ID
    getItem: async (id) => {
        return apiRequest(`/items/${id}`, {
            method: 'GET'
        });
    },
    
    // Método para obtener ítems filtrados
    getItemsFiltered: async (listId, filtros = null, ordenamientos = null) => {
        let endpoint = `/items/filtrar?listId=${listId}`;
        
        // Añadir filtros a la URL si existen
        if (filtros) {
            if (filtros.estado && filtros.estado !== 'todos') {
                endpoint += `&estado=${filtros.estado}`;
            }
            
            if (filtros.etiquetas && Array.isArray(filtros.etiquetas) && filtros.etiquetas.length > 0) {
                endpoint += `&etiquetas=${filtros.etiquetas.join(',')}`;
                
                if (filtros.logicaEtiquetas) {
                    endpoint += `&etiqueta_logica=${filtros.logicaEtiquetas}`;
                }
            }
        }
        
        // Añadir ordenamientos a la URL si existen
        if (ordenamientos) {
            if (ordenamientos.campo) {
                endpoint += `&sortField=${ordenamientos.campo}`;
            }
            
            if (ordenamientos.direccion) {
                endpoint += `&sortDir=${ordenamientos.direccion}`;
            }
        }
        
        return apiRequest(endpoint, {
            method: 'GET'
        });
    },
    
    // Método para obtener todas las etiquetas
    getEtiquetas: async () => {
        return apiRequest('/etiquetas', {
            method: 'GET'
        });
    },

    // Métodos para marcar/desmarcar favoritos y archivados
    toggleFavorite: async (listId) => {
        return apiRequest(`/users/me/lists/favorite/${listId}`, {
            method: 'PUT'
        });
    },
    
    toggleArchive: async (listId) => {
        return apiRequest(`/users/me/lists/archive/${listId}`, {
            method: 'PUT'
        });
    },

    // Nuevos métodos para favoritos/archivados usando las rutas correctas
    toggleFavorita: async (listId) => {
        return apiRequest(`/listas/${listId}/favorita`, {
            method: 'PUT'
        });
    },

    toggleArchivada: async (listId) => {
        return apiRequest(`/listas/${listId}/archivada`, {
            method: 'PUT'
        });
    },

    // Métodos para gestión del perfil de usuario
    updateUserProfile: async (userData) => {
        return apiRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },
    
    updatePassword: async (passwordData) => {
        return apiRequest('/auth/updatepassword', {
            method: 'PUT',
            body: JSON.stringify(passwordData)
        });
    },

    // Métodos para vistas personalizadas
    getCustomViews: async () => {
        return apiRequest('/vistas', {
            method: 'GET'
        });
    },
    
    createCustomView: async (data) => {
        return apiRequest('/vistas', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    getCustomView: async (id) => {
        return apiRequest(`/vistas/${id}`, {
            method: 'GET'
        });
    },
    
    updateCustomView: async (id, data) => {
        return apiRequest(`/vistas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    deleteCustomView: async (id) => {
        return apiRequest(`/vistas/${id}`, {
            method: 'DELETE'
        });
    },

    // Métodos para compartir listas
    shareList: async (listId, data) => {
        return apiRequest(`/listas/${listId}/share`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    removeCollaborator: async (listId, collaboratorUserId) => {
        return apiRequest(`/listas/${listId}/share/${collaboratorUserId}`, {
            method: 'DELETE'
        });
    },
    
    // Invitar colaborador
    inviteCollaborator: async (listId, emailOrUsername, permiso) => {
        return apiRequest(`/listas/${listId}/share`, {
            method: 'POST',
            body: JSON.stringify({ emailOrUsername, permiso })
        });
    },

    // Funciones de administración de usuarios
    getUserById: async (id) => {
        return apiRequest(`/users/${id}`, {
            method: 'GET'
        });
    },
    
    updateUserAsAdmin: async (id, data) => {
        return apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    getAllUsers: async () => {
        return apiRequest('/users', {
            method: 'GET'
        });
    },

    // Obtener estadísticas de usuarios para administrador
    getAdminStats: async () => {
        return apiRequest('/users/stats', {
            method: 'GET'
        });
    },

    // Método para crear usuario (admin)
    createUser: async (userData) => {
        return apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    // Add more API methods as needed
}; 

// Expose API globally
window.api = api;
console.log('API inicializada y expuesta globalmente como window.api'); 