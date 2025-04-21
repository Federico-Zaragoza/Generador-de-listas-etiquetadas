document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const newListForm = document.getElementById('newListForm');
    const createListBtn = document.getElementById('createListBtn');
    const tagInput = document.getElementById('tagInput');
    const addTagBtn = document.getElementById('addTagBtn');
    const tagContainer = document.getElementById('tagContainer');
    const listsContainer = document.getElementById('listsContainer');
    const logoutBtn = document.getElementById('logoutBtn');

    // Tags array to store current tags
    let currentTags = [];

    // Add tag functionality
    function addTag(tagText) {
        if (tagText && !currentTags.includes(tagText)) {
            currentTags.push(tagText);
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${tagText}
                <i class="fas fa-times" onclick="removeTag('${tagText}')"></i>
            `;
            tagContainer.appendChild(tagElement);
            tagInput.value = '';
        }
    }

    // Remove tag functionality
    window.removeTag = function(tagText) {
        currentTags = currentTags.filter(tag => tag !== tagText);
        renderTags();
    };

    // Render tags
    function renderTags() {
        tagContainer.innerHTML = '';
        currentTags.forEach(tag => addTag(tag));
    }

    // Add tag button click handler
    addTagBtn.addEventListener('click', () => {
        addTag(tagInput.value.trim());
    });

    // Add tag on enter key
    tagInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(tagInput.value.trim());
        }
    });

    // Create new list
    createListBtn.addEventListener('click', () => {
        const title = document.getElementById('listTitle').value;
        const description = document.getElementById('listDescription').value;

        if (!title) {
            showAlert('Por favor ingresa un título para la lista', 'danger');
            return;
        }

        const listData = {
            title,
            description,
            tags: currentTags,
            createdAt: new Date().toISOString()
        };

        // Here you would typically make an API call
        console.log('Creating new list:', listData);
        
        // Simulate API call
        createListBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creando...';
        createListBtn.disabled = true;

        setTimeout(() => {
            // Add new list to UI
            addListToUI(listData);
            
            // Reset form
            newListForm.reset();
            currentTags = [];
            tagContainer.innerHTML = '';
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('newListModal'));
            modal.hide();
            
            // Show success message
            showAlert('Lista creada exitosamente', 'success');
            
            // Reset button
            createListBtn.innerHTML = 'Crear Lista';
            createListBtn.disabled = false;
        }, 1000);
    });

    // Add list to UI
    function addListToUI(listData) {
        const listElement = document.createElement('div');
        listElement.className = 'col fade-in';
        listElement.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h5 class="card-title">${listData.title}</h5>
                        <div class="dropdown">
                            <button class="btn btn-link text-dark" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#"><i class="fas fa-edit me-2"></i>Editar</a></li>
                                <li><a class="dropdown-item" href="#"><i class="fas fa-star me-2"></i>Favorito</a></li>
                                <li><a class="dropdown-item" href="#"><i class="fas fa-share me-2"></i>Compartir</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#"><i class="fas fa-trash me-2"></i>Eliminar</a></li>
                            </ul>
                        </div>
                    </div>
                    <p class="card-text">${listData.description || 'Sin descripción'}</p>
                    <div class="mb-2">
                        ${listData.tags.map(tag => `<span class="badge bg-primary">${tag}</span>`).join(' ')}
                        <span class="badge bg-success">Nuevo</span>
                    </div>
                    <div class="progress" style="height: 5px;">
                        <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                    </div>
                    <small class="text-muted">0 items - 0% completado</small>
                </div>
                <div class="card-footer bg-transparent">
                    <small class="text-muted">Creada ${timeAgo(new Date(listData.createdAt))}</small>
                </div>
            </div>
        `;

        // Insert new list before the "Add List" card
        const addListCard = listsContainer.lastElementChild;
        listsContainer.insertBefore(listElement, addListCard);
    }

    // Show alert message
    function showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alertDiv.style.zIndex = '1050';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    // Time ago function
    function timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' años';
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' meses';
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' días';
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' horas';
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minutos';
        
        return 'hace un momento';
    }

    // Logout functionality
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Here you would typically make an API call to logout
        console.log('Logging out...');
        
        // Simulate API call
        showAlert('Cerrando sesión...', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}); 