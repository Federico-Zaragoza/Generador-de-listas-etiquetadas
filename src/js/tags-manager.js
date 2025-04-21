// Tags Manager JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Sample tags data (in a real app, this would come from an API)
    const tagsData = [
        {
            id: 1,
            name: 'Trabajo',
            color: '#0d6efd',
            description: 'Etiqueta para tareas relacionadas con el trabajo.',
            itemsCount: 24,
            listsCount: 5,
            lastUsed: new Date(Date.now() - 7200000) // 2 hours ago
        },
        {
            id: 2,
            name: 'Personal',
            color: '#198754',
            description: 'Etiqueta para tareas personales.',
            itemsCount: 18,
            listsCount: 3,
            lastUsed: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
            id: 3,
            name: 'Compras',
            color: '#ffc107',
            description: 'Etiqueta para listas de compras.',
            itemsCount: 12,
            listsCount: 2,
            lastUsed: new Date(Date.now() - 259200000) // 3 days ago
        },
        {
            id: 4,
            name: 'Urgente',
            color: '#dc3545',
            description: 'Etiqueta para tareas urgentes que requieren atención inmediata.',
            itemsCount: 8,
            listsCount: 4,
            lastUsed: new Date(Date.now() - 604800000) // 1 week ago
        }
    ];

    // Initialize tooltips and popovers
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Initialize view toggle
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');

    gridViewBtn.addEventListener('click', () => {
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        gridView.classList.remove('d-none');
        listView.classList.add('d-none');
    });

    listViewBtn.addEventListener('click', () => {
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        listView.classList.remove('d-none');
        gridView.classList.add('d-none');
    });

    // Initialize search functionality
    const tagSearchInput = document.getElementById('tagSearchInput');
    const tagSearchBtn = document.getElementById('tagSearchBtn');

    tagSearchBtn.addEventListener('click', () => {
        const searchTerm = tagSearchInput.value.toLowerCase();
        showToast(`Buscando: "${searchTerm}"`, 'info');
        // In a real app, this would filter the tags based on the search term
    });

    tagSearchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            tagSearchBtn.click();
        }
    });

    // Initialize filter checkboxes
    const filterCheckboxes = document.querySelectorAll('.form-check-input');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const filterType = checkbox.id.replace('show', '');
            showToast(`Filtro "${filterType}" ${checkbox.checked ? 'activado' : 'desactivado'}`, 'info');
            // In a real app, this would filter the tags based on the selected filters
        });
    });

    // Initialize tag color preview in new tag modal
    const tagColor = document.getElementById('tagColor');
    const tagPreview = document.getElementById('tagPreview');
    const tagPreviewContainer = tagColor.parentElement.querySelector('.tag-preview');

    tagColor.addEventListener('input', () => {
        const color = tagColor.value;
        tagPreviewContainer.style.backgroundColor = color;
        // Set text color based on background color brightness
        tagPreviewContainer.style.color = isLightColor(color) ? '#212529' : '#ffffff';
    });

    // Initialize tag color preview in edit tag modal
    const editTagColor = document.getElementById('editTagColor');
    const editTagPreview = document.getElementById('editTagPreview');
    const editTagPreviewContainer = editTagColor.parentElement.querySelector('.tag-preview');

    editTagColor.addEventListener('input', () => {
        const color = editTagColor.value;
        editTagPreviewContainer.style.backgroundColor = color;
        // Set text color based on background color brightness
        editTagPreviewContainer.style.color = isLightColor(color) ? '#212529' : '#ffffff';
    });

    // Initialize tag name preview in new tag modal
    const tagName = document.getElementById('tagName');
    tagName.addEventListener('input', () => {
        tagPreview.textContent = tagName.value || 'Previsualización';
    });

    // Initialize tag name preview in edit tag modal
    const editTagName = document.getElementById('editTagName');
    editTagName.addEventListener('input', () => {
        editTagPreview.textContent = editTagName.value || 'Previsualización';
    });

    // Handle new tag form submission
    const saveTagBtn = document.getElementById('saveTagBtn');
    saveTagBtn.addEventListener('click', () => {
        const form = document.getElementById('newTagForm');
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        const name = tagName.value;
        const color = tagColor.value;
        const description = document.getElementById('tagDescription').value;
        
        // In a real app, this would call an API to create the tag
        showToast(`Etiqueta "${name}" creada con éxito`, 'success');
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('newTagModal'));
        modal.hide();
        
        // Reset the form
        form.reset();
        form.classList.remove('was-validated');
        tagPreview.textContent = 'Previsualización';
        tagPreviewContainer.style.backgroundColor = '#0d6efd';
        tagPreviewContainer.style.color = '#ffffff';
    });

    // Handle edit tag form submission
    const updateTagBtn = document.getElementById('updateTagBtn');
    updateTagBtn.addEventListener('click', () => {
        const form = document.getElementById('editTagForm');
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        const id = document.getElementById('editTagId').value;
        const name = editTagName.value;
        const color = editTagColor.value;
        const description = document.getElementById('editTagDescription').value;
        
        // In a real app, this would call an API to update the tag
        showToast(`Etiqueta "${name}" actualizada con éxito`, 'success');
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editTagModal'));
        modal.hide();
    });

    // Initialize edit tag modal with tag data
    const editTagModal = document.getElementById('editTagModal');
    editTagModal.addEventListener('show.bs.modal', event => {
        const button = event.relatedTarget;
        const tagId = button.getAttribute('data-tag-id');
        
        // Get tag data based on ID (in a real app, this would call an API)
        const tag = tagsData.find(t => t.id == tagId);
        
        if (!tag) {
            showToast('Etiqueta no encontrada', 'danger');
            return;
        }
        
        // Populate form fields
        document.getElementById('editTagId').value = tag.id;
        document.getElementById('editTagName').value = tag.name;
        document.getElementById('editTagColor').value = tag.color;
        document.getElementById('editTagDescription').value = tag.description || '';
        
        // Update preview
        editTagPreview.textContent = tag.name;
        editTagPreviewContainer.style.backgroundColor = tag.color;
        editTagPreviewContainer.style.color = isLightColor(tag.color) ? '#212529' : '#ffffff';
    });

    // Handle tag color change from list
    const colorButtons = document.querySelectorAll('.btn-outline-primary[data-tag-id]');
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tagId = button.getAttribute('data-tag-id');
            // In a real app, this would open a color picker
            showToast('Funcionalidad de cambio de color en desarrollo', 'info');
        });
    });

    // Handle tag deletion
    const deleteLinks = document.querySelectorAll('.dropdown-item.text-danger[data-tag-id], .btn-outline-danger[data-tag-id]');
    deleteLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const tagId = link.getAttribute('data-tag-id');
            const tag = tagsData.find(t => t.id == tagId);
            
            if (confirm(`¿Estás seguro de que quieres eliminar la etiqueta "${tag.name}"?`)) {
                // In a real app, this would call an API to delete the tag
                showToast(`Etiqueta "${tag.name}" eliminada con éxito`, 'success');
            }
        });
    });

    // Utility function to determine if a color is light or dark
    function isLightColor(color) {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return true if the color is light
        return luminance > 0.5;
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        
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
        
        // Remove toast element when hidden
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastContainer.removeChild(toastEl);
        });
    }
}); 