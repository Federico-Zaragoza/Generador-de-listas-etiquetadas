// Custom View JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        // Redirigir al login si no hay token
        window.location.href = 'index.html';
        return;
    }

    // Inicializar componentes
    initFormValidation();
    
    // Cargar etiquetas
    loadTags();
    
    // Cargar vistas existentes
    loadCustomViews();

    // Manejar envío del formulario
    const customViewForm = document.getElementById('customViewForm');
    customViewForm.addEventListener('submit', handleCustomViewSubmit);

    // Manejar botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Initialize Bootstrap form validation
function initFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
}

// Cargar etiquetas disponibles
async function loadTags() {
    try {
        const filterTagsCheckboxes = document.getElementById('filterTagsCheckboxes');
        
        // Mostrar loading placeholder
        filterTagsCheckboxes.innerHTML = `
            <div class="col-12 text-center py-3">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        `;
        
        // Obtener etiquetas desde la API
        const response = await window.api.getEtiquetas();
        
        if (response.success) {
            // Limpiar contenedor
            filterTagsCheckboxes.innerHTML = '';
            
            // Si no hay etiquetas, mostrar mensaje
            if (response.etiquetas.length === 0) {
                filterTagsCheckboxes.innerHTML = `
                    <div class="col-12 text-center py-2">
                        <p class="text-muted mb-0">No hay etiquetas disponibles</p>
                    </div>
                `;
                return;
            }
            
            // Crear checkboxes para cada etiqueta
            response.etiquetas.forEach(etiqueta => {
                const col = document.createElement('div');
                col.className = 'col-md-6 mb-2';
                
                col.innerHTML = `
                    <div class="form-check">
                        <input class="form-check-input tag-checkbox" type="checkbox" 
                               id="tag-${etiqueta._id}" value="${etiqueta._id}" 
                               data-tag-name="${etiqueta.nombre}">
                        <label class="form-check-label" for="tag-${etiqueta._id}">
                            ${etiqueta.nombre}
                        </label>
                    </div>
                `;
                
                filterTagsCheckboxes.appendChild(col);
            });
        } else {
            filterTagsCheckboxes.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger mb-0">
                        Error al cargar etiquetas: ${response.message || 'Error desconocido'}
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar etiquetas:', error);
        const filterTagsCheckboxes = document.getElementById('filterTagsCheckboxes');
        filterTagsCheckboxes.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger mb-0">
                    Error de conexión al servidor
                </div>
            </div>
        `;
    }
}

// Cargar vistas personalizadas existentes
async function loadCustomViews() {
    try {
        const existingViewsList = document.getElementById('existingViewsList');
        const customViewsSidebar = document.getElementById('customViewsSidebar');
        const viewsCount = document.getElementById('viewsCount');
        const noViewsMessage = document.getElementById('noViewsMessage');
        
        // Obtener vistas desde la API
        const response = await window.api.getCustomViews();
        
        if (response.success) {
            // Actualizar contador
            viewsCount.textContent = response.count;
            
            // Limpiar contenedores
            existingViewsList.innerHTML = '';
            customViewsSidebar.innerHTML = '';
            
            // Mostrar/ocultar mensaje de no vistas
            if (response.count === 0) {
                noViewsMessage.classList.remove('d-none');
                document.querySelector('.table-responsive').classList.add('d-none');
            } else {
                noViewsMessage.classList.add('d-none');
                document.querySelector('.table-responsive').classList.remove('d-none');
                
                // Generar filas de tabla para cada vista
                response.vistas.forEach(vista => {
                    // Formatear fecha
                    const ultimoUso = new Date(vista.ultimoUso);
                    const fechaFormateada = ultimoUso.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    
                    // Crear fila en la tabla
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <a href="dashboard.html?view=${vista._id}" class="text-decoration-none">
                                ${vista.nombre}
                            </a>
                        </td>
                        <td>${fechaFormateada}</td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <a href="dashboard.html?view=${vista._id}" class="btn btn-outline-primary" title="Aplicar Vista">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <button class="btn btn-outline-danger btn-delete-view" data-view-id="${vista._id}" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    
                    existingViewsList.appendChild(row);
                    
                    // Crear enlace en el sidebar
                    const sidebarItem = document.createElement('li');
                    sidebarItem.className = 'nav-item';
                    sidebarItem.innerHTML = `
                        <a class="nav-link" href="dashboard.html?view=${vista._id}">
                            <i class="fas fa-filter me-2"></i>
                            ${vista.nombre}
                        </a>
                    `;
                    
                    customViewsSidebar.appendChild(sidebarItem);
                });
                
                // Añadir event listeners para botones de eliminar
                document.querySelectorAll('.btn-delete-view').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const viewId = e.currentTarget.getAttribute('data-view-id');
                        if (confirm('¿Estás seguro de que deseas eliminar esta vista?')) {
                            await deleteCustomView(viewId);
                        }
                    });
                });
            }
        } else {
            showToast(response.message || 'Error al cargar vistas', 'danger');
        }
    } catch (error) {
        console.error('Error al cargar vistas personalizadas:', error);
        showToast('Error de conexión al servidor', 'danger');
    }
}

// Manejar envío del formulario de vista personalizada
async function handleCustomViewSubmit(event) {
    event.preventDefault();
    
    if (!this.checkValidity()) {
        return;
    }
    
    try {
        // Obtener valores del formulario
        const nombre = document.getElementById('viewName').value.trim();
        const estado = document.getElementById('filterState').value;
        
        // Obtener etiquetas seleccionadas
        const etiquetasSeleccionadas = [];
        document.querySelectorAll('.tag-checkbox:checked').forEach(checkbox => {
            etiquetasSeleccionadas.push(checkbox.value);
        });
        
        // Obtener lógica de etiquetas
        const logicaEtiquetas = document.querySelector('input[name="tagLogic"]:checked').value;
        
        // Obtener valores de ordenamiento
        const campoOrden = document.getElementById('sortField').value;
        const direccionOrden = document.querySelector('input[name="sortDirection"]:checked').value;
        
        // Construir objeto de datos
        const viewData = {
            nombre,
            filtros: {
                estado: estado !== 'todos' ? estado : undefined,
                etiquetas: etiquetasSeleccionadas.length > 0 ? etiquetasSeleccionadas : undefined,
                logicaEtiquetas: etiquetasSeleccionadas.length > 0 ? logicaEtiquetas : undefined
            },
            ordenamientos: {
                campo: campoOrden,
                direccion: direccionOrden
            }
        };
        
        // Deshabilitar botón para evitar envíos múltiples
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        
        // Enviar a la API
        const response = await window.api.createCustomView(viewData);
        
        if (response.success) {
            showToast('Vista personalizada creada correctamente', 'success');
            
            // Limpiar formulario
            this.reset();
            document.querySelectorAll('.tag-checkbox').forEach(cb => cb.checked = false);
            document.getElementById('tagLogicAll').checked = true;
            document.getElementById('sortAsc').checked = true;
            
            // Recargar vistas
            await loadCustomViews();
        } else {
            showToast(response.message || 'Error al crear vista personalizada', 'danger');
        }
    } catch (error) {
        console.error('Error al crear vista personalizada:', error);
        showToast('Error de conexión al servidor', 'danger');
    } finally {
        // Reactivar botón
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Guardar Vista';
        
        // Limpiar validación
        this.classList.remove('was-validated');
    }
}

// Eliminar vista personalizada
async function deleteCustomView(viewId) {
    try {
        const response = await window.api.deleteCustomView(viewId);
        
        if (response.success) {
            showToast('Vista eliminada correctamente', 'success');
            await loadCustomViews();
        } else {
            showToast(response.message || 'Error al eliminar vista', 'danger');
        }
    } catch (error) {
        console.error('Error al eliminar vista:', error);
        showToast('Error de conexión al servidor', 'danger');
    }
}

// Manejar logout
function handleLogout(event) {
    event.preventDefault();
    
    // Limpiar localStorage y redirigir a login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Mostrar toast
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        console.error('Toast container not found');
        return;
    }
    
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toastEl);
    
    const toast = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 3000
    });
    
    toast.show();
    
    // Eliminar toast cuando se oculta
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastContainer.removeChild(toastEl);
    });
} 