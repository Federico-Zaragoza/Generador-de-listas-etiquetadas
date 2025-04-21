// Profile JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Load mock user data
    const userData = {
        id: 1,
        username: 'juanp',
        email: 'juanp@gmail.com',
        fullName: 'Juan Pérez',
        birthDate: '1990-01-15',
        listsCount: 8,
        favoritesCount: 3,
        sharedCount: 2,
        createdAt: '2023-01-10T10:30:00Z'
    };

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
function handleProfileUpdate(event) {
    event.preventDefault();
    
    if (!this.checkValidity()) {
        return;
    }
    
    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        birthDate: document.getElementById('birthDate').value
    };
    
    // Simulated API call to update profile
    setTimeout(() => {
        // Update user display name
        document.getElementById('userFullName').textContent = formData.fullName;
        
        // Show success message
        showToast('Perfil actualizado correctamente', 'success');
        
        // Reset form validation state
        this.classList.remove('was-validated');
    }, 1000);
}

// Handle password update form submission
function handlePasswordUpdate(event) {
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
        return;
    } else {
        document.getElementById('confirmPassword').setCustomValidity('');
    }
    
    // Simulated API call to update password
    setTimeout(() => {
        // Show success message
        showToast('Contraseña actualizada correctamente', 'success');
        
        // Reset form
        this.reset();
        this.classList.remove('was-validated');
    }, 1000);
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
    
    // Simulate logout - in a real app, this would call an API and clear session
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// Display a toast notification
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