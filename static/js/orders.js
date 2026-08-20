/**
 * Orders Module JS - DashPro
 */
let currentTab = 'all';
let currentPage = 1;
let currentLimit = 8;
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
    loadOrdersStats();
    loadOrders();

    // Tab buttons event listeners
    document.querySelectorAll('.order-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.order-tab-btn').forEach(b => {
                b.classList.remove('border-blue-600', 'text-blue-600', 'font-semibold');
                b.classList.add('text-slate-500', 'border-transparent');
            });

            e.currentTarget.classList.add('border-blue-600', 'text-blue-600', 'font-semibold');
            e.currentTarget.classList.remove('text-slate-500', 'border-transparent');

            currentTab = e.currentTarget.dataset.tab;
            currentPage = 1;
            loadOrders();
        });
    });

    // Search input listener
    const searchInput = document.getElementById('orders-search-input');
    if (searchInput) {
        let timer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                currentSearch = e.target.value;
                currentPage = 1;
                loadOrders();
            }, 300);
        });
    }

    // Items per page listener
    const perPageSelect = document.getElementById('per-page-select');
    if (perPageSelect) {
        perPageSelect.addEventListener('change', (e) => {
            currentLimit = parseInt(e.target.value);
            currentPage = 1;
            loadOrders();
        });
    }
});

async function loadOrdersStats() {
    try {
        const stats = await fetchAPI('/api/orders/stats');
        document.getElementById('ord-stat-total').textContent = stats.total_orders.formatted;
        document.getElementById('ord-stat-completed').textContent = stats.completed.formatted;
        document.getElementById('ord-stat-processing').textContent = stats.processing.formatted;
        document.getElementById('ord-stat-cancelled').textContent = stats.cancelled.formatted;
    } catch (e) {
        console.error('Failed to load order stats', e);
    }
}

async function loadOrders() {
    try {
        const url = `/api/orders?status=${currentTab}&page=${currentPage}&limit=${currentLimit}&search=${encodeURIComponent(currentSearch)}`;
        const res = await fetchAPI(url);
        
        renderOrdersTable(res.orders);
        renderPagination(res.page, res.total_pages, res.total);
    } catch (e) {
        console.error('Failed to load orders', e);
    }
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-8 text-slate-400">Tidak ada pesanan ditemukan.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map(o => {
        let statusBadge = 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
        if (o.status === 'Completed') statusBadge = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
        if (o.status === 'Cancelled') statusBadge = 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
        if (o.status === 'Pending') statusBadge = 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';

        let paymentBadge = 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300';
        if (o.payment_method === 'Debit') paymentBadge = 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
        if (o.payment_method === 'Cash') paymentBadge = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';

        return `
            <tr class="border-b border-slate-100 dark:border-slate-800 text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                <td class="py-4 px-4"><input type="checkbox" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"></td>
                <td class="py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">${o.order_number}</td>
                <td class="py-4 px-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            ${o.customer_name ? o.customer_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                            <div class="font-medium text-slate-800 dark:text-slate-100">${o.customer_name}</div>
                            <div class="text-xs text-slate-400">${o.customer_email}</div>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-4 text-xs text-slate-500">
                    <div>${o.order_date}</div>
                    <div class="text-slate-400">${o.order_time}</div>
                </td>
                <td class="py-4 px-4">
                    <div class="flex items-center gap-1">
                        <div class="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700"></div>
                        <div class="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700"></div>
                        ${o.items_count > 2 ? `<span class="text-[10px] bg-slate-100 text-slate-500 font-semibold px-1 rounded">+${o.items_count - 2}</span>` : ''}
                    </div>
                </td>
                <td class="py-4 px-4 font-semibold text-slate-800 dark:text-slate-100">${formatRupiah(o.total_amount)}</td>
                <td class="py-4 px-4">
                    <span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusBadge}">
                        ${o.status}
                    </span>
                </td>
                <td class="py-4 px-4">
                    <span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold ${paymentBadge}">
                        ${o.payment_method}
                    </span>
                </td>
                <td class="py-4 px-4 text-right">
                    <button onclick="toggleActionMenu(${o.id})" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderPagination(page, totalPages, totalItems) {
    const info = document.getElementById('pagination-info');
    if (info) {
        const start = (page - 1) * currentLimit + 1;
        const end = Math.min(page * currentLimit, totalItems);
        info.textContent = `Showing ${start} to ${end} of 1.248 orders`;
    }

    const pagesContainer = document.getElementById('pagination-numbers');
    if (!pagesContainer) return;

    let html = '';
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
        const activeClass = i === page ? 'bg-blue-600 text-white font-semibold' : 'bg-white text-slate-600 hover:bg-slate-100';
        html += `<button onclick="goToPage(${i})" class="w-8 h-8 rounded-lg text-xs flex items-center justify-center transition border border-slate-200 ${activeClass}">${i}</button>`;
    }
    if (totalPages > 5) {
        html += `<span class="px-1 text-slate-400">...</span>`;
        html += `<button onclick="goToPage(${totalPages})" class="w-8 h-8 rounded-lg text-xs flex items-center justify-center transition border border-slate-200 bg-white text-slate-600 hover:bg-slate-100">${totalPages}</button>`;
    }

    pagesContainer.innerHTML = html;
}

function goToPage(p) {
    currentPage = p;
    loadOrders();
}
