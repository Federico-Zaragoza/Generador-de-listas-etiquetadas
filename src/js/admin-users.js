// Admin Users JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Sample user data (in a real app, this would come from an API)
    const usersData = [
        {
            id: 1,
            username: 'juanp',
            fullName: 'Juan Pérez',
            email: 'juanp@gmail.com',
            role: 'admin',
            status: 'active',
            registered: '2023-01-10',
            lastLogin: '2023-05-15T10:45:00Z',
            listsCount: 8,
            itemsCount: 42,
            loginCount: 24,
            activity: [
                { description: 'Inicio de sesión desde Chrome en Windows', timestamp: new Date().toISOString() },
                { description: 'Creó nueva lista "Tareas de proyecto"', timestamp: new Date(Date.now() - 86400000).toISOString() },
                { description: 'Modificó perfil de usuario', timestamp: '2023-05-05T15:30:00Z' }
            ]
        },
        {
            id: 2,
            username: 'mariag',
            fullName: 'María García',
            email: 'maria@gmail.com',
            role: 'user',
            status: 'active',
            registered: '2023-02-15',
            lastLogin: '2023-05-14T14:20:00Z',
            listsCount: 5,
            itemsCount: 23,
            loginCount: 18,
            activity: [
                { description: 'Compartió lista "Compras" con Juan', timestamp: new Date(Date.now() - 172800000).toISOString() },
                { description: 'Agregó 5 nuevos items', timestamp: new Date(Date.now() - 259200000).toISOString() }
            ]
        },
        {
            id: 3,
            username: 'carlosl',
            fullName: 'Carlos López',
            email: 'carlos@gmail.com',
            role: 'user',
            status: 'inactive',
            registered: '2023-03-05',
            lastLogin: '2023-04-20T09:15:00Z',
            listsCount: 3,
            itemsCount: 12,
            loginCount: 8,
            activity: [
                { description: 'Modificó lista "Proyecto"', timestamp: '2023-04-20T09:30:00Z' }
            ]
        }
    ];

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
    // Add event listeners
    initTableActionButtons();
    
    // Handle form submission
    document.getElementById('saveNewUserBtn').addEventListener('click', handleNewUserSubmit);
    
    // Handle search
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            handleSearch();
            event.preventDefault();
        }
    });
    
    // Handle filters
    document.getElementById('roleFilter').addEventListener('change', applyFilters);
    document.getElementById('sortOrder').addEventListener('change', applyFilters);
    
    // Handle refresh button
    document.getElementById('refreshBtn').addEventListener('click', refreshUsersTable);
    
    // Handle edit selected user button
    document.getElementById('editSelectedUserBtn').addEventListener('click', handleEditSelectedUser);
});

// Initialize action buttons in the users table
function initTableActionButtons() {
    // View user buttons
    const viewButtons = document.querySelectorAll('.view-user-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-user-id');
            viewUserDetails(userId);
        });
    });
    
    // Edit user buttons
    const editButtons = document.querySelectorAll('.edit-user-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-user-id');
            editUser(userId);
        });
    });
    
    // Delete user buttons
    const deleteButtons = document.querySelectorAll('.delete-user-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-user-id');
            deleteUser(userId);
        });
    });
}

// View user details
function viewUserDetails(userId) {
    // In a real app, you would fetch user details from an API
    // For this prototype, we'll use the hardcoded data
    
    // Get user details based on userId
    const user = getUserById(userId);
    
    if (!user) {
        showToast('Usuario no encontrado', 'danger');
        return;
    }
    
    // Populate user details modal
    document.getElementById('detailsFullName').textContent = user.fullName;
    document.getElementById('detailsUsername').textContent = `@${user.username}`;
    
    const roleElement = document.getElementById('detailsRole');
    roleElement.textContent = user.role === 'admin' ? 'Administrador' : 'Usuario';
    roleElement.className = user.role === 'admin' ? 'badge bg-danger mb-2' : 'badge bg-secondary mb-2';
    
    const statusElement = document.getElementById('detailsStatus');
    statusElement.textContent = user.status === 'active' ? 'Activo' : 'Inactivo';
    statusElement.className = user.status === 'active' ? 'badge bg-success' : 'badge bg-warning text-dark';
    
    document.getElementById('detailsEmail').textContent = user.email;
    document.getElementById('detailsRegistered').textContent = formatDate(user.registered);
    
    document.getElementById('detailsListCount').textContent = user.listsCount;
    document.getElementById('detailsItemCount').textContent = user.itemsCount;
    document.getElementById('detailsLoginCount').textContent = user.loginCount;
    
    // Populate activity log
    const activityLogContainer = document.getElementById('userActivityLog');
    activityLogContainer.innerHTML = '';
    
    if (user.activity && user.activity.length > 0) {
        user.activity.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'list-group-item list-group-item-action';
            activityItem.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <p class="mb-1">${activity.description}</p>
                    <small class="text-muted">${formatDateRelative(activity.timestamp)}</small>
                </div>
            `;
            activityLogContainer.appendChild(activityItem);
        });
    } else {
        activityLogContainer.innerHTML = '<div class="list-group-item">No hay actividad reciente</div>';
    }
    
    // Show the modal
    const userDetailsModal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
    userDetailsModal.show();
}

// Edit user
function editUser(userId) {
    // In a real app, this would open a form pre-filled with user data
    // For this prototype, we'll just show a toast
    showToast(`Editando usuario con ID: ${userId}`, 'info');
}

// Delete user
function deleteUser(userId) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
        // In a real app, this would call an API to delete the user
        // For this prototype, we'll just show a toast
        showToast(`Usuario eliminado con éxito.`, 'success');
    }
}

// Handle new user form submission
function handleNewUserSubmit() {
    const form = document.getElementById('newUserForm');
    
    // Form validation
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    // Get form values
    const username = document.getElementById('newUsername').value;
    const email = document.getElementById('newEmail').value;
    const fullName = document.getElementById('newFullName').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;
    
    // In a real app, this would call an API to create the user
    // For this prototype, we'll just show a toast and close the modal
    
    showToast(`Usuario ${fullName} creado con éxito.`, 'success');
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('newUserModal'));
    modal.hide();
    
    // Reset the form
    form.reset();
    form.classList.remove('was-validated');
}

// Handle search
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // In a real app, this would call an API with the search parameter
    // For this prototype, we'll just show a toast
    showToast(`Buscando: "${searchTerm}"`, 'info');
}

// Apply filters
function applyFilters() {
    const roleFilter = document.getElementById('roleFilter').value;
    const sortOrder = document.getElementById('sortOrder').value;
    
    // In a real app, this would call an API with filter parameters
    // For this prototype, we'll just show a toast
    showToast(`Filtros aplicados: Rol = ${roleFilter}, Orden = ${sortOrder}`, 'info');
}

// Refresh users table
function refreshUsersTable() {
    // In a real app, this would reload data from the API
    // For this prototype, we'll just show a toast
    showToast('Tabla de usuarios actualizada', 'success');
}

// Handle edit selected user from details modal
function handleEditSelectedUser() {
    // Get the user ID from the current details modal
    const fullName = document.getElementById('detailsFullName').textContent;
    
    // Close the details modal
    const detailsModal = bootstrap.Modal.getInstance(document.getElementById('userDetailsModal'));
    detailsModal.hide();
    
    // Show toast (in a real app, this would open an edit form)
    showToast(`Editando usuario: ${fullName}`, 'info');
}

// Helper function to get user by ID
function getUserById(userId) {
    // In a real app, this would call an API
    // For this prototype, we'll use the hardcoded data
    const usersData = [
        {
            id: 1,
            username: 'juanp',
            fullName: 'Juan Pérez',
            email: 'juanp@gmail.com',
            role: 'admin',
            status: 'active',
            registered: '2023-01-10',
            lastLogin: '2023-05-15T10:45:00Z',
            listsCount: 8,
            itemsCount: 42,
            loginCount: 24,
            activity: [
                { description: 'Inicio de sesión desde Chrome en Windows', timestamp: new Date().toISOString() },
                { description: 'Creó nueva lista "Tareas de proyecto"', timestamp: new Date(Date.now() - 86400000).toISOString() },
                { description: 'Modificó perfil de usuario', timestamp: '2023-05-05T15:30:00Z' }
            ]
        },
        {
            id: 2,
            username: 'mariag',
            fullName: 'María García',
            email: 'maria@gmail.com',
            role: 'user',
            status: 'active',
            registered: '2023-02-15',
            lastLogin: '2023-05-14T14:20:00Z',
            listsCount: 5,
            itemsCount: 23,
            loginCount: 18,
            activity: [
                { description: 'Compartió lista "Compras" con Juan', timestamp: new Date(Date.now() - 172800000).toISOString() },
                { description: 'Agregó 5 nuevos items', timestamp: new Date(Date.now() - 259200000).toISOString() }
            ]
        },
        {
            id: 3,
            username: 'carlosl',
            fullName: 'Carlos López',
            email: 'carlos@gmail.com',
            role: 'user',
            status: 'inactive',
            registered: '2023-03-05',
            lastLogin: '2023-04-20T09:15:00Z',
            listsCount: 3,
            itemsCount: 12,
            loginCount: 8,
            activity: [
                { description: 'Modificó lista "Proyecto"', timestamp: '2023-04-20T09:30:00Z' }
            ]
        }
    ];
    
    return usersData.find(user => user.id == userId);
}

// Format date to local date string
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Format date with relative time
function formatDateRelative(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `Hoy, ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else if (diffDays === 1) {
        return 'Ayer, ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else {
        return formatDate(dateString);
    }
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