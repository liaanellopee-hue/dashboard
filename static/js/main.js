/**
 * DashPro - Main Shared JavaScript Utilities
 */

// Helper to format numbers as Indonesian Rupiah
function formatRupiah(amount) {
    if (amount === undefined || amount === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(amount).replace('IDR', 'Rp').trim();
}

// Fetch helper wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API Fetch Error [${endpoint}]:`, error);
        showToast(error.message || 'Terjadi kesalahan saat memuat data', 'error');
        throw error;
    }
}

// Global Toast Notification Helper
function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-600' : (type === 'error' ? 'bg-rose-600' : 'bg-slate-800');
    
    toast.className = `${bgClass} text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto text-sm font-medium`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-auto opacity-70 hover:opacity-100">&times;</button>
    `;

    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    // Auto remove
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Load and apply User Appearance Settings (Theme & Primary Accent Color)
async function initAppearance() {
    try {
        const user = await fetchAPI('/api/settings');
        if (!user) return;

        // Apply theme (Light / Dark)
        const theme = user.theme || 'light';
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Apply primary color accent class
        const color = user.primary_color || 'blue';
        document.documentElement.setAttribute('data-color', color);

        // Update sidebar profile name & role if elements exist
        const sidebarName = document.getElementById('sidebar-user-name');
        const sidebarRole = document.getElementById('sidebar-user-role');
        const sidebarAvatar = document.getElementById('sidebar-user-avatar');

        if (sidebarName) sidebarName.textContent = user.full_name || 'Lia Vrillia';
        if (sidebarRole) sidebarRole.textContent = user.role || 'Admin';
        if (sidebarAvatar && user.avatar_url) sidebarAvatar.src = user.avatar_url;

    } catch (err) {
        console.warn('Could not load user appearance settings:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAppearance();
});
