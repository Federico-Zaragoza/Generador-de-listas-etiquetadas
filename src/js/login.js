// Eliminar importación y usar window.api

document.addEventListener('DOMContentLoaded', function() {
    console.log('Login script loaded');

    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const submitButton = loginForm.querySelector('button[type="submit"]'); // Obtener el botón de submit del formulario
    const errorMessage = document.querySelector('.alert-danger') || document.createElement('div');

    if (!errorMessage.classList.contains('alert')) {
        errorMessage.classList.add('alert', 'alert-danger', 'mt-3', 'd-none');
        loginForm.insertAdjacentElement('afterend', errorMessage);
    }

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
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            const userData = {
                email: emailInput.value,
                password: passwordInput.value
            };
            
            submitButton.disabled = true;
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Iniciando sesión...';
            
            console.log('Intentando login con window.api...');
            
            // Usar window.api en lugar de api importado
            window.api.login(userData)
                .then(response => {
                    console.log('Login response:', response);
                    
                    if (response.success) {
                        // Solo guardar en localStorage si el login fue exitoso
                        localStorage.setItem('token', response.token);
                        localStorage.setItem('user', JSON.stringify(response.user));
                        window.location.href = 'dashboard.html';
                    } else {
                        // Si la respuesta no es exitosa, limpiar localStorage y mostrar error
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        showErrorMessage(response.message || 'Error al iniciar sesión. Verifica tus credenciales.');
                    }
                })
                .catch(error => {
                    console.error('Login error:', error);
                    // En caso de error, limpiar localStorage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    showErrorMessage(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                });
        }
    });

    // Función para mostrar mensaje de error
    function showErrorMessage(message) {
        // Verificar si ya existe un mensaje de error
        let errorDiv = document.getElementById('loginErrorMessage');
        
        if (!errorDiv) {
            // Crear elemento para el mensaje de error
            errorDiv = document.createElement('div');
            errorDiv.id = 'loginErrorMessage';
            errorDiv.className = 'alert alert-danger mt-3';
            errorDiv.role = 'alert';
            
            // Insertar después del formulario
            loginForm.insertAdjacentElement('afterend', errorDiv);
        }
        
        // Actualizar mensaje y mostrar con animación
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Añadir animación de shake
        errorDiv.classList.add('shake');
        setTimeout(() => errorDiv.classList.remove('shake'), 500);
    }

    // Validación del formulario
    function validateForm() {
        let isValid = true;
        
        // Validar email
        if (!emailInput.value || !emailInput.value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            emailInput.classList.add('is-invalid');
            isValid = false;
        } else {
            emailInput.classList.remove('is-invalid');
            emailInput.classList.add('is-valid');
        }
        
        // Validar contraseña
        if (!passwordInput.value || passwordInput.value.length < 6) {
            passwordInput.classList.add('is-invalid');
            isValid = false;
        } else {
            passwordInput.classList.remove('is-invalid');
            passwordInput.classList.add('is-valid');
        }
        
        if (!isValid) {
            shakeInvalidFields();
        }
        
        return isValid;
    }

    // Forgot password handler
    forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault();
        // Abrir modal de recuperación de contraseña
        alert('Funcionalidad de recuperación de contraseña en desarrollo');
    });

    // Helper function to shake invalid fields
    function shakeInvalidFields() {
        const invalidInputs = loginForm.querySelectorAll('.is-invalid');
        invalidInputs.forEach(input => {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        });
    }

    // Cargar email recordado si existe
    function loadRememberedEmail() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            emailInput.value = rememberedEmail;
            document.getElementById('rememberMe').checked = true;
        }
    }
    
    // Verificar si el usuario ya está autenticado
    function checkAuthentication() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Asegurarse de que el valor de user sea un objeto válido para parsear
                const userStr = localStorage.getItem('user');
                
                // Si no hay usuario en localStorage o es 'undefined', limpiar y salir
                if (!userStr || userStr === 'undefined') {
                    console.error('Datos de usuario inválidos en localStorage');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    return;
                }
                
                const user = JSON.parse(userStr);
                
                // Redirigir a la página correspondiente utilizando rutas absolutas
                const targetUrl = user.role === 'admin'
                    ? '/admin-users.html'
                    : '/dashboard.html';
                console.log('» Usuario ya autenticado, redirigiendo a:', targetUrl);
                window.location.href = targetUrl;
            } catch (e) {
                console.error('Error al parsear datos de usuario:', e);
                // Si hay un error al parsear el usuario, limpiar localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    }

    // Add input event listeners for real-time validation
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', function() {
            // Realtime validation as user types
            if (input === emailInput) {
                if (emailInput.value && emailInput.value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
                    emailInput.classList.remove('is-invalid');
                    emailInput.classList.add('is-valid');
                } else if (emailInput.value) {
                    emailInput.classList.remove('is-valid');
                    emailInput.classList.add('is-invalid');
                } else {
                    emailInput.classList.remove('is-valid', 'is-invalid');
                }
            } else if (input === passwordInput) {
                if (passwordInput.value && passwordInput.value.length >= 6) {
                    passwordInput.classList.remove('is-invalid');
                    passwordInput.classList.add('is-valid');
                } else if (passwordInput.value) {
                    passwordInput.classList.remove('is-valid');
                    passwordInput.classList.add('is-invalid');
                } else {
                    passwordInput.classList.remove('is-valid', 'is-invalid');
                }
            }
        });
    });

    // Verificar autenticación al cargar
    checkAuthentication();
    
    // Cargar email recordado
    loadRememberedEmail();
}); 