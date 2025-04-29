/**
 * Sistema de Notificaciones
 * Este script maneja la funcionalidad del sistema de notificaciones
 */

// Clase principal del sistema de notificaciones
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.maxNotifications = 50; // Límite de notificaciones para evitar sobrecarga
        this.init();
    }

    // Inicializar el sistema
    init() {
        // Elementos DOM para el botón de notificación y menú
        this.notificationBtn = document.querySelector('.notification-btn');
        this.notificationBadge = document.querySelector('.notification-badge');
        this.notificationMenu = document.querySelector('.notification-menu');
        this.notificationList = document.querySelector('.notification-list');
        
        // Inicializar eventos
        this.attachEvents();
        
        // Crear el contenedor para las notificaciones toast
        this.createToastContainer();
        
        // Actualizar contador de notificaciones
        this.updateNotificationBadge();
        
        // Cargar notificaciones guardadas (si hay)
        this.loadSavedNotifications();
    }

    // Adjuntar eventos a elementos DOM
    attachEvents() {
        // Botón de notificación - abrir/cerrar menú
        if (this.notificationBtn) {
            this.notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotificationMenu();
            });
        }
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (this.notificationMenu && this.notificationMenu.classList.contains('active')) {
                if (!this.notificationMenu.contains(e.target) && e.target !== this.notificationBtn) {
                    this.notificationMenu.classList.remove('active');
                }
            }
        });
        
        // Botones de acción en el menú
        const markAllReadBtn = document.querySelector('.mark-all-read');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.markAllAsRead();
            });
        }
        
        const clearAllBtn = document.querySelector('.clear-all');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearAllNotifications();
            });
        }
    }

    // Crear contenedor para toast notifications
    createToastContainer() {
        this.toastContainer = document.querySelector('.toast-container');
        
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        }
    }

    // Alternar visibilidad del menú de notificaciones
    toggleNotificationMenu() {
        this.notificationMenu.classList.toggle('active');
    }

    // Crear una nueva notificación
    createNotification(options) {
        const defaultOptions = {
            title: 'Nueva notificación',
            message: '',
            type: 'info', // 'info', 'success', 'warning', 'danger'
            time: new Date(),
            read: false,
            actions: [],
            showToast: true,
            autoClose: true,
            duration: 5000, // Duración en ms para el cierre automático
        };
        
        // Combinar opciones por defecto con las proporcionadas
        const notification = {...defaultOptions, ...options};
        
        // Formatear tiempo
        notification.formattedTime = this.formatTime(notification.time);
        
        // Establecer ID único
        notification.id = 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        
        // Añadir notificación al array
        this.addNotification(notification);
        
        // Mostrar toast si está activado
        if (notification.showToast) {
            this.showToast(notification);
        }
        
        return notification;
    }

    // Añadir notificación a la lista y actualizar UI
    addNotification(notification) {
        // Añadir al principio del array
        this.notifications.unshift(notification);
        
        // Limitar el número máximo de notificaciones
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.maxNotifications);
        }
        
        // Incrementar contador de no leídas
        if (!notification.read) {
            this.unreadCount++;
        }
        
        // Actualizar UI
        this.updateNotificationBadge();
        this.renderNotifications();
        this.saveNotifications();
    }

    // Renderizar la lista de notificaciones
    renderNotifications() {
        // Limpiar lista actual
        if (!this.notificationList) return;
        
        this.notificationList.innerHTML = '';
        
        // Comprobar si hay notificaciones
        if (this.notifications.length === 0) {
            const emptyNode = document.createElement('div');
            emptyNode.className = 'empty-notifications';
            emptyNode.textContent = 'No tienes notificaciones';
            this.notificationList.appendChild(emptyNode);
            return;
        }
        
        // Generar elementos de notificación
        this.notifications.forEach(notification => {
            const notificationItem = this.createNotificationElement(notification);
            this.notificationList.appendChild(notificationItem);
        });
    }

    // Crear elemento DOM para una notificación
    createNotificationElement(notification) {
        const itemEl = document.createElement('div');
        itemEl.className = `notification-item ${notification.read ? '' : 'unread'}`;
        itemEl.dataset.id = notification.id;
        
        const iconEl = document.createElement('div');
        iconEl.className = `notification-icon ${notification.type}`;
        iconEl.innerHTML = this.getIconForType(notification.type);
        
        const contentEl = document.createElement('div');
        contentEl.className = 'notification-content';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'notification-title';
        titleEl.textContent = notification.title;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'notification-message';
        messageEl.textContent = notification.message;
        
        const timeEl = document.createElement('div');
        timeEl.className = 'notification-time';
        timeEl.textContent = notification.formattedTime;
        
        contentEl.appendChild(titleEl);
        contentEl.appendChild(messageEl);
        contentEl.appendChild(timeEl);
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeNotification(notification.id);
        });
        
        itemEl.appendChild(iconEl);
        itemEl.appendChild(contentEl);
        itemEl.appendChild(closeBtn);
        
        // Evento para marcar como leída
        itemEl.addEventListener('click', () => {
            if (!notification.read) {
                this.markAsRead(notification.id);
            }
        });
        
        return itemEl;
    }

    // Mostrar notificación como toast
    showToast(notification) {
        // Crear elemento toast
        const toast = document.createElement('div');
        toast.className = `toast ${notification.type}`;
        toast.dataset.id = notification.id;
        
        const iconEl = document.createElement('div');
        iconEl.className = `toast-icon ${notification.type}`;
        iconEl.innerHTML = this.getIconForType(notification.type);
        
        const contentEl = document.createElement('div');
        contentEl.className = 'toast-content';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'toast-title';
        titleEl.textContent = notification.title;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'toast-message';
        messageEl.textContent = notification.message;
        
        contentEl.appendChild(titleEl);
        contentEl.appendChild(messageEl);
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            this.closeToast(toast);
        });
        
        toast.appendChild(iconEl);
        toast.appendChild(contentEl);
        toast.appendChild(closeBtn);
        
        // Añadir al contenedor
        this.toastContainer.appendChild(toast);
        
        // Auto-cerrar después de un tiempo si está activado
        if (notification.autoClose) {
            setTimeout(() => {
                if (toast.parentElement) {
                    this.closeToast(toast);
                }
            }, notification.duration);
        }
    }

    // Cerrar toast con animación
    closeToast(toastElement) {
        toastElement.classList.add('hiding');
        setTimeout(() => {
            if (toastElement.parentElement) {
                toastElement.parentElement.removeChild(toastElement);
            }
        }, 300); // Duración de la animación
    }

    // Marcar notificación como leída
    markAsRead(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1 && !this.notifications[index].read) {
            this.notifications[index].read = true;
            this.unreadCount--;
            this.updateNotificationBadge();
            this.renderNotifications();
            this.saveNotifications();
        }
    }

    // Marcar todas las notificaciones como leídas
    markAllAsRead() {
        let updated = false;
        
        this.notifications.forEach(notification => {
            if (!notification.read) {
                notification.read = true;
                updated = true;
            }
        });
        
        if (updated) {
            this.unreadCount = 0;
            this.updateNotificationBadge();
            this.renderNotifications();
            this.saveNotifications();
        }
    }

    // Eliminar una notificación
    removeNotification(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            // Si no estaba leída, actualizar contador
            if (!this.notifications[index].read) {
                this.unreadCount--;
            }
            
            // Eliminar del array
            this.notifications.splice(index, 1);
            
            // Actualizar UI
            this.updateNotificationBadge();
            this.renderNotifications();
            this.saveNotifications();
            
            // Cerrar toast si existe
            const toast = document.querySelector(`.toast[data-id="${id}"]`);
            if (toast) {
                this.closeToast(toast);
            }
        }
    }

    // Limpiar todas las notificaciones
    clearAllNotifications() {
        this.notifications = [];
        this.unreadCount = 0;
        this.updateNotificationBadge();
        this.renderNotifications();
        this.saveNotifications();
    }

    // Actualizar contador de notificaciones
    updateNotificationBadge() {
        if (!this.notificationBadge) return;
        
        if (this.unreadCount > 0) {
            this.notificationBadge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            this.notificationBadge.classList.add('has-notifications');
            this.notificationBadge.style.display = 'flex';
        } else {
            this.notificationBadge.style.display = 'none';
        }
    }

    // Formatear timestamp a texto legible
    formatTime(time) {
        const now = new Date();
        const date = new Date(time);
        
        // Calcular diferencia en milisegundos
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        // Hace menos de un minuto
        if (seconds < 60) {
            return 'hace un momento';
        }
        // Hace minutos
        else if (minutes < 60) {
            return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
        }
        // Hace horas
        else if (hours < 24) {
            return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        }
        // Hace días (hasta 7)
        else if (days < 7) {
            return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
        }
        // Fecha formateada
        else {
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    // Obtener ícono según el tipo de notificación
    getIconForType(type) {
        switch (type) {
            case 'info':
                return '<i class="fas fa-info-circle"></i>';
            case 'success':
                return '<i class="fas fa-check-circle"></i>';
            case 'warning':
                return '<i class="fas fa-exclamation-triangle"></i>';
            case 'danger':
                return '<i class="fas fa-exclamation-circle"></i>';
            default:
                return '<i class="fas fa-bell"></i>';
        }
    }

    // Guardar notificaciones en localStorage
    saveNotifications() {
        try {
            localStorage.setItem('notifications', JSON.stringify(this.notifications));
        } catch (e) {
            console.error('Error al guardar notificaciones:', e);
        }
    }

    // Cargar notificaciones desde localStorage
    loadSavedNotifications() {
        try {
            const saved = localStorage.getItem('notifications');
            if (saved) {
                this.notifications = JSON.parse(saved);
                this.unreadCount = this.notifications.filter(n => !n.read).length;
                this.renderNotifications();
                this.updateNotificationBadge();
            }
        } catch (e) {
            console.error('Error al cargar notificaciones:', e);
        }
    }
}

// Inicializar el sistema cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia del sistema de notificaciones
    window.notificationSystem = new NotificationSystem();
    
    // Conectar botones demo (si están presentes)
    setupDemoButtons();
});

// Función para configurar botones de demo
function setupDemoButtons() {
    const demoButtons = document.querySelectorAll('.demo-button');
    if (demoButtons.length === 0) return;
    
    demoButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type || 'info';
            let title, message;
            
            switch (type) {
                case 'info':
                    title = 'Información';
                    message = 'Esta es una notificación informativa';
                    break;
                case 'success':
                    title = '¡Operación completada!';
                    message = 'La operación se ha realizado con éxito';
                    break;
                case 'warning':
                    title = 'Advertencia';
                    message = 'Se ha detectado una posible incidencia';
                    break;
                case 'danger':
                    title = '¡Error!';
                    message = 'Se ha producido un error en la operación';
                    break;
                default:
                    title = 'Notificación';
                    message = 'Este es el contenido de la notificación';
            }
            
            window.notificationSystem.createNotification({
                title: title,
                message: message,
                type: type
            });
        });
    });
}

// Funciones de utilidad para crear notificaciones desde cualquier lugar
window.createNotification = function(options) {
    if (window.notificationSystem) {
        return window.notificationSystem.createNotification(options);
    } else {
        console.error('El sistema de notificaciones no está inicializado');
        return null;
    }
};

window.toast = {
    info: function(title, message, options = {}) {
        return window.createNotification({
            title: title,
            message: message,
            type: 'info',
            ...options
        });
    },
    success: function(title, message, options = {}) {
        return window.createNotification({
            title: title,
            message: message,
            type: 'success',
            ...options
        });
    },
    warning: function(title, message, options = {}) {
        return window.createNotification({
            title: title,
            message: message,
            type: 'warning',
            ...options
        });
    },
    danger: function(title, message, options = {}) {
        return window.createNotification({
            title: title,
            message: message,
            type: 'danger',
            ...options
        });
    }
}; 