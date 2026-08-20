/**
 * Settings / Profile Module JS - DashPro
 */
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    loadUserSettings();

    // Profile form submit
    const profileForm = document.getElementById('profile-info-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const full_name = document.getElementById('input-full-name').value;
            const email = document.getElementById('input-email').value;
            const phone = document.getElementById('input-phone').value;

            try {
                const res = await fetchAPI('/api/settings/profile', {
                    method: 'PUT',
                    body: JSON.stringify({ full_name, email, phone })
                });
                showToast('Informasi profil berhasil disimpan!', 'success');
                loadUserSettings();
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Save preferences button
    const btnSavePref = document.getElementById('btn-save-preferences');
    if (btnSavePref) {
        btnSavePref.addEventListener('click', async () => {
            const email_notifications = document.getElementById('toggle-email-notif').checked;
            const order_updates = document.getElementById('toggle-order-updates').checked;
            const marketing_emails = document.getElementById('toggle-marketing-emails').checked;
            const system_alerts = document.getElementById('toggle-system-alerts').checked;

            try {
                await fetchAPI('/api/settings/preferences', {
                    method: 'PUT',
                    body: JSON.stringify({ email_notifications, order_updates, marketing_emails, system_alerts })
                });
                showToast('Preferensi notifikasi berhasil diperbarui!', 'success');
            } catch (err) {
                console.error(err);
            }
        });
    }
});

async function loadUserSettings() {
    try {
        currentUser = await fetchAPI('/api/settings');

        // Fill form fields
        document.getElementById('input-full-name').value = currentUser.full_name || '';
        document.getElementById('input-email').value = currentUser.email || '';
        document.getElementById('input-phone').value = currentUser.phone || '';
        document.getElementById('input-role').value = currentUser.role || 'Admin';

        // Account summary card
        document.getElementById('summary-name').textContent = currentUser.full_name;
        document.getElementById('summary-role').textContent = currentUser.role;
        document.getElementById('summary-email').textContent = currentUser.email;
        document.getElementById('summary-member-since').textContent = currentUser.member_since;
        document.getElementById('summary-last-login').textContent = currentUser.last_login;
        document.getElementById('summary-status').textContent = currentUser.status;

        // Toggle switches
        document.getElementById('toggle-email-notif').checked = currentUser.email_notifications;
        document.getElementById('toggle-order-updates').checked = currentUser.order_updates;
        document.getElementById('toggle-marketing-emails').checked = currentUser.marketing_emails;
        document.getElementById('toggle-system-alerts').checked = currentUser.system_alerts;

        // Theme buttons state
        selectThemeButton(currentUser.theme || 'light');
        selectColorButton(currentUser.primary_color || 'blue');

    } catch (e) {
        console.error('Failed to load settings', e);
    }
}

function selectThemeButton(theme) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('bg-white', 'dark:bg-slate-700', 'shadow-md', 'font-bold', 'border-blue-500');
        if (btn.dataset.theme === theme) {
            btn.classList.add('bg-white', 'dark:bg-slate-700', 'shadow-md', 'font-bold', 'border-blue-500');
        }
    });
}

function selectColorButton(color) {
    document.querySelectorAll('.color-palette-btn').forEach(btn => {
        btn.classList.remove('ring-4', 'ring-blue-300', 'scale-110');
        if (btn.dataset.color === color) {
            btn.classList.add('ring-4', 'ring-blue-300', 'scale-110');
        }
    });
}

async function setTheme(theme) {
    selectThemeButton(theme);
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    try {
        await fetchAPI('/api/settings/appearance', {
            method: 'PUT',
            body: JSON.stringify({ theme, primary_color: currentUser ? currentUser.primary_color : 'blue' })
        });
        showToast(`Tema diubah menjadi ${theme}!`, 'success');
    } catch (err) {
        console.error(err);
    }
}

async function setColor(color) {
    selectColorButton(color);
    document.documentElement.setAttribute('data-color', color);

    try {
        await fetchAPI('/api/settings/appearance', {
            method: 'PUT',
            body: JSON.stringify({ theme: currentUser ? currentUser.theme : 'light', primary_color: color })
        });
        showToast(`Warna utama diubah!`, 'success');
    } catch (err) {
        console.error(err);
    }
}
