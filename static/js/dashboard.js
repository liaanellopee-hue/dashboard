/**
 * Dashboard Module JS - DashPro
 */
let revenueChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    loadDashboardStats();
    loadRevenueChart();
    loadTopProducts();
    loadRecentOrders();
});

async function loadDashboardStats() {
    try {
        const stats = await fetchAPI('/api/dashboard/stats');
        
        document.getElementById('stat-total-revenue').textContent = stats.total_revenue.formatted;
        document.getElementById('stat-total-orders').textContent = stats.total_orders.formatted;
        document.getElementById('stat-total-customers').textContent = stats.total_customers.formatted;
        document.getElementById('stat-total-products').textContent = stats.total_products.formatted;

        document.getElementById('trend-revenue').textContent = `↑ ${stats.total_revenue.trend}% from last month`;
        document.getElementById('trend-orders').textContent = `↑ ${stats.total_orders.trend}% from last month`;
        document.getElementById('trend-customers').textContent = `↑ ${stats.total_customers.trend}% from last month`;
        document.getElementById('trend-products').textContent = `↑ ${stats.total_products.trend}% from last month`;
    } catch (e) {
        console.error('Failed to load dashboard stats', e);
    }
}

async function loadRevenueChart() {
    try {
        const res = await fetchAPI('/api/dashboard/revenue-chart');
        const chartData = res.chart_data;

        const ctx = document.getElementById('revenueChartCanvas').getContext('2d');

        const labels = chartData.map(d => d.date);
        const dataValues = chartData.map(d => d.revenue);

        // Create gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

        if (revenueChart) revenueChart.destroy();

        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue Overview',
                    data: dataValues,
                    borderColor: '#6366F1',
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: chartData.map(d => d.tooltip ? 6 : 3),
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#6366F1',
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1E1B4B',
                        titleColor: '#E0E7FF',
                        bodyColor: '#FFFFFF',
                        padding: 12,
                        cornerRadius: 10,
                        callbacks: {
                            label: function(context) {
                                return formatRupiah(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94A3B8', font: { size: 11 } }
                    },
                    y: {
                        grid: { color: '#F1F5F9' },
                        ticks: {
                            color: '#94A3B8',
                            font: { size: 11 },
                            callback: function(val) {
                                return 'Rp ' + (val / 1000000) + 'M';
                            }
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error('Failed to load revenue chart', e);
    }
}

async function loadTopProducts() {
    try {
        const products = await fetchAPI('/api/dashboard/top-products');
        const container = document.getElementById('top-products-list');
        if (!container) return;

        container.innerHTML = products.map(p => `
            <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold shrink-0">
                        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-slate-800 dark:text-white">${p.name}</h4>
                        <p class="text-xs text-slate-400">${p.sales_count} Sales</p>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error('Failed to load top products', e);
    }
}

async function loadRecentOrders() {
    try {
        const orders = await fetchAPI('/api/dashboard/recent-orders');
        const tbody = document.getElementById('recent-orders-tbody');
        if (!tbody) return;

        tbody.innerHTML = orders.map(o => {
            let statusBadgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
            if (o.status === 'Processing') statusBadgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
            if (o.status === 'Pending') statusBadgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
            if (o.status === 'Cancelled') statusBadgeClass = 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';

            return `
                <tr class="border-b border-slate-100 dark:border-slate-800 text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td class="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">${o.order_number}</td>
                    <td class="py-3 px-4 text-slate-600 dark:text-slate-400">${o.customer_name}</td>
                    <td class="py-3 px-4 text-slate-500">${o.order_date}</td>
                    <td class="py-3 px-4">
                        <span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass}">
                            ${o.status}
                        </span>
                    </td>
                    <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100 text-right">${formatRupiah(o.total_amount)}</td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        console.error('Failed to load recent orders', e);
    }
}
