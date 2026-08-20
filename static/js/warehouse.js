/**
 * Warehouse Module JS - DashPro
 */
let stockDonutChart = null;

document.addEventListener('DOMContentLoaded', () => {
    loadWarehouseStats();
    loadInboundGoods();
    loadStockSummaryChart();
    loadRecentActivities();
});

async function loadWarehouseStats() {
    try {
        const stats = await fetchAPI('/api/warehouse/stats');
        document.getElementById('wh-total-stock').textContent = stats.total_stock.value;
        document.getElementById('wh-barang-masuk').textContent = stats.barang_masuk.value;
        document.getElementById('wh-barang-return').textContent = stats.barang_return.value;
        document.getElementById('wh-total-sku').textContent = stats.total_produk.value;
        document.getElementById('wh-warning-sku').textContent = stats.warning_produk.value;
    } catch (e) {
        console.error('Failed to load warehouse stats', e);
    }
}

async function loadInboundGoods() {
    try {
        const logs = await fetchAPI('/api/warehouse/inbound');
        const tbody1 = document.getElementById('inbound-tbody-1');
        const tbody2 = document.getElementById('inbound-tbody-2');

        const rowsHTML = logs.map(l => `
            <tr class="border-b border-slate-100 dark:border-slate-800 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                <td class="py-2.5 px-3 text-slate-500">${l.date_str}</td>
                <td class="py-2.5 px-3 font-semibold text-blue-600 dark:text-blue-400">${l.transaction_no}</td>
                <td class="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">${l.supplier}</td>
                <td class="py-2.5 px-3 text-slate-600 dark:text-slate-300">${l.product_name}</td>
                <td class="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-100">${l.quantity}</td>
                <td class="py-2.5 px-3">
                    <span class="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        ${l.status}
                    </span>
                </td>
            </tr>
        `).join('');

        if (tbody1) tbody1.innerHTML = rowsHTML;
        if (tbody2) tbody2.innerHTML = rowsHTML;
    } catch (e) {
        console.error('Failed to load inbound goods', e);
    }
}

async function loadStockSummaryChart() {
    try {
        const res = await fetchAPI('/api/warehouse/stock-summary');
        const categories = res.categories;

        const ctx = document.getElementById('stockDonutCanvas').getContext('2d');

        if (stockDonutChart) stockDonutChart.destroy();

        stockDonutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories.map(c => c.category),
                datasets: [{
                    data: categories.map(c => c.total_stock),
                    backgroundColor: categories.map(c => c.color),
                    borderWidth: 0,
                    cutout: '72%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${context.raw} pcs`;
                            }
                        }
                    }
                }
            }
        });

        // Render legend list
        const legendContainer = document.getElementById('stock-legend-list');
        if (legendContainer) {
            legendContainer.innerHTML = categories.map(c => `
                <div class="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full shrink-0" style="background-color: ${c.color}"></span>
                        <span class="font-medium text-slate-700 dark:text-slate-300">${c.category}</span>
                    </div>
                    <div class="flex items-center gap-6">
                        <span class="font-semibold text-slate-800 dark:text-slate-100">${c.total_stock.toLocaleString('id-ID')}</span>
                        <div class="w-16 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div class="h-full rounded-full" style="width: ${c.percentage}%; background-color: ${c.color}"></div>
                        </div>
                        <span class="w-8 text-right font-medium text-slate-500">${c.percentage}%</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error('Failed to load stock summary chart', e);
    }
}

async function loadRecentActivities() {
    try {
        const activities = await fetchAPI('/api/warehouse/activities');
        const container = document.getElementById('activities-feed-list');
        if (!container) return;

        container.innerHTML = activities.map(a => {
            let iconBg = 'bg-emerald-100 text-emerald-600';
            let iconSVG = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>';

            if (a.type === 'Barang Return') {
                iconBg = 'bg-amber-100 text-amber-600';
                iconSVG = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>';
            } else if (a.type === 'Stok Diperbarui') {
                iconBg = 'bg-blue-100 text-blue-600';
                iconSVG = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>';
            } else if (a.type === 'Stok Menipis') {
                iconBg = 'bg-rose-100 text-rose-600';
                iconSVG = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>';
            }

            return `
                <div class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">${iconSVG}</svg>
                        </div>
                        <div>
                            <h4 class="text-xs font-semibold text-slate-800 dark:text-slate-100">${a.type} <span class="font-normal text-slate-600">${a.product_name}</span> sebanyak ${a.quantity} pcs</h4>
                            <p class="text-[11px] text-slate-400">Oleh ${a.user_name}</p>
                        </div>
                    </div>
                    <span class="text-xs text-slate-400 shrink-0">${a.time_ago_str}</span>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Failed to load warehouse activities', e);
    }
}
