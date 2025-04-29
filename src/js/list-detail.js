// List Detail JavaScript
console.log('Cargando script list-detail.js');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado en list-detail.js');
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
    
    if (!token) {
        // Redirigir al login si no hay token
        window.location.href = 'index.html';
        return;
    }
    
    // Obtener ID de la lista de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('id');
    console.log('List ID a buscar:', listId);
    
    if (!listId) {
        // Redirigir al dashboard si no hay ID de lista
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Referencias a elementos del DOM
    const listTitle = document.getElementById('listTitle');
    const listDescription = document.getElementById('listDescription');
    const itemsList = document.getElementById('itemsList');
    const addItemForm = document.getElementById('addItemForm');
    const newItemInput = document.getElementById('newItemInput');
    const shareListBtn = document.getElementById('shareListBtn');
    const exportListBtn = document.getElementById('exportListBtn');
    const deleteListBtn = document.getElementById('deleteListBtn');
    const editTitleBtn = document.getElementById('editTitleBtn');
    const selectCustomView = document.getElementById('selectCustomView');
    const currentViewName = document.getElementById('currentViewName');
    
    // References for managing shared collaborators
    const addCollaboratorBtn = document.getElementById('addCollaboratorBtn');
    const sharedWithList = document.getElementById('sharedWithList');
    const manageCollaboratorsBtn = document.getElementById('manageCollaboratorsBtn');
    const manageCollaboratorList = document.getElementById('manageCollaboratorList');
    const manageCollaboratorsModal = new bootstrap.Modal(document.getElementById('manageCollaboratorsModal'));
    const inviteCollaboratorModal = new bootstrap.Modal(document.getElementById('inviteCollaboratorModal'));
    const sendInviteModalBtn = document.getElementById('sendInviteModalBtn');
    
    // Variable para almacenar la instancia de Sortable
    let sortableList;
    
    // Variables para el modal editor de ítems
    const itemEditorModal = new bootstrap.Modal(document.getElementById('itemEditorModal'));
    const itemEditorForm = document.getElementById('itemEditorForm');
    const itemIdInput = document.getElementById('itemId');
    const itemTitleInput = document.getElementById('itemTitle');
    const itemDescriptionInput = document.getElementById('itemDescription');
    const itemEstadoSelect = document.getElementById('itemEstado');
    const itemImageUrlInput = document.getElementById('itemImageUrl');
    const etiquetasCheckboxesContainer = document.getElementById('etiquetasCheckboxes');
    const etiquetasSeleccionadasContainer = document.getElementById('etiquetasSeleccionadas');
    const itemValoresCamposEspecialesContainer = document.getElementById('itemValoresCamposEspecialesContainer');
    const saveItemBtn = document.getElementById('saveItemBtn');
    const itemEditorTitle = document.getElementById('itemEditorTitle');
    
    // Variables globales para almacenar datos
    let todasLasEtiquetas = [];
    let listaActual = null; // Variable para almacenar los datos de la lista, incluidos los campos especiales
    let selectedViewId = null; // Variable para almacenar el ID de la vista seleccionada
    let currentView = null; // Variable para almacenar la vista seleccionada
    
    // Cargar datos de la lista y vistas personalizadas
    fetchListDetails();
    loadCustomViews();
    
    // Event listeners
    addItemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // En lugar de crear directamente, abrimos el modal en modo creación
        openCreateItemModal();
    });
    
    saveItemBtn.addEventListener('click', saveItemFromModal);
    
    // Event listener para cambiar la vista personalizada
    if (selectCustomView) {
        selectCustomView.addEventListener('click', function(e) {
            const target = e.target.closest('.dropdown-item');
            if (!target) return;
            const viewId = target.getAttribute('data-view-id');
            // Si no hay viewId, es el enlace 'Crear Nueva Vista', permitir navegación
            if (!viewId) {
                return;
            }
            e.preventDefault();
            // No hacer nada si se hizo clic en el ítem activo
            if (target.classList.contains('active')) return;
            // Actualizar vista seleccionada
            applyCustomView(viewId);
            // Actualizar clases active
            document.querySelectorAll('#selectCustomView .dropdown-item').forEach(item => {
                item.classList.remove('active');
            });
            target.classList.add('active');
            // Actualizar el nombre visible de la vista en la UI
            if (viewId === 'default') {
                currentViewName.textContent = 'Por defecto';
            }
        });
    }
    
    shareListBtn.addEventListener('click', function() {
        // Mostrar modal de compartir
        const shareModal = new bootstrap.Modal(document.getElementById('shareModal'));
        
        // Renderizar los colaboradores actuales
        if (listaActual && listaActual.colaboradores) {
            renderSharedWith(listaActual.colaboradores);
        }
        
        shareModal.show();
    });
    
    exportListBtn.addEventListener('click', function() {
        exportList();
    });
    
    deleteListBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas eliminar esta lista? Esta acción no se puede deshacer.')) {
            deleteList();
        }
    });
    
    editTitleBtn.addEventListener('click', function() {
        editListTitle();
    });
    
    // Listener para añadir colaborador (ahora solo abre el modal)
    addCollaboratorBtn.addEventListener('click', () => {
        // Mostrar el modal de invitación
        inviteCollaboratorModal.show();
    });
    
    // Nuevo listener para el botón de enviar invitación del modal
    sendInviteModalBtn.addEventListener('click', async () => {
        // Obtener los valores del modal
        const emailOrUsername = document.getElementById('inviteModalEmailOrUsername').value.trim();
        const permisoElements = document.querySelectorAll('input[name="inviteModalPermission"]');
        let permiso = 'ver'; // Valor por defecto
        
        // Obtener el permiso seleccionado
        for (const radioButton of permisoElements) {
            if (radioButton.checked) {
                permiso = radioButton.value;
                break;
            }
        }
        
        // Validar que el email/username no esté vacío
        if (!emailOrUsername) {
            showToast('Debes ingresar un email o nombre de usuario', 'error');
            return;
        }
        
        try {
            // Llamar a la API para invitar al colaborador
            const response = await window.api.inviteCollaborator(listId, emailOrUsername, permiso);
            
            if (response.success) {
                // Cerrar el modal
                inviteCollaboratorModal.hide();
                
                // Actualizar los datos de la lista
                const listResponse = await window.api.getLista(listId);
                if (listResponse.success) {
                    listaActual = listResponse.lista;
                    // Renderizar la sección de colaboradores
                    renderSharedWith(listaActual.colaboradores);
                }
                
                // Limpiar el campo de email/username
                document.getElementById('inviteModalEmailOrUsername').value = '';
                
                // Mostrar mensaje de éxito
                showToast('Invitación enviada con éxito', 'success');
            } else {
                showToast(response.message || 'Error al invitar', 'error');
            }
        } catch (error) {
            console.error('Error al invitar colaborador:', error);
            showToast('Error al invitar colaborador', 'error');
        }
    });
    
    // Función para obtener detalles de la lista
    async function fetchListDetails() {
        try {
            // Mostrar indicador de carga
            const loadingHtml = `
                <div class="d-flex justify-content-center my-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>
            `;
            itemsList.innerHTML = loadingHtml;
            
            console.log('Objeto api disponible:', window.api);
            console.log('Intentando llamar a la API para obtener detalles/items...');
            
            // Cargar todas las etiquetas disponibles para uso posterior
            await fetchAllEtiquetas();
            
            // CORRECCIÓN: Usar window.api en lugar de apiRequest directamente
            // Verificar si existe el método getLista o si debemos usar otro método
            if (window.api.getLista) {
                const response = await window.api.getLista(listId);
                console.log('Respuesta de getLista:', response);
                
                if (response.success) {
                    // Guardar la lista completa en la variable global
                    listaActual = response.lista;
                    
                    // Actualizar información de la lista
                    updateListInfo(response.lista);
                    
                    // Renderizar sección 'Compartido con'
                    renderSharedWith(listaActual.colaboradores);
                    
                    // Mostrar u ocultar botón de gestionar colaboradores según propietario
                    const manageBtn = document.getElementById('manageCollaboratorsBtn');
                    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
                    // Intenta obtener el ID de usuario, considerando tanto _id como id
                    const currentUserId = userObj?._id || userObj?.id;
                    const ownerUserId = listaActual?.userId?.toString();
                    console.log('Control de visibilidad botón Gestionar - Usuario actual:', currentUserId);
                    console.log('Objeto de usuario completo:', userObj);
                    console.log('Control de visibilidad botón Gestionar - Propietario:', ownerUserId);
                    
                    if (manageBtn) { // Asegurarse de que el botón existe
                        if (ownerUserId && currentUserId && ownerUserId === currentUserId) {
                            manageBtn.style.display = ''; // Mostrar si es dueño
                            console.log('Mostrando botón Gestionar (dueño)');
                        } else {
                            manageBtn.style.display = 'none'; // Ocultar si no es dueño
                            console.log('Ocultando botón Gestionar (no dueño)');
                        }
                    } else {
                        console.warn('Botón de gestionar colaboradores no encontrado en el DOM');
                    }
                    
                    // Cargar y renderizar ítems según la vista seleccionada
                    fetchAndRenderItems();
                } else {
                    showError('Error al cargar los detalles de la lista');
                }
            } else {
                console.error('El método window.api.getLista no está disponible');
                showError('Error: API no configurada correctamente');
            }
        } catch (error) {
            console.error('Error al obtener detalles de la lista:', error);
            showError('Error de conexión al servidor');
        }
    }
    
    // Función para cargar y renderizar ítems de acuerdo a la vista seleccionada
    async function fetchAndRenderItems() {
        try {
            let response;
            
            // Mostrar indicador de carga
            const loadingHtml = `
                <div class="d-flex justify-content-center my-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>
            `;
            itemsList.innerHTML = loadingHtml;
            
            console.log('Actualizando ítems con vista:', selectedViewId);
            
            // Si hay una vista personalizada seleccionada, aplicarla
            if (selectedViewId && selectedViewId !== 'default') {
                // Solo si tenemos currentView con sus filtros, usamos getItemsFiltered
                if (currentView && (currentView.filtros || currentView.ordenamientos)) {
                    console.log('Aplicando filtros:', currentView.filtros);
                    console.log('Aplicando ordenamientos:', currentView.ordenamientos);
                    
                    response = await window.api.getItemsFiltered(
                        listId, 
                        currentView.filtros, 
                        currentView.ordenamientos
                    );
                } else {
                    // Si no se pudo cargar la vista personalizada o no tiene filtros/ordenamientos,
                    // intentemos cargarla de nuevo
                    try {
                        const viewResponse = await window.api.getCustomView(selectedViewId);
                        if (viewResponse.success) {
                            currentView = viewResponse.vista;
                            
                            // Con la vista cargada, ahora usamos getItemsFiltered
                            response = await window.api.getItemsFiltered(
                                listId, 
                                currentView.filtros, 
                                currentView.ordenamientos
                            );
                        } else {
                            // Si falla, fallback a la vista por defecto
                            console.warn('No se pudo cargar la vista personalizada, usando vista por defecto');
                            response = await window.api.getLista(listId);
                        }
                    } catch (error) {
                        console.error('Error al cargar vista personalizada:', error);
                        // Fallback a vista por defecto
                        response = await window.api.getLista(listId);
                    }
                }
            } else {
                // Vista por defecto: obtener todos los ítems sin filtros
                console.log('Usando vista por defecto');
                response = await window.api.getLista(listId);
            }
            
            if (response.success) {
                // Renderizar ítems
                renderItems(response.items);
                
                // Actualizar barra de progreso
                updateProgress(response.items);
            } else {
                showError('Error al cargar los ítems de la lista');
            }
        } catch (error) {
            console.error('Error al cargar ítems:', error);
            showError('Error de conexión al servidor');
        }
    }
    
    // Cargar vistas personalizadas del usuario
    async function loadCustomViews() {
        try {
            const response = await window.api.getCustomViews();
            
            if (response.success && response.vistas.length > 0) {
                // Renderizar las vistas en el dropdown
                renderCustomViews(response.vistas);
            } else {
                console.log('No hay vistas personalizadas disponibles');
            }
        } catch (error) {
            console.error('Error al cargar vistas personalizadas:', error);
        }
    }
    
    // Renderizar vistas personalizadas en el dropdown
    function renderCustomViews(vistas) {
        if (!selectCustomView) return;

        // Encontrar el <li> separador que contiene el <hr>
        const separatorLi = selectCustomView.querySelector('li > hr.dropdown-divider')?.closest('li');
        const createNewLi = selectCustomView.querySelector('li:last-child');

        // Limpiar vistas dinámicas, conservar solo vista por defecto, separatorLi y createNewLi
        Array.from(selectCustomView.children).forEach(child => {
            if (
                !child.querySelector('[data-view-id="default"]')
                && child !== separatorLi
                && child !== createNewLi
            ) {
                selectCustomView.removeChild(child);
            }
        });

        // Añadir cada vista como un ítem del dropdown antes del separatorLi
        vistas.forEach(vista => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a class="dropdown-item" href="#" data-view-id="${vista._id}">
                    <i class="fas fa-filter me-2"></i>${vista.nombre}
                </a>
            `;

            if (separatorLi) {
                selectCustomView.insertBefore(listItem, separatorLi);
            } else {
                // Fallback: insertar antes de 'Crear Nueva Vista'
                selectCustomView.insertBefore(listItem, createNewLi);
            }
        });
    }
    
    // Aplicar vista personalizada
    async function applyCustomView(viewId) {
        try {
            selectedViewId = viewId;
            
            if (viewId === 'default' || !viewId) {
                // Restaurar vista por defecto
                currentView = null;
                currentViewName.textContent = 'Por defecto';
                
                // Recargar ítems
                fetchAndRenderItems();
            } else {
                // Cargar detalles de la vista seleccionada
                const response = await window.api.getCustomView(viewId);
                
                if (response.success) {
                    // Guardar la vista actual
                    currentView = response.vista;
                    
                    // Actualizar nombre de la vista actual
                    currentViewName.textContent = currentView.nombre;
                    
                    // Log para depuración
                    console.log('Vista cargada:', currentView);
                    console.log('Filtros:', currentView.filtros);
                    console.log('Ordenamientos:', currentView.ordenamientos);
                    
                    // Recargar ítems con los nuevos filtros
                    fetchAndRenderItems();
                } else {
                    showToast('Error al aplicar la vista personalizada', 'danger');
                }
            }
        } catch (error) {
            console.error('Error al aplicar vista personalizada:', error);
            showToast('Error de conexión al servidor', 'danger');
        }
    }
    
    // Función para cargar todas las etiquetas
    async function fetchAllEtiquetas() {
        try {
            const response = await window.api.getEtiquetas();
            
            if (response.success) {
                todasLasEtiquetas = response.etiquetas;
                console.log('Etiquetas cargadas:', todasLasEtiquetas);
            } else {
                console.error('Error al cargar etiquetas:', response.message);
            }
        } catch (error) {
            console.error('Error al cargar etiquetas:', error);
        }
    }
    
    // Función para actualizar información de la lista
    function updateListInfo(lista) {
        // Actualizar título y descripción
        listTitle.textContent = lista.title;
        listDescription.textContent = lista.description || 'Sin descripción';
        
        // Actualizar metadatos si existen los elementos
        const createdElement = document.querySelector('dd:nth-of-type(1)');
        const modifiedElement = document.querySelector('dd:nth-of-type(2)');
        
        if (createdElement) {
            createdElement.textContent = getTimeAgo(new Date(lista.createdAt));
        }
        
        if (modifiedElement) {
            modifiedElement.textContent = getTimeAgo(new Date(lista.updatedAt));
        }
    }
    
    // Función para renderizar ítems
    function renderItems(items) {
        // Limpiar lista
        itemsList.innerHTML = '';
        
        if (items.length === 0) {
            // Mostrar mensaje si no hay ítems
            itemsList.innerHTML = `
                <div class="list-group-item text-center text-muted py-5">
                    <i class="fas fa-inbox fa-3x mb-3"></i>
                    <p>No hay ítems en esta lista</p>
                    <p>Comienza agregando tu primer ítem arriba</p>
                </div>
            `;
            return;
        }
        
        // Ordenar ítems: completados al final
        items.sort((a, b) => {
            if (a.estado === 'completado' && b.estado !== 'completado') return 1;
            if (a.estado !== 'completado' && b.estado === 'completado') return -1;
            return 0;
        });
        
        // Renderizar cada ítem
        items.forEach(item => {
            const itemElement = createItemElement(item);
            itemsList.appendChild(itemElement);
        });
        
        // Inicializar el drag & drop con Sortable.js
        initSortable();
    }
    
    // Inicializar la funcionalidad de drag & drop
    function initSortable() {
        // Destruir la instancia anterior si existe
        if (sortableList) {
            sortableList.destroy();
        }
        
        // Crear nueva instancia de Sortable
        sortableList = new Sortable(itemsList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            handle: '.drag-handle', // Selector para el área donde se puede arrastrar
            onEnd: function(evt) {
                // Esta función se llama cuando termina un drag & drop
                saveItemsOrder();
                
                // Mostrar feedback visual
                showToast('Orden de ítems actualizado', 'success');
                
                // Añadir animación al elemento movido
                const item = evt.item;
                item.classList.add('bg-light');
                setTimeout(() => {
                    item.classList.remove('bg-light');
                }, 1000);
            }
        });
    }
    
    // Guardar el nuevo orden de los ítems (simulado)
    function saveItemsOrder() {
        // En una implementación real, aquí enviaríamos el nuevo orden al servidor
        // Por ahora solo obtenemos el orden actual para fines de demostración
        const items = Array.from(itemsList.querySelectorAll('.list-group-item'))
            .filter(el => !el.querySelector('.text-muted.py-5')) // Excluir mensaje vacío
            .map(el => {
                const id = el.querySelector('[data-id]').getAttribute('data-id');
                return { id };
            });
        
        console.log('Nuevo orden de ítems:', items);
    }
    
    // Función para crear elemento de ítem
    function createItemElement(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'list-group-item list-group-item-action';
        
        const isCompleted = item.estado === 'completado';
        // Asegurar que usamos el formato correcto del id para MongoDB (_id)
        const itemId = item._id || item.id;
        
        // Generar HTML para las etiquetas
        let etiquetasHtml = '';
        if (Array.isArray(item.etiquetas) && item.etiquetas.length > 0) {
            etiquetasHtml = item.etiquetas.map(tag => {
                // Determinar si es un objeto completo o solo un ID
                const nombre = typeof tag === 'object' ? tag.nombre : tag;
                const color = typeof tag === 'object' && tag.color ? tag.color : '#007bff';
                return `<span class="badge me-1" style="background-color: ${color};">${nombre}</span>`;
            }).join('');
        }
        
        // Generar HTML para los valores de campos especiales
        let camposEspecialesHtml = '';
        if (item.valoresCamposEspaciales && Object.keys(item.valoresCamposEspaciales).length > 0) {
            camposEspecialesHtml = '<div class="mt-2 small"><strong>Campos Especiales:</strong> ';
            
            // Obtener la definición de los campos especiales de la lista padre
            const camposDefinidos = listaActual && listaActual.camposEspaciales ? 
                listaActual.camposEspaciales : [];
            
            // Crear un map de las definiciones para fácil acceso
            const camposMap = {};
            camposDefinidos.forEach(campo => {
                camposMap[campo.nombre] = campo.tipo;
            });
            
            // Mostrar los valores de los campos especiales
            camposEspecialesHtml += Object.entries(item.valoresCamposEspaciales)
                .map(([nombre, valor]) => {
                    // Formatear el valor según el tipo definido en la lista
                    let valorFormateado = valor;
                    
                    if (camposMap[nombre]) {
                        switch (camposMap[nombre]) {
                            case 'fecha':
                                try {
                                    valorFormateado = new Date(valor).toLocaleDateString();
                                } catch (e) {
                                    console.error('Error al formatear fecha:', e);
                                }
                                break;
                            case 'booleano':
                                valorFormateado = valor ? 'Sí' : 'No';
                                break;
                        }
                    }
                    
                    return `<span class="text-muted me-2">${nombre}: ${valorFormateado}</span>`;
                })
                .join(' ');
                
            camposEspecialesHtml += '</div>';
        }
        
        itemElement.innerHTML = `
            <div class="d-flex w-100 justify-content-between align-items-center">
                <div class="form-check d-flex align-items-center">
                    <span class="drag-handle me-2 text-muted" title="Arrastrar para reordenar">
                        <i class="fas fa-grip-vertical"></i>
                    </span>
                    <input class="form-check-input me-2" type="checkbox" ${isCompleted ? 'checked' : ''} 
                           data-id="${itemId}" data-action="toggle-status">
                    <label class="form-check-label ${isCompleted ? 'text-decoration-line-through text-muted' : ''}">
                        ${item.title}
                    </label>
                </div>
                <div class="btn-group">
                    <button class="btn btn-sm btn-link text-primary" data-id="${itemId}" data-action="edit-item">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-link text-danger" data-id="${itemId}" data-action="delete-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${item.description ? `<p class="mb-1 small text-muted">${item.description}</p>` : ''}
            <div class="mt-1">
                ${etiquetasHtml}
                <span class="badge bg-${getStatusBadgeClass(item.estado)}">${getStatusText(item.estado)}</span>
            </div>
            ${camposEspecialesHtml}
        `;
        
        // Agregar event listeners
        const toggleCheckbox = itemElement.querySelector('[data-action="toggle-status"]');
        const editBtn = itemElement.querySelector('[data-action="edit-item"]');
        const deleteBtn = itemElement.querySelector('[data-action="delete-item"]');
        
        toggleCheckbox.addEventListener('change', function() {
            toggleItemStatus(itemId, this.checked);
        });
        
        editBtn.addEventListener('click', function() {
            editItem(itemId);
        });
        
        deleteBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que deseas eliminar este ítem?')) {
                deleteItem(itemId);
            }
        });
        
        return itemElement;
    }
    
    // Función para abrir modal en modo creación
    function openCreateItemModal() {
        // Limpiar formulario
        itemEditorForm.reset();
        itemIdInput.value = '';
        itemTitleInput.value = '';
        itemDescriptionInput.value = '';
        itemEstadoSelect.value = 'pendiente';
        itemImageUrlInput.value = '';
        
        // Cambiar título del modal
        itemEditorTitle.textContent = 'Crear Nuevo Item';
        
        // Cargar etiquetas disponibles
        renderEtiquetasEnModal([]);
        
        // Generar inputs para los campos especiales definidos en la lista
        renderCamposEspecialesEnModal({});
        
        // Abrir modal
        itemEditorModal.show();
        
        // Enfocar el primer campo
        setTimeout(() => {
            itemTitleInput.focus();
        }, 500);
    }
    
    // Función para abrir modal en modo edición
    async function editItem(itemId) {
        try {
            // Mostrar spinner o indicador de carga en el modal
            itemEditorTitle.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cargando...';
            itemEditorModal.show();
            
            // Cargar datos del ítem
            const response = await window.api.getItem(itemId);
            
            if (response.success) {
                const item = response.item;
                
                // Llenar formulario con datos
                itemIdInput.value = item._id;
                itemTitleInput.value = item.title || '';
                itemDescriptionInput.value = item.description || '';
                itemEstadoSelect.value = item.estado || 'pendiente';
                itemImageUrlInput.value = item.imagenUrl || '';
                
                // Cambiar título del modal
                itemEditorTitle.textContent = 'Editar Item';
                
                // Cargar y preseleccionar etiquetas
                const etiquetasIds = Array.isArray(item.etiquetas) 
                    ? item.etiquetas.map(etiqueta => typeof etiqueta === 'object' ? etiqueta._id : etiqueta)
                    : [];
                
                renderEtiquetasEnModal(etiquetasIds);
                
                // Cargar y preseleccionar valores de campos especiales
                renderCamposEspecialesEnModal(item.valoresCamposEspaciales || {});
            } else {
                console.error('Error al cargar ítem:', response.message);
                itemEditorModal.hide();
                showToast('Error al cargar el ítem', 'error');
            }
        } catch (error) {
            console.error('Error al editar ítem:', error);
            itemEditorModal.hide();
            showToast('Error al cargar el ítem', 'error');
        }
    }
    
    // Función para renderizar etiquetas en el modal
    function renderEtiquetasEnModal(selectedIds) {
        etiquetasCheckboxesContainer.innerHTML = '';
        
        if (!todasLasEtiquetas || todasLasEtiquetas.length === 0) {
            etiquetasCheckboxesContainer.innerHTML = '<p class="text-muted">No hay etiquetas disponibles</p>';
            return;
        }
        
        // Ordenar etiquetas por nombre
        const etiquetasOrdenadas = [...todasLasEtiquetas].sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        // Renderizar cada etiqueta como un checkbox
        etiquetasOrdenadas.forEach(etiqueta => {
            const isChecked = selectedIds.includes(etiqueta._id);
            
            const etiquetaElement = document.createElement('div');
            etiquetaElement.className = 'form-check form-check-inline mb-2';
            etiquetaElement.innerHTML = `
                <input class="form-check-input" type="checkbox" id="etiqueta-${etiqueta._id}" 
                       value="${etiqueta._id}" ${isChecked ? 'checked' : ''}>
                <label class="form-check-label" for="etiqueta-${etiqueta._id}" 
                       style="background-color: ${etiqueta.color}; color: white; padding: 2px 8px; border-radius: 12px;">
                    ${etiqueta.nombre}
                </label>
            `;
            
            etiquetasCheckboxesContainer.appendChild(etiquetaElement);
        });
        
        // Opcional: Mostrar una visualización de las etiquetas seleccionadas
        actualizarEtiquetasSeleccionadas();
        
        // Agregar event listener para actualizar la visualización cuando se cambian checkboxes
        const checkboxes = etiquetasCheckboxesContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', actualizarEtiquetasSeleccionadas);
        });
    }
    
    // Función para actualizar la visualización de etiquetas seleccionadas
    function actualizarEtiquetasSeleccionadas() {
        // Limpiar contenedor
        etiquetasSeleccionadasContainer.innerHTML = '';
        
        // Obtener todos los checkboxes marcados
        const checkboxesSeleccionados = etiquetasCheckboxesContainer.querySelectorAll('input[type="checkbox"]:checked');
        
        if (checkboxesSeleccionados.length === 0) {
            etiquetasSeleccionadasContainer.innerHTML = '<p class="text-muted small">No hay etiquetas seleccionadas</p>';
            return;
        }
        
        // Para cada checkbox marcado, crear un badge
        checkboxesSeleccionados.forEach(checkbox => {
            const etiquetaId = checkbox.value;
            const etiqueta = todasLasEtiquetas.find(e => e._id === etiquetaId);
            
            if (etiqueta) {
                const badge = document.createElement('span');
                badge.className = 'badge me-1 mb-1';
                badge.style.backgroundColor = etiqueta.color;
                badge.textContent = etiqueta.nombre;
                
                etiquetasSeleccionadasContainer.appendChild(badge);
            }
        });
    }
    
    // Función para renderizar campos especiales en el modal
    function renderCamposEspecialesEnModal(valoresActuales = {}) {
        itemValoresCamposEspecialesContainer.innerHTML = '';
        
        // Verificar si hay campos especiales definidos en la lista
        if (!listaActual || !listaActual.camposEspaciales || listaActual.camposEspaciales.length === 0) {
            itemValoresCamposEspecialesContainer.innerHTML = `
                <p class="text-muted small">Esta lista no tiene campos especiales definidos</p>
            `;
            return;
        }
        
        // Generar inputs para cada campo especial definido
        listaActual.camposEspaciales.forEach(campo => {
            const { nombre, tipo, requerido } = campo;
            const valorActual = valoresActuales[nombre] || '';
            
            const campoContainer = document.createElement('div');
            campoContainer.className = 'mb-3';
            
            let inputHtml = '';
            
            // Crear input según el tipo de campo
            switch (tipo) {
                case 'texto':
                    inputHtml = `
                        <label class="form-label">${nombre}${requerido ? ' <span class="text-danger">*</span>' : ''}</label>
                        <input type="text" class="form-control" data-campo-nombre="${nombre}" 
                            value="${valorActual}" ${requerido ? 'required' : ''}>
                    `;
                    break;
                
                case 'numero':
                    inputHtml = `
                        <label class="form-label">${nombre}${requerido ? ' <span class="text-danger">*</span>' : ''}</label>
                        <input type="number" class="form-control" data-campo-nombre="${nombre}" 
                            value="${valorActual}" ${requerido ? 'required' : ''}>
                    `;
                    break;
                
                case 'fecha':
                    // Formatear fecha para input type="date" (YYYY-MM-DD)
                    let fechaFormateada = '';
                    if (valorActual) {
                        try {
                            const fecha = new Date(valorActual);
                            fechaFormateada = fecha.toISOString().split('T')[0];
                        } catch (e) {
                            console.error('Error al formatear fecha:', e);
                        }
                    }
                    
                    inputHtml = `
                        <label class="form-label">${nombre}${requerido ? ' <span class="text-danger">*</span>' : ''}</label>
                        <input type="date" class="form-control" data-campo-nombre="${nombre}" 
                            value="${fechaFormateada}" ${requerido ? 'required' : ''}>
                    `;
                    break;
                
                case 'booleano':
                    const checked = valorActual === true || valorActual === 'true' ? 'checked' : '';
                    inputHtml = `
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="campo-${nombre}" 
                                data-campo-nombre="${nombre}" ${checked}>
                            <label class="form-check-label" for="campo-${nombre}">
                                ${nombre}${requerido ? ' <span class="text-danger">*</span>' : ''}
                            </label>
                        </div>
                    `;
                    break;
                
                default:
                    inputHtml = `
                        <label class="form-label">${nombre}${requerido ? ' <span class="text-danger">*</span>' : ''}</label>
                        <input type="text" class="form-control" data-campo-nombre="${nombre}" 
                            value="${valorActual}" ${requerido ? 'required' : ''}>
                    `;
            }
            
            campoContainer.innerHTML = inputHtml;
            itemValoresCamposEspecialesContainer.appendChild(campoContainer);
        });
    }
    
    // Función para guardar cambios desde el modal
    async function saveItemFromModal() {
        try {
            // Validar formulario
            if (!itemTitleInput.value.trim()) {
                showToast('El título es obligatorio', 'warning');
                itemTitleInput.focus();
                return;
            }
            
            // Validar campos especiales requeridos
            if (listaActual && listaActual.camposEspaciales) {
                const camposRequeridos = listaActual.camposEspaciales.filter(campo => campo.requerido);
                
                for (const campo of camposRequeridos) {
                    const input = itemValoresCamposEspecialesContainer.querySelector(`[data-campo-nombre="${campo.nombre}"]`);
                    
                    if (input) {
                        let valor;
                        
                        if (campo.tipo === 'booleano') {
                            valor = input.checked;
                        } else {
                            valor = input.value.trim();
                        }
                        
                        if (!valor && valor !== false) {
                            showToast(`El campo "${campo.nombre}" es obligatorio`, 'warning');
                            input.focus();
                            return;
                        }
                    }
                }
            }
            
            // Deshabilitar botón para evitar doble envío
            saveItemBtn.disabled = true;
            saveItemBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
            
            // Recolectar datos del formulario
            const itemData = {
                title: itemTitleInput.value.trim(),
                description: itemDescriptionInput.value.trim(),
                estado: itemEstadoSelect.value,
                imagenUrl: itemImageUrlInput.value.trim(),
                listId: listId
            };
            
            // Recolectar IDs de etiquetas seleccionadas
            const etiquetasSeleccionadas = Array.from(
                etiquetasCheckboxesContainer.querySelectorAll('input[type="checkbox"]:checked')
            ).map(checkbox => checkbox.value);
            
            itemData.etiquetas = etiquetasSeleccionadas;
            
            // Recolectar valores de campos especiales
            const valoresCamposEspaciales = {};
            
            if (listaActual && listaActual.camposEspaciales) {
                listaActual.camposEspaciales.forEach(campo => {
                    const input = itemValoresCamposEspecialesContainer.querySelector(`[data-campo-nombre="${campo.nombre}"]`);
                    
                    if (input) {
                        let valor;
                        
                        switch (campo.tipo) {
                            case 'numero':
                                valor = input.value ? parseFloat(input.value) : null;
                                break;
                            case 'booleano':
                                valor = input.checked;
                                break;
                            case 'fecha':
                                valor = input.value ? new Date(input.value).toISOString() : null;
                                break;
                            default: // texto
                                valor = input.value.trim();
                        }
                        
                        valoresCamposEspaciales[campo.nombre] = valor;
                    }
                });
            }
            
            itemData.valoresCamposEspaciales = valoresCamposEspaciales;
            
            let response;
            const itemId = itemIdInput.value;
            
            if (itemId) {
                // Modo edición
                response = await window.api.updateItem(itemId, itemData);
            } else {
                // Modo creación
                response = await window.api.createItem(itemData);
            }
            
            if (response.success) {
                // Cerrar modal
                itemEditorModal.hide();
                
                // Mostrar mensaje de éxito
                showToast(itemId ? 'Ítem actualizado correctamente' : 'Ítem creado correctamente', 'success');
                
                // Recargar lista para mostrar cambios
                fetchListDetails();
            } else {
                console.error('Error al guardar ítem:', response.message);
                showToast(response.message || 'Error al guardar el ítem', 'error');
            }
        } catch (error) {
            console.error('Error al guardar ítem:', error);
            showToast('Error al guardar el ítem', 'error');
        } finally {
            // Restaurar botón
            saveItemBtn.disabled = false;
            saveItemBtn.innerHTML = 'Guardar Cambios';
        }
    }
    
    // Función para cambiar estado de un ítem
    async function toggleItemStatus(itemId, isCompleted) {
        try {
            // Preparar datos para actualizar
            const estado = isCompleted ? 'completado' : 'pendiente';
            
            // Llamar a la API para actualizar el estado del ítem
            const response = await window.api.updateItem(itemId, { estado });
            
            if (response.success) {
                // Actualizar UI
                const label = document.querySelector(`[data-id="${itemId}"][data-action="toggle-status"]`)
                    .closest('.form-check')
                    .querySelector('.form-check-label');
                    
                if (isCompleted) {
                    label.classList.add('text-decoration-line-through', 'text-muted');
                } else {
                    label.classList.remove('text-decoration-line-through', 'text-muted');
                }
                
                // Actualizar badge de estado
                const statusBadge = document.querySelector(`[data-id="${itemId}"][data-action="toggle-status"]`)
                    .closest('.list-group-item')
                    .querySelector('.badge:last-child');
                    
                statusBadge.className = `badge bg-${getStatusBadgeClass(estado)}`;
                statusBadge.textContent = getStatusText(estado);
                
                // Actualizar barra de progreso
                const allItems = Array.from(itemsList.querySelectorAll('[data-action="toggle-status"]'));
                const completedItems = allItems.filter(item => item.checked);
                updateProgressUI(completedItems.length, allItems.length);
                
                // Mostrar mensaje de éxito
                showToast(`Ítem marcado como ${estado}`, 'success');
            } else {
                // Si la actualización falla, revertir el cambio en la UI
                const checkbox = document.querySelector(`[data-id="${itemId}"][data-action="toggle-status"]`);
                checkbox.checked = !isCompleted;
                showToast(response.message || 'Error al cambiar estado del ítem', 'error');
            }
        } catch (error) {
            console.error('Error al cambiar estado del ítem:', error);
            showToast('Error al cambiar estado del ítem', 'error');
            
            // Revertir cambio en UI
            const checkbox = document.querySelector(`[data-id="${itemId}"][data-action="toggle-status"]`);
            checkbox.checked = !isCompleted;
        }
    }
    
    // Función para eliminar un ítem
    async function deleteItem(itemId) {
        try {
            // Mostrar animación de eliminación
            const itemElement = document.querySelector(`[data-id="${itemId}"][data-action="delete-item"]`)
                .closest('.list-group-item');
                
            itemElement.style.transition = 'all 0.3s ease';
            itemElement.style.opacity = '0.5';
            
            // Llamar a la API para eliminar el ítem
            const response = await window.api.deleteItem(itemId);
            
            if (response.success) {
                // Completar animación de eliminación
                itemElement.style.opacity = '0';
                itemElement.style.height = '0';
                
                setTimeout(() => {
                    // Eliminar del DOM
                    itemElement.remove();
                    
                    // Si no hay más ítems, mostrar mensaje vacío
                    if (itemsList.children.length === 0) {
                        itemsList.innerHTML = `
                            <div class="list-group-item text-center text-muted py-5">
                                <i class="fas fa-inbox fa-3x mb-3"></i>
                                <p>No hay ítems en esta lista</p>
                                <p>Comienza agregando tu primer ítem arriba</p>
                            </div>
                        `;
                    }
                    
                    // Actualizar barra de progreso
                    const allItems = Array.from(itemsList.querySelectorAll('[data-action="toggle-status"]'));
                    const completedItems = allItems.filter(item => item.checked);
                    updateProgressUI(completedItems.length, allItems.length);
                    
                    // Mostrar mensaje de éxito
                    showToast('Ítem eliminado correctamente', 'success');
                }, 300);
            } else {
                // Si la eliminación falla, restaurar el elemento
                itemElement.style.opacity = '1';
                showToast(response.message || 'Error al eliminar ítem', 'error');
            }
        } catch (error) {
            console.error('Error al eliminar ítem:', error);
            
            // Restaurar el elemento si hay error
            const itemElement = document.querySelector(`[data-id="${itemId}"][data-action="delete-item"]`)
                ?.closest('.list-group-item');
                
            if (itemElement) {
                itemElement.style.opacity = '1';
            }
            
            showToast('Error al eliminar ítem', 'error');
        }
    }
    
    // Función para editar título de la lista (simulada)
    function editListTitle() {
        const currentTitle = listTitle.textContent;
        const currentDesc = listDescription.textContent;
        
        // Simular edición con prompt (en una implementación real, esto sería un modal)
        const newTitle = prompt('Editar título de la lista:', currentTitle);
        
        if (newTitle !== null && newTitle.trim() !== '') {
            // Actualizar UI
            listTitle.textContent = newTitle;
            
            // En una implementación real, esto actualizaría la lista en el servidor
            showToast('Lista actualizada correctamente', 'success');
        }
    }
    
    // Función para exportar lista (simulada)
    function exportList() {
        // Simular exportación
        showToast('Exportando lista...', 'info');
        
        setTimeout(() => {
            // Crear contenido para exportar
            const listName = listTitle.textContent;
            let content = `# ${listName}\n\n`;
            
            // Agregar ítems
            const items = Array.from(itemsList.querySelectorAll('.list-group-item'))
                .filter(el => !el.querySelector('.text-muted.py-5')); // Excluir mensaje vacío
                
            items.forEach(item => {
                const title = item.querySelector('.form-check-label').textContent.trim();
                const isCompleted = item.querySelector('[data-action="toggle-status"]').checked;
                content += `- [${isCompleted ? 'x' : ' '}] ${title}\n`;
            });
            
            // Simular descarga
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${listName.toLowerCase().replace(/\s+/g, '-')}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('Lista exportada correctamente', 'success');
        }, 1000);
    }
    
    // Función para eliminar lista
    async function deleteList() {
        console.log('Intentando eliminar lista con ID:', listId);
        
        try {
            // Mostrar indicador visual
            showToast('Eliminando lista...', 'info');
            
            // Llamar a la API para eliminar la lista
            const res = await window.api.deleteLista(listId);
            console.log('Respuesta de deleteLista:', res);
            
            if (res.success) {
                // Mostrar mensaje de éxito
                showToast('Lista eliminada correctamente', 'success');
                
                // Redirigir al dashboard después de eliminar la lista
                window.location.href = 'dashboard.html';
            } else {
                // Mostrar mensaje de error
                showToast(res.message || 'Error al eliminar la lista', 'error');
            }
        } catch (error) {
            console.error('Error al eliminar lista:', error);
            showToast('Error de conexión al servidor', 'error');
        }
    }
    
    // Función para actualizar progreso basado en ítems
    function updateProgress(items) {
        const total = items.length;
        const completed = items.filter(item => item.estado === 'completado').length;
        
        updateProgressUI(completed, total);
    }
    
    // Función para actualizar UI de progreso
    function updateProgressUI(completed, total) {
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.progress-bar');
        const statsText = document.querySelector('.d-flex.justify-content-between');
        
        if (!progressBar || !statsText) return;
        
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        // Actualizar barra de progreso
        progressBar.style.width = `${percentage}%`;
        progressBar.textContent = `${percentage}%`;
        
        // Actualizar texto de estadísticas
        const itemsText = statsText.querySelector('span:first-child');
        const completedText = statsText.querySelector('span:last-child');
        
        if (itemsText) itemsText.textContent = `${total} items totales`;
        if (completedText) completedText.textContent = `${completed} completados`;
    }
    
    // Funciones auxiliares
    function getStatusBadgeClass(estado) {
        switch (estado) {
            case 'completado': return 'success';
            case 'pendiente': return 'warning';
            case 'inactivo': return 'secondary';
            case 'activo': return 'primary';
            default: return 'primary';
        }
    }
    
    function getStatusText(estado) {
        switch (estado) {
            case 'completado': return 'Completado';
            case 'pendiente': return 'Pendiente';
            case 'inactivo': return 'Inactivo';
            case 'activo': return 'Activo';
            default: return 'Estado';
        }
    }
    
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
    
    // Función para mostrar errores
    function showError(message) {
        itemsList.innerHTML = `
            <div class="list-group-item">
                <div class="alert alert-danger mb-0" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>${message}
                </div>
            </div>
        `;
    }
    
    // Función para mostrar notificaciones toast
    function showToast(message, type = 'info') {
        // Verificar si existe el contenedor de toasts
        let toastContainer = document.querySelector('.toast-container');
        
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Crear toast
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type}`;
        toast.id = toastId;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Crear y mostrar toast
        const toastElement = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 5000
        });
        
        toastElement.show();
        
        // Eliminar de DOM después de ocultarse
        toast.addEventListener('hidden.bs.toast', function() {
            toast.remove();
        });
    }
    
    // Función para renderizar colaboradores (simplificada)
    function renderSharedWith(colaboradores) {
        if (!sharedWithList) return;
        sharedWithList.innerHTML = '';

        if (!colaboradores || colaboradores.length === 0) {
            sharedWithList.innerHTML = '<li class="list-group-item text-muted">No hay colaboradores actualmente</li>';
            return;
        }

        const colaboradoresHtml = colaboradores.map(collab => {
            const user = collab.userId;
            const displayName = user.nombre || user.username || user.email;
            const permisoText = collab.permiso === 'editar' ? 'Editor' : 'Visualizador';
            return `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span class="fw-medium">${displayName}</span>
                    <small class="text-muted">${permisoText}</small>
                </li>
            `;
        }).join('');

        sharedWithList.innerHTML = colaboradoresHtml;
    }
    
    // -------------------------------------------------
    // Lógica para gestión de colaboradores vía modal
    // Listener para abrir modal de gestión
    if (manageCollaboratorsBtn) {
        manageCollaboratorsBtn.addEventListener('click', () => {
            renderManageCollaboratorsModal(listaActual?.colaboradores);
            manageCollaboratorsModal.show();
        });
    }

    // Función para renderizar modal de gestión de colaboradores
    function renderManageCollaboratorsModal(colaboradores) {
        if (!manageCollaboratorList) return;
        manageCollaboratorList.innerHTML = '';

        if (!colaboradores || colaboradores.length === 0) {
            manageCollaboratorList.innerHTML = '<li class="list-group-item text-muted">No hay colaboradores actualmente</li>';
            return;
        }

        // Obtener ID de usuario actual con robustez
        const userObj = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserOwnerId = userObj?._id || userObj?.id;
        const ownerUserId = listaActual?.userId?.toString();
        
        // Solo mostrar opciones de eliminar si el usuario actual es el propietario
        const isOwner = ownerUserId && currentUserOwnerId && ownerUserId === currentUserOwnerId;
        console.log('Renderizando modal de gestión - Es propietario:', isOwner);

        colaboradores.forEach(collab => {
            const user = collab.userId;
            const displayName = user.nombre || user.username || user.email;
            const permisoText = collab.permiso === 'editar' ? 'Editor' : 'Visualizador';
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            // Construir el HTML según sea propietario o no
            let htmlContent = `
                <span class="fw-medium">${displayName}</span>
                <small class="text-muted me-2">${permisoText}</small>
            `;
            
            // Solo agregar botón de eliminar si es propietario
            if (isOwner) {
                htmlContent += `
                    <button type="button" class="btn btn-sm btn-outline-danger" data-action="remove-collab-modal" data-user-id="${user._id}">
                        Eliminar
                    </button>
                `;
            }
            
            li.innerHTML = htmlContent;
            manageCollaboratorList.appendChild(li);
        });
    }

    // Delegated listener para eliminar colaborador
    if (manageCollaboratorList) {
        manageCollaboratorList.addEventListener('click', async (e) => {
            const btn = e.target.closest('[data-action="remove-collab-modal"]');
            if (!btn) return;
            const collabUserId = btn.getAttribute('data-user-id');
            try {
                const response = await window.api.removeCollaborator(listId, collabUserId);
                if (response.success) {
                    manageCollaboratorsModal.hide();
                    showToast('Colaborador eliminado correctamente', 'success');
                    const listResponse = await window.api.getLista(listId);
                    if (listResponse.success) {
                        listaActual = listResponse.lista;
                        renderSharedWith(listaActual.colaboradores);
                    }
                } else {
                    showToast(response.message || 'Error al eliminar colaborador', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar colaborador:', error);
                showToast('Error al eliminar colaborador', 'error');
            }
        });
    }
}); 