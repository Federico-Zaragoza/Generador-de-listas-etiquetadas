// Profile JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        // Redirigir al login si no hay token
        window.location.href = 'index.html';
        return;
    }

    // Cargar datos del usuario desde localStorage
    loadUserData();
    
    // Initialize form validation
    initFormValidation();
    
    // Initialize toggle password buttons
    initPasswordToggles();

    // Handle profile form submission
    const profileForm = document.getElementById('profileForm');
    profileForm.addEventListener('submit', handleProfileUpdate);

    // Handle password form submission
    const passwordForm = document.getElementById('passwordForm');
    passwordForm.addEventListener('submit', handlePasswordUpdate);

    // Listen for tab changes
    const tabEls = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabEls.forEach(tabEl => {
        tabEl.addEventListener('shown.bs.tab', event => {
            // You might want to load additional data when a tab is shown
            const targetId = event.target.getAttribute('data-bs-target');
            if (targetId === '#activity') {
                // Load activity data if needed
                // loadActivityData();
            }
        });
    });

    // Handle avatar change button
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    changeAvatarBtn.addEventListener('click', handleAvatarChange);

    // Handle logout button
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', handleLogout);

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
});

// Cargar datos del usuario desde localStorage
function loadUserData() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Actualizar los campos del perfil con datos del usuario
    const userFullNameEl = document.getElementById('userFullName');
    const userUsernameEl = document.getElementById('userUsername');
    const fullNameInput = document.getElementById('fullName');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    
    if (userFullNameEl) userFullNameEl.textContent = user.nombre || 'Usuario';
    if (userUsernameEl) userUsernameEl.textContent = '@' + (user.username || 'usuario');
    if (fullNameInput) fullNameInput.value = user.nombre || '';
    if (usernameInput) usernameInput.value = user.username || '';
    if (emailInput) emailInput.value = user.email || '';
    
    // Si hay otros campos como fecha de nacimiento, también actualizarlos
    const birthDateInput = document.getElementById('birthDate');
    if (birthDateInput && user.fecha_nacimiento) {
        // Formatear la fecha para el input (YYYY-MM-DD)
        const fechaNacimiento = new Date(user.fecha_nacimiento);
        birthDateInput.value = fechaNacimiento.toISOString().split('T')[0];
    }
}

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

// Initialize password toggle buttons
function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Handle profile update form submission
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    if (!this.checkValidity()) {
        return;
    }
    
    // Get form data
    const formData = {
        nombre: document.getElementById('fullName').value,
        fecha_nacimiento: document.getElementById('birthDate').value,
        email: document.getElementById('email').value
    };

    try {
        // Deshabilitar botón para evitar doble envío
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        
        // Llamar a la API para actualizar el perfil
        const response = await window.api.updateUserProfile(formData);
        
        if (response.success) {
            // Actualizar el usuario en localStorage con TODOS los datos de la respuesta
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
                
                // Actualizar la visualización del nombre en la página
                const userFullNameEl = document.getElementById('userFullName');
                if (userFullNameEl) userFullNameEl.textContent = response.user.nombre || 'Usuario';
            }
            
            // Mostrar mensaje de éxito
            showToast('Perfil actualizado correctamente', 'success');
        } else {
            showToast(response.message || 'Error al actualizar el perfil', 'danger');
        }
        
        // Habilitar botón nuevamente
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        showToast('Error de conexión al servidor', 'danger');
        
        // Habilitar botón en caso de error
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Guardar Cambios';
        }
    }
}

// Handle password update form submission
async function handlePasswordUpdate(event) {
    event.preventDefault();
    
    if (!this.checkValidity()) {
        return;
    }
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
        document.getElementById('confirmPassword').setCustomValidity('Las contraseñas no coinciden');
        this.classList.add('was-validated');
        return;
    } else {
        document.getElementById('confirmPassword').setCustomValidity('');
    }
    
    try {
        // Deshabilitar botón para evitar doble envío
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Actualizando...';
        
        // Llamar a la API para cambiar la contraseña
        const response = await window.api.updatePassword({
            currentPassword,
            newPassword
        });
        
        if (response.success) {
            // Mostrar mensaje de éxito
            showToast('Contraseña actualizada correctamente', 'success');
            
            // Resetear formulario
            this.reset();
        } else {
            showToast(response.message || 'Error al actualizar la contraseña', 'danger');
        }
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        showToast('Error de conexión al servidor', 'danger');
    } finally {
        // Reactivar botón
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-key me-2"></i>Actualizar Contraseña';
        
        // Limpiar validación
        this.classList.remove('was-validated');
    }
}

// Handle avatar change
function handleAvatarChange() {
    // Normally, this would open a file picker or avatar selection interface
    // For this prototype, we'll just show a toast
    showToast('Esta funcionalidad estará disponible próximamente', 'info');
}

// Handle logout button click
function handleLogout(event) {
    event.preventDefault();
    
    // Logout - clear localStorage and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Display a toast notification
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
    
    // Remove toast element when hidden
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastContainer.removeChild(toastEl);
    });
} 