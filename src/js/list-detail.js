// List Detail JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize variables
    const listId = new URLSearchParams(window.location.search).get('id');
    let currentList = null;

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Load list data
    const loadListData = async () => {
        try {
            const response = await fetch(`/api/lists/${listId}`);
            if (!response.ok) throw new Error('List not found');
            
            currentList = await response.json();
            updateListUI();
        } catch (error) {
            console.error('Error loading list:', error);
            showToast('Error loading list data', 'danger');
        }
    };

    // Update UI with list data
    const updateListUI = () => {
        // Update title and description
        document.getElementById('listTitle').textContent = currentList.title;
        document.getElementById('listDescription').textContent = currentList.description || 'No description';

        // Update progress
        const completedItems = currentList.items.filter(item => item.completed).length;
        const totalItems = currentList.items.length;
        const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
        
        document.getElementById('progressBar').style.width = `${progressPercentage}%`;
        document.getElementById('progressText').textContent = `${completedItems} of ${totalItems} items completed`;

        // Update tags
        const tagsContainer = document.getElementById('listTags');
        tagsContainer.innerHTML = currentList.tags.map(tag => 
            `<span class="badge bg-secondary me-1">${tag}</span>`
        ).join('');

        // Update items list
        renderItems();

        // Update activity log
        renderActivityLog();
    };

    // Render list items
    const renderItems = () => {
        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = currentList.items.map((item, index) => `
            <div class="list-group-item d-flex align-items-center slide-in" data-item-id="${item.id}">
                <div class="form-check flex-grow-1">
                    <input class="form-check-input" type="checkbox" value="" id="item${index}"
                        ${item.completed ? 'checked' : ''} onchange="toggleItemComplete(${item.id})">
                    <label class="form-check-label ${item.completed ? 'text-decoration-line-through' : ''}" 
                        for="item${index}">
                        ${item.text}
                    </label>
                </div>
                <div class="btn-group">
                    <button class="btn btn-link" onclick="editItem(${item.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-link text-danger" onclick="deleteItem(${item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    };

    // Render activity log
    const renderActivityLog = () => {
        const activityLog = document.getElementById('activityLog');
        activityLog.innerHTML = currentList.activities.map(activity => `
            <div class="list-group-item fade-in">
                <div class="d-flex w-100 justify-content-between">
                    <p class="mb-1">${activity.description}</p>
                    <small>${formatDate(activity.timestamp)}</small>
                </div>
            </div>
        `).join('');
    };

    // Add new item
    const addItemForm = document.getElementById('addItemForm');
    addItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('newItemInput');
        const text = input.value.trim();
        
        if (!text) return;

        try {
            const response = await fetch(`/api/lists/${listId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (!response.ok) throw new Error('Failed to add item');
            
            const newItem = await response.json();
            currentList.items.push(newItem);
            input.value = '';
            updateListUI();
            showToast('Item added successfully', 'success');
        } catch (error) {
            console.error('Error adding item:', error);
            showToast('Error adding item', 'danger');
        }
    });

    // Toggle item complete
    window.toggleItemComplete = async (itemId) => {
        try {
            const item = currentList.items.find(i => i.id === itemId);
            const newStatus = !item.completed;

            const response = await fetch(`/api/lists/${listId}/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update item');

            item.completed = newStatus;
            updateListUI();
        } catch (error) {
            console.error('Error updating item:', error);
            showToast('Error updating item', 'danger');
        }
    };

    // Edit item
    window.editItem = async (itemId) => {
        const item = currentList.items.find(i => i.id === itemId);
        const newText = prompt('Edit item:', item.text);
        
        if (!newText || newText === item.text) return;

        try {
            const response = await fetch(`/api/lists/${listId}/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newText })
            });

            if (!response.ok) throw new Error('Failed to update item');

            item.text = newText;
            updateListUI();
            showToast('Item updated successfully', 'success');
        } catch (error) {
            console.error('Error updating item:', error);
            showToast('Error updating item', 'danger');
        }
    };

    // Delete item
    window.deleteItem = async (itemId) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await fetch(`/api/lists/${listId}/items/${itemId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete item');

            currentList.items = currentList.items.filter(i => i.id !== itemId);
            updateListUI();
            showToast('Item deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting item:', error);
            showToast('Error deleting item', 'danger');
        }
    };

    // Share list
    document.getElementById('shareList').addEventListener('click', () => {
        const shareUrl = `${window.location.origin}/list-detail.html?id=${listId}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => showToast('Link copied to clipboard!', 'success'))
            .catch(() => showToast('Failed to copy link', 'danger'));
    });

    // Export list
    document.getElementById('exportList').addEventListener('click', () => {
        const exportData = {
            ...currentList,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentList.title.toLowerCase().replace(/\s+/g, '-')}-export.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Delete list
    document.getElementById('deleteList').addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this list? This action cannot be undone.')) return;

        try {
            const response = await fetch(`/api/lists/${listId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete list');

            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Error deleting list:', error);
            showToast('Error deleting list', 'danger');
        }
    });

    // Utility functions
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const showToast = (message, type = 'info') => {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toastContainer.removeChild(toast);
        });
    };

    // Initialize
    loadListData();
}); 