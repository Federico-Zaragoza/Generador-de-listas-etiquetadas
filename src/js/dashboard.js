document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded disparado, verificando entorno...');
    // Verificar autenticación
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // --- Lógica para mostrar/ocultar elementos de admin ---
    const userRole = user ? user.role : null;
    console.log('Verificando rol para elementos de admin:', userRole);
    document.querySelectorAll('.admin-only').forEach(el => {
      if (userRole === 'admin') {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
    // --- Fin de Lógica Admin ---
    
    // Estado del filtro actual
    let currentFilter = 'all';
    // Variable global para almacenar todas las listas del usuario
    let todasLasListasDelUsuario = [];
    
    console.log('Token presente:', !!token);
    if (!token) {
        // Redirigir al login si no hay token
        window.location.href = 'index.html';
        return;
    }
    
    // Referencias a elementos del DOM
    const listsContainer = document.getElementById('listsContainer');
    const newListForm = document.getElementById('newListForm');
    const createListBtn = document.getElementById('createListBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const tagInput = document.getElementById('tagInput');
    const addTagBtn = document.getElementById('addTagBtn');
    const tagContainer = document.getElementById('tagContainer');
    const saveEditListBtn = document.getElementById('saveEditListBtn');
    const listSectionTitle = document.getElementById('listSectionTitle');
    const sidebarLinks = document.querySelectorAll('.sidebar .nav-link[data-filter]');
    const addCampoEspecialBtn = document.getElementById('addCampoEspecialBtn');
    const camposEspecialesContainer = document.getElementById('camposEspecialesContainer');
    
    // Mostrar nombre de usuario en la UI
    updateUserInfo();
    
    console.log('Llamando a fetchUserLists...');
    // Cargar listas del usuario
    fetchUserLists();
    
    // Event listener para búsqueda desde la barra de la navbar
    const navbarSearchInput = document.getElementById('navbarSearchInput');
    if (navbarSearchInput) {
        navbarSearchInput.addEventListener('input', function() {
            console.log('Término de búsqueda desde navbar:', this.value);
            renderLists();
        });
    }
    
    // Event listeners para los enlaces del sidebar con data-filter
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Actualizar el filtro actual
            currentFilter = this.getAttribute('data-filter');
            console.log('Filtro cambiado a:', currentFilter);
            
            // Actualizar clase active en los enlaces
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Recargar las listas con el nuevo filtro
            fetchUserLists();
        });
    });
    
    // Evento para cerrar sesión
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Manejar edición de lista
    saveEditListBtn.addEventListener('click', function() {
        saveEditList();
    });
    
    // Manejar creación de etiquetas
    addTagBtn.addEventListener('click', function() {
        addTag();
    });
    
    tagInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    });
    
    // Manejar creación de nuevos campos especiales
    addCampoEspecialBtn.addEventListener('click', function() {
        addCampoEspecial();
    });
    
    // Event delegation para acciones en campos especiales
    camposEspecialesContainer.addEventListener('click', function(e) {
        const deleteBtn = e.target.closest('.delete-campo-especial');
        if (deleteBtn) {
            // Eliminar el campo especial del DOM
            const campoItem = deleteBtn.closest('.campo-especial-item');
            if (campoItem) {
                campoItem.remove();
            }
        }
    });
    
    // Manejar creación de nueva lista
    createListBtn.addEventListener('click', function() {
        createNewList();
    });
    
    // Event delegation para acciones de listas
    listsContainer.addEventListener('click', function(e) {
        // Buscar el elemento más cercano con data-action
        const actionElement = e.target.closest('[data-action]');
        if (!actionElement) return;
        
        const action = actionElement.getAttribute('data-action');
        const listId = actionElement.getAttribute('data-id');
        console.log('Clic detectado en listsContainer:', { target: e.target, actionElement, action });
        
        if (action === 'toggle-favorite') {
            console.log('Llamando a handleToggleFavorite...');
            handleToggleFavorite(listId, actionElement);
        } else if (action === 'toggle-archive') {
            console.log('Llamando a handleToggleArchive...');
            handleToggleArchive(listId, actionElement);
        } else if (action === 'edit') {
            const title = actionElement.getAttribute('data-title');
            const description = actionElement.getAttribute('data-description');
            const listId = actionElement.getAttribute('data-id');
            editList(listId, title, description);
        } else if (action === 'delete') {
            deleteList(listId);
        }
    });
    
    // Función para actualizar información del usuario en la UI
    function updateUserInfo() {
        // Si hay elementos en la UI que deben mostrar información del usuario, actualizarlos aquí
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement && user.nombre) {
            userNameElement.textContent = user.nombre;
        }
    }
    
    // Función para cargar listas del usuario
    async function fetchUserLists() {
        console.log('Dentro de fetchUserLists, verificando la disponibilidad de api...');
        console.log('Objeto api disponible:', window.api);
        if (!window.api || !window.api.getListas) {
            console.error('ERROR: El objeto api o su método getListas no están disponibles');
            showError('Error: API no inicializada correctamente');
            return;
        }
        try {
            // Mostrar indicador de carga
            listsContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
            
            console.log('A punto de llamar a api.getListas()...');
            const data = await api.getListas();
            console.log('Listas recibidas:', data.listas);
            
            if (data.success) {
                // Guardar todas las listas en la variable global
                todasLasListasDelUsuario = data.listas;
                // Renderizar listas iniciales
                renderLists();
            } else {
                showError('Error al cargar las listas');
            }
        } catch (error) {
            console.error('Error al obtener listas:', error);
            showError('Error de conexión al servidor');
        }
    }
    
    // Función para renderizar listas
    function renderLists() {
        console.log('Renderizando listas con filtro y búsqueda...');
        listsContainer.innerHTML = '';
        // Obtener término de búsqueda desde la barra de la navbar en minúsculas
        const searchTerm = navbarSearchInput ? navbarSearchInput.value.trim().toLowerCase() : '';
        // Empezar con todas las listas
        let listasParaMostrar = todasLasListasDelUsuario.slice();
        // Aplicar filtro de estado
        switch (currentFilter) {
            case 'all':
                listasParaMostrar = listasParaMostrar.filter(lista => 
                    !user.listasArchivadas || !user.listasArchivadas.includes(lista._id)
                );
                break;
            case 'favorites':
                listasParaMostrar = listasParaMostrar.filter(lista => 
                    user.listasFavoritas && user.listasFavoritas.includes(lista._id) && 
                    (!user.listasArchivadas || !user.listasArchivadas.includes(lista._id))
                );
                break;
            case 'archived':
                listasParaMostrar = listasParaMostrar.filter(lista => 
                    user.listasArchivadas && user.listasArchivadas.includes(lista._id)
                );
                break;
        }
        // Aplicar filtro de búsqueda (título o descripción)
        if (searchTerm) {
            listasParaMostrar = listasParaMostrar.filter(lista => 
                (lista.title && lista.title.toLowerCase().includes(searchTerm)) || 
                (lista.description && lista.description.toLowerCase().includes(searchTerm))
            );
        }
        console.log('Listas finales a mostrar:', listasParaMostrar);
        // Actualizar título de sección
        switch (currentFilter) {
            case 'all':
                listSectionTitle.textContent = searchTerm ? 'Resultados de búsqueda' : 'Mis Listas';
                break;
            case 'favorites':
                listSectionTitle.textContent = searchTerm ? 'Favoritos - Resultados de búsqueda' : 'Favoritos';
                break;
            case 'archived':
                listSectionTitle.textContent = searchTerm ? 'Archivados - Resultados de búsqueda' : 'Archivados';
                break;
        }
        // Si no hay listas que mostrar
        if (listasParaMostrar.length === 0) {
            const message = searchTerm ? 'No se encontraron listas que coincidan con la búsqueda.' : 'No hay listas para mostrar.';
            listsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info" role="alert">
                        <i class="fas fa-info-circle me-2"></i>${message}
                    </div>
                </div>
            `;
            return;
        }
        // Renderizar cada tarjeta de lista
        listasParaMostrar.forEach(lista => {
            const card = createListCard(lista);
            listsContainer.appendChild(card);
        });
    }
    
    // Función para crear una tarjeta de lista
    function createListCard(lista) {
        const col = document.createElement('div');
        col.className = 'col';
        
        // Formatear fecha
        const updatedDate = new Date(lista.updatedAt);
        const timeAgo = getTimeAgo(updatedDate);
        
        // Verificar si la lista está en favoritos o archivada
        const isFavorite = user.listasFavoritas && user.listasFavoritas.includes(lista._id);
        const isArchived = user.listasArchivadas && user.listasArchivadas.includes(lista._id);
        
        // Preparar badge para campos especiales si los hay
        let camposEspecialesHTML = '';
        if (lista.camposEspaciales && lista.camposEspaciales.length > 0) {
            camposEspecialesHTML = `<span class="badge bg-info">${lista.camposEspaciales.length} campos</span>`;
        }
        
        col.innerHTML = `
            <div class="card h-100 shadow-sm ${isArchived ? 'bg-light' : ''}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h5 class="card-title">${lista.title}</h5>
                        <div class="dropdown">
                            <button class="btn btn-link text-dark" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="list-detail.html?id=${lista._id}"><i class="fas fa-eye me-2"></i>Ver detalle</a></li>
                                <li><a class="dropdown-item" href="#" data-id="${lista._id}" data-action="edit" data-title="${lista.title}" data-description="${lista.description || ''}"><i class="fas fa-edit me-2"></i>Editar</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" data-id="${lista._id}" data-action="delete"><i class="fas fa-trash me-2"></i>Eliminar</a></li>
                            </ul>
                        </div>
                    </div>
                    <p class="card-text">${lista.description || 'Sin descripción'}</p>
                    <div class="mb-2">
                        <span class="badge bg-primary">Lista</span>
                        <span class="badge bg-success">Activa</span>
                        ${isArchived ? '<span class="badge bg-secondary">Archivada</span>' : ''}
                        ${camposEspecialesHTML}
                    </div>
                    <div class="progress" style="height: 5px;">
                        <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                    </div>
                    <small class="text-muted">0 items - 0% completado</small>
                    
                    <div class="mt-2 d-flex gap-2">
                        <button class="btn btn-sm ${isFavorite ? 'btn-warning' : 'btn-outline-warning'}" 
                                data-id="${lista._id}" 
                                data-action="toggle-favorite" 
                                title="${isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="btn btn-sm ${isArchived ? 'btn-secondary' : 'btn-outline-secondary'}" 
                                data-id="${lista._id}" 
                                data-action="toggle-archive" 
                                title="${isArchived ? 'Desarchivar' : 'Archivar'}">
                            <i class="fas fa-archive"></i>
                        </button>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <small class="text-muted">Última actualización ${timeAgo}</small>
                </div>
            </div>
        `;
        
        // Agregar event listeners a los botones de acción
        setTimeout(() => {
            const actions = col.querySelectorAll('[data-action]');
            actions.forEach(action => {
                action.addEventListener('click', function(e) {
                    e.preventDefault();
                    const id = this.getAttribute('data-id');
                    const actionType = this.getAttribute('data-action');
                    
                    switch(actionType) {
                        case 'edit':
                            const title = this.getAttribute('data-title');
                            const description = this.getAttribute('data-description');
                            editList(id, title, description);
                            break;
                        case 'delete':
                            deleteList(id);
                            break;
                        case 'toggle-favorite':
                            handleToggleFavorite(id, this);
                            break;
                        case 'toggle-archive':
                            handleToggleArchive(id, this);
                            break;
                    }
                });
            });
        }, 0);
        
        return col;
    }
    
    // Función para crear una nueva lista
    async function createNewList() {
        const titleInput = document.getElementById('listTitle');
        const listTitle = titleInput.value.trim();
        const listDescription = document.getElementById('listDescription').value.trim();
        
        // Resetear estado de validación
        titleInput.classList.remove('is-invalid');
        
        if (!listTitle) {
            window.toast.warning('El título es requerido');
            titleInput.classList.add('is-invalid');
            return;
        }
        
        // Mostrar indicador de carga y deshabilitar botón
        createListBtn.disabled = true;
        createListBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando...';
        
        try {
            // Obtener etiquetas seleccionadas
            const tags = Array.from(tagContainer.querySelectorAll('.badge'))
                .map(badge => badge.textContent.trim());
            
            // Enviar solicitud al servidor usando api.js
            const response = await api.createLista({
                title: listTitle,
                description: listDescription,
                tags: tags
            });
            
            if (response.success) {
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('newListModal'));
                modal.hide();
                
                // Limpiar formulario y estado de validación
                newListForm.reset();
                titleInput.classList.remove('is-invalid');
                tagContainer.innerHTML = '';
                
                // Recargar listas
                fetchUserLists();
                
                // Mostrar mensaje de éxito
                window.toast.success('Lista creada', response.message || 'La lista se ha creado correctamente');
            } else {
                // Mostrar errores específicos si existen
                window.toast.danger('Error', response.message || 'Error al crear la lista');
            }
        } catch (error) {
            console.error('Error al crear lista:', error);
            window.toast.danger('Error de conexión', error.message || 'No se pudo conectar con el servidor');
        } finally {
            // Restablecer estado del botón siempre
            createListBtn.disabled = false;
            createListBtn.innerHTML = 'Crear Lista';
        }
    }
    
    // Función para añadir etiquetas
    function addTag() {
        const tagText = tagInput.value.trim();
        
        if (tagText) {
            // Verificar si la etiqueta ya existe
            const existingTags = Array.from(tagContainer.querySelectorAll('.badge'))
                .map(badge => badge.textContent.trim());
                
            if (!existingTags.includes(tagText)) {
                const badge = document.createElement('span');
                badge.className = 'badge bg-primary me-1 mb-1';
                badge.innerHTML = `${tagText} <i class="fas fa-times ms-1" role="button"></i>`;
                tagContainer.appendChild(badge);
                
                // Agregar evento para eliminar
                const removeIcon = badge.querySelector('i');
                removeIcon.addEventListener('click', function() {
                    badge.remove();
                });
            }
            
            // Limpiar input
            tagInput.value = '';
            tagInput.focus();
        }
    }
    
    // Función para cerrar sesión
    function logout() {
        // Eliminar token y datos de usuario
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirigir al login
        window.location.href = 'index.html';
    }
    
    // Función auxiliar para calcular tiempo transcurrido
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) return `hace ${interval} años`;
        if (interval === 1) return `hace 1 año`;
        
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return `hace ${interval} meses`;
        if (interval === 1) return `hace 1 mes`;
        
        interval = Math.floor(seconds / 86400);
        if (interval > 1) return `hace ${interval} días`;
        if (interval === 1) return `hace 1 día`;
        
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return `hace ${interval} horas`;
        if (interval === 1) return `hace 1 hora`;
        
        interval = Math.floor(seconds / 60);
        if (interval > 1) return `hace ${interval} minutos`;
        if (interval === 1) return `hace 1 minuto`;
        
        return 'hace unos segundos';
    }
    
    // Función para eliminar una lista
    async function deleteList(id) {
        if (!confirm('¿Estás seguro que deseas eliminar esta lista?')) {
            return;
        }
        
        // Deshabilitar botones de acción para esta lista
        const deleteBtn = document.querySelector(`button[data-id="${id}"][data-action="delete"]`);
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
        }
        
        try {
            const response = await api.deleteLista(id);
            
            if (response.success) {
                // Recargar listas para actualizar la UI
                fetchUserLists();
                
                // Mostrar mensaje de éxito
                window.toast.success('Lista eliminada', response.message || 'La lista se ha eliminado correctamente');
            } else {
                window.toast.danger('Error', response.message || 'Error al eliminar la lista');
            }
        } catch (error) {
            console.error('Error al eliminar lista:', error);
            window.toast.danger('Error de conexión', error.message || 'No se pudo conectar con el servidor');
        } finally {
            // Re-habilitar botón si no se recargó la UI
            if (deleteBtn) {
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            }
        }
    }
    
    // Función para obtener los datos completos de una lista
    async function fetchListDetails(listId) {
        try {
            const response = await api.getLista(listId);
            if (response.success) {
                return response.lista;
            }
            return null;
        } catch (error) {
            console.error('Error al obtener detalles de la lista:', error);
            return null;
        }
    }

    // Función para editar una lista
    async function editList(listId, currentTitle, currentDescription) {
        console.log('Editando lista con ID:', listId, 'Título:', currentTitle, 'Descripción:', currentDescription);
        
        // Llenar el formulario con los datos actuales
        document.getElementById('editListId').value = listId;
        document.getElementById('editListTitle').value = currentTitle || '';
        document.getElementById('editListDescription').value = currentDescription || '';
        
        // Limpiar contenedor de campos especiales
        camposEspecialesContainer.innerHTML = '';
        
        // Obtener datos completos de la lista para recuperar los campos especiales
        try {
            const lista = await fetchListDetails(listId);
            if (lista && lista.camposEspaciales) {
                // Renderizar los campos especiales existentes
                renderCamposEspecialesDefinidos(lista.camposEspaciales);
            }
        } catch (error) {
            console.error('Error al cargar campos especiales:', error);
        }
        
        // Mostrar el modal
        const editListModal = new bootstrap.Modal(document.getElementById('editListModal'));
        editListModal.show();
    }
    
    // Función para renderizar campos especiales definidos
    function renderCamposEspecialesDefinidos(camposEspaciales) {
        camposEspecialesContainer.innerHTML = '';
        
        if (!camposEspaciales || camposEspaciales.length === 0) {
            // Si no hay campos especiales, mostrar un mensaje
            camposEspecialesContainer.innerHTML = '<p class="text-muted">No hay campos especiales definidos</p>';
            return;
        }
        
        // Renderizar cada campo especial
        camposEspaciales.forEach(campo => {
            const campoItem = document.createElement('div');
            campoItem.className = 'campo-especial-item d-flex align-items-center mb-2 p-2 border rounded';
            
            // Crear etiqueta para mostrar la información del campo
            campoItem.innerHTML = `
                <div class="flex-grow-1">
                    <strong>${campo.nombre}</strong>
                    <span class="badge bg-secondary ms-2">${campo.tipo}</span>
                    ${campo.requerido ? '<span class="badge bg-danger ms-1">Requerido</span>' : ''}
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger delete-campo-especial">
                    <i class="fas fa-times"></i>
                </button>
                <input type="hidden" class="campo-especial-nombre" value="${campo.nombre}">
                <input type="hidden" class="campo-especial-tipo" value="${campo.tipo}">
                <input type="hidden" class="campo-especial-requerido" value="${campo.requerido}">
            `;
            
            camposEspecialesContainer.appendChild(campoItem);
        });
    }
    
    // Función para añadir un nuevo campo especial
    function addCampoEspecial() {
        // Eliminar mensaje de no hay campos si existe
        const noFieldsMsg = camposEspecialesContainer.querySelector('p.text-muted');
        if (noFieldsMsg) {
            noFieldsMsg.remove();
        }
        
        // Crear un nuevo elemento para el campo especial
        const campoItem = document.createElement('div');
        campoItem.className = 'campo-especial-item d-flex align-items-center mb-2 p-2 border rounded';
        
        // Generar inputs para nombre y tipo
        campoItem.innerHTML = `
            <div class="flex-grow-1 me-2">
                <div class="mb-1">
                    <input type="text" class="form-control form-control-sm campo-especial-nombre" 
                           placeholder="Nombre del campo" required>
                </div>
                <div class="d-flex align-items-center">
                    <select class="form-select form-select-sm campo-especial-tipo me-2">
                        <option value="texto">Texto</option>
                        <option value="numero">Número</option>
                        <option value="fecha">Fecha</option>
                        <option value="booleano">Booleano</option>
                    </select>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input campo-especial-requerido" id="campo${Date.now()}">
                        <label class="form-check-label small" for="campo${Date.now()}">Requerido</label>
                    </div>
                </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger delete-campo-especial">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        camposEspecialesContainer.appendChild(campoItem);
        
        // Enfocar en el input de nombre
        campoItem.querySelector('.campo-especial-nombre').focus();
    }
    
    // Función para recolectar los campos especiales del formulario
    function recolectarCamposEspeciales() {
        const camposEspeciales = [];
        const camposElements = camposEspecialesContainer.querySelectorAll('.campo-especial-item');
        
        camposElements.forEach(campoElement => {
            // Obtener los valores dependiendo de si es un campo editado o nuevo
            let nombre, tipo, requerido;
            
            const nombreInput = campoElement.querySelector('.campo-especial-nombre');
            const tipoInput = campoElement.querySelector('.campo-especial-tipo');
            const requeridoInput = campoElement.querySelector('.campo-especial-requerido');
            
            if (nombreInput.tagName === 'INPUT' && nombreInput.type === 'text') {
                // Es un campo nuevo
                nombre = nombreInput.value.trim();
                tipo = tipoInput.value;
                requerido = requeridoInput.checked;
            } else {
                // Es un campo existente (valores en inputs ocultos)
                nombre = campoElement.querySelector('input.campo-especial-nombre').value;
                tipo = campoElement.querySelector('input.campo-especial-tipo').value;
                requerido = campoElement.querySelector('input.campo-especial-requerido').value === 'true';
            }
            
            // Solo añadir si tiene nombre
            if (nombre) {
                camposEspeciales.push({
                    nombre,
                    tipo,
                    requerido
                });
            }
        });
        
        return camposEspeciales;
    }
    
    // Función para guardar cambios de una lista editada
    async function saveEditList() {
        // Obtener valores del formulario
        const id = document.getElementById('editListId').value;
        const title = document.getElementById('editListTitle').value.trim();
        const description = document.getElementById('editListDescription').value.trim();
        
        // Recolectar campos especiales
        const camposEspaciales = recolectarCamposEspeciales();
        
        // Validar datos
        if (!title) {
            window.toast.warning('Validación', 'El título de la lista es obligatorio');
            return;
        }
        
        // Obtener referencia al botón para mostrar estados
        const saveButton = document.getElementById('saveEditListBtn');
        
        try {
            // Mostrar indicador visual
            const originalButtonText = saveButton.innerHTML;
            saveButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
            saveButton.disabled = true;
            
            console.log('Guardando cambios de lista:', { id, title, description, camposEspaciales });
            
            // Preparar datos para actualizar
            const listData = {
                title,
                description,
                camposEspaciales
            };
            
            // Llamar a la API para actualizar
            const res = await api.updateLista(id, listData);
            console.log('Respuesta de updateLista:', res);
            
            if (res.success) {
                // Cerrar modal
                const editListModal = bootstrap.Modal.getInstance(document.getElementById('editListModal'));
                editListModal.hide();
                
                // Recargar listas para mostrar los cambios
                fetchUserLists();
                
                // Mostrar mensaje de éxito
                window.toast.success('Lista actualizada', 'La lista se ha actualizado correctamente');
            } else {
                window.toast.danger('Error', res.message || 'Error al actualizar la lista');
            }
        } catch (error) {
            console.error('Error al actualizar lista:', error);
            window.toast.danger('Error de conexión', 'No se pudo conectar con el servidor');
        } finally {
            // Restablecer estado del botón
            saveButton.innerHTML = 'Guardar Cambios';
            saveButton.disabled = false;
        }
    }
    
    // Función para mostrar errores
    function showError(message) {
        listsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>${message}
                </div>
            </div>
        `;
    }
    
    // Simulación de llegada de notificaciones de ejemplo (usando el nuevo sistema)
    setTimeout(() => {
        window.createNotification({
            title: 'Actualización de lista',
            message: 'Carlos actualizó la lista "Proyectos prioritarios"',
            type: 'info'
        });
    }, 30000);
    
    setTimeout(() => {
        window.createNotification({
            title: 'Recordatorio',
            message: 'El informe mensual vence mañana',
            type: 'warning'
        });
    }, 60000);

    // Función para marcar/desmarcar una lista como favorita
    async function handleToggleFavorite(listId, buttonElement) {
        // Deshabilitar botón durante la operación
        if (buttonElement) {
            buttonElement.disabled = true;
            const icon = buttonElement.querySelector('i');
            const originalIcon = icon.className;
            icon.className = 'fas fa-spinner fa-spin';
        }
        
        try {
            const response = await api.toggleFavorita(listId);
            
            if (response.success) {
                // Actualizar interfaz
                if (buttonElement) {
                    const icon = buttonElement.querySelector('i');
                    
                    if (response.esFavorita) {
                        icon.className = 'fas fa-star text-warning';
                        buttonElement.setAttribute('title', 'Quitar de favoritos');
                    } else {
                        icon.className = 'far fa-star';
                        buttonElement.setAttribute('title', 'Añadir a favoritos');
                    }
                }
                
                // Mostrar mensaje
                window.toast.success(
                    response.esFavorita ? 'Añadida a favoritos' : 'Quitada de favoritos',
                    response.message
                );
            } else {
                window.toast.danger('Error', response.message || 'Error al cambiar estado de favoritos');
                
                // Restaurar icono original en caso de error
                if (buttonElement) {
                    const icon = buttonElement.querySelector('i');
                    icon.className = 'far fa-star';
                }
            }
        } catch (error) {
            console.error('Error al cambiar favoritos:', error);
            window.toast.danger('Error de conexión', error.message || 'No se pudo conectar con el servidor');
            
            // Restaurar icono original en caso de error
            if (buttonElement) {
                const icon = buttonElement.querySelector('i');
                icon.className = 'far fa-star';
            }
        } finally {
            // Siempre re-habilitamos el botón
            if (buttonElement) {
                buttonElement.disabled = false;
            }
        }
    }
    
    // Función para manejar el toggle de archivado
    async function handleToggleArchive(listId, buttonElement) {
        console.log('[Handler Archivo Inicio]', { listId, buttonElement });
        console.log('Contenido Original:', buttonElement.innerHTML);
        buttonElement.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
        buttonElement.disabled = true;
        
        try {
            console.log('Modificando estado de archivo para lista:', listId);
            console.log('Llamando a API...');
            
            // Llamar a la API
            const response = await api.toggleArchive(listId);
            console.log('Respuesta API recibida:', response);
            
            // Actualizar el user en localStorage
            if (response.success && response.user) {
                console.log('API call exitosa, actualizando estado...');
                localStorage.setItem('user', JSON.stringify(response.user));
                
                // Actualizar la variable user para la sesión actual
                Object.assign(user, response.user);
                
                // Actualizar UI - cambiar clase del botón
                buttonElement.classList.toggle('btn-secondary');
                buttonElement.classList.toggle('btn-outline-secondary');
                buttonElement.title = response.isArchived ? 'Desarchivar' : 'Archivar';
                
                // Recargar la vista actual para reflejar el cambio en el filtrado
                fetchUserLists();
                
                // Mostrar notificación
                window.toast.success('Éxito', response.message);
            } else {
                console.log('API call fallida (respuesta):', response?.message);
                window.toast.danger('Error', response.message || 'Error al cambiar estado de archivo');
            }
        } catch (error) {
            console.log('Error en API call (catch):', error);
            console.error('Error al modificar archivo:', error);
            window.toast.danger('Error', 'Error de conexión al servidor');
        } finally {
            console.log('Entrando a finally...');
            // Restaurar icono de archivo directamente
            buttonElement.innerHTML = '<i class="fas fa-archive"></i>';
            buttonElement.disabled = false;
            console.log('Botón restaurado en finalmente.');
        }
    }
}); 