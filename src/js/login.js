document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const forgotPasswordLink = document.getElementById('forgotPassword');

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle eye icon
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    // Form validation and submission
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (!loginForm.checkValidity()) {
            event.stopPropagation();
            loginForm.classList.add('was-validated');
            shakeInvalidFields();
            return;
        }

        // If form is valid, prepare data for submission
        const formData = {
            email: emailInput.value,
            password: passwordInput.value,
            rememberMe: document.getElementById('rememberMe').checked
        };

        // Here you would typically make an API call to your backend
        console.log('Form submitted with data:', formData);
        
        // Simulate API call
        simulateLogin(formData);
    });

    // Forgot password handler
    forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault();
        // Here you would typically show a modal or redirect to reset password page
        alert('Funcionalidad de recuperación de contraseña en desarrollo');
    });

    // Helper function to shake invalid fields
    function shakeInvalidFields() {
        const invalidInputs = loginForm.querySelectorAll(':invalid');
        invalidInputs.forEach(input => {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        });
    }

    // Simulate login API call
    function simulateLogin(formData) {
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...';
        submitBtn.disabled = true;

        // Simulate API delay
        setTimeout(() => {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            // Redirect to dashboard (you would do this after successful API response)
            window.location.href = 'dashboard.html';
        }, 2000);
    }

    // Add input event listeners for real-time validation
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
    });
}); 