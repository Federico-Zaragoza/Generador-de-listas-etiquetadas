document.addEventListener('DOMContentLoaded', function() {
    console.log('register.js cargado');
    // Get form elements
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
    const termsCheck = document.getElementById('termsCheck');

    // Toggle password visibility functions
    function setupPasswordToggle(toggleBtn, passwordInput) {
        toggleBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle eye icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    setupPasswordToggle(togglePasswordBtn, passwordInput);
    setupPasswordToggle(toggleConfirmPasswordBtn, confirmPasswordInput);

    // Custom validation for password match
    function validatePasswordMatch() {
        if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.setCustomValidity('Las contraseñas no coinciden');
        } else {
            confirmPasswordInput.setCustomValidity('');
        }
    }

    // Add password match validation on input
    passwordInput.addEventListener('input', validatePasswordMatch);
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    // Form validation and submission
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Validate password match
        validatePasswordMatch();
        
        if (!registerForm.checkValidity()) {
            event.stopPropagation();
            registerForm.classList.add('was-validated');
            shakeInvalidFields();
            return;
        }

        // If form is valid, prepare data for submission
        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            fullName: document.getElementById('fullName').value,
            password: passwordInput.value,
            birthDate: document.getElementById('birthDate').value,
            termsAccepted: termsCheck.checked
        };

        console.log('Register form submit event fired');
        console.log('Datos registro recolectados:', {
            username: formData.username,
            email: formData.email,
            fullName: formData.fullName,
            birthDate: formData.birthDate,
            termsAccepted: formData.termsAccepted
        });
        console.log('Llamando a window.api.register...');
        try {
            const response = await window.api.register(formData);
            console.log('API register response:', response);
            if (response.success) {
                showSuccessMessage();
                setTimeout(() => window.location.href = 'index.html', 2000);
            } else {
                console.error('Registration failed:', response.message);
            }
        } catch (error) {
            console.error('Error en window.api.register:', error);
        }
    });

    // Helper function to shake invalid fields
    function shakeInvalidFields() {
        const invalidInputs = registerForm.querySelectorAll(':invalid');
        invalidInputs.forEach(input => {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        });
    }

    // Function to show success message
    function showSuccessMessage() {
        // Create success alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            ¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Insert alert before form
        registerForm.parentNode.insertBefore(alertDiv, registerForm);

        // Auto dismiss after 2 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 2000);
    }

    // Add real-time validation for username
    const usernameInput = document.getElementById('username');
    usernameInput.addEventListener('input', function() {
        const isValid = this.value.match(/^[a-zA-Z0-9_]{3,20}$/);
        if (isValid) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        } else {
            this.classList.remove('is-valid');
            this.classList.add('is-invalid');
        }
    });

    // Add real-time validation for email
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('input', function() {
        const isValid = this.checkValidity();
        if (isValid) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        } else {
            this.classList.remove('is-valid');
            this.classList.add('is-invalid');
        }
    });

    // Add max date validation for birth date
    const birthDateInput = document.getElementById('birthDate');
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    birthDateInput.max = maxDate.toISOString().split('T')[0];
}); 