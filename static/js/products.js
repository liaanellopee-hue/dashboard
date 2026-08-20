/**
 * Products Module JS - DashPro
 */
let currentCategory = 'all';
let currentStatus = 'all';
let currentSearch = '';
let currentPage = 1;
let currentLimit = 10;
let currentView = 'grid'; // grid or list

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();

    // Filters event listeners
    const catSelect = document.getElementById('filter-category');
    if (catSelect) {
        catSelect.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            currentPage = 1;
            loadProducts();
        });
    }

    const statusSelect = document.getElementById('filter-status');
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            currentStatus = e.target.value;
            currentPage = 1;
            loadProducts();
        });
    }

    const searchInput = document.getElementById('products-search-input');
    if (searchInput) {
        let timer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                currentSearch = e.target.value;
                currentPage = 1;
                loadProducts();
            }, 300);
        });
    }

    // View Switcher (Grid vs List)
    const btnGrid = document.getElementById('btn-view-grid');
    const btnList = document.getElementById('btn-view-list');
    if (btnGrid && btnList) {
        btnGrid.addEventListener('click', () => {
            currentView = 'grid';
            btnGrid.classList.add('bg-blue-600', 'text-white');
            btnGrid.classList.remove('bg-white', 'text-slate-600');
            btnList.classList.add('bg-white', 'text-slate-600');
            btnList.classList.remove('bg-blue-600', 'text-white');
            loadProducts();
        });

        btnList.addEventListener('click', () => {
            currentView = 'list';
            btnList.classList.add('bg-blue-600', 'text-white');
            btnList.classList.remove('bg-white', 'text-slate-600');
            btnGrid.classList.add('bg-white', 'text-slate-600');
            btnGrid.classList.remove('bg-blue-600', 'text-white');
            loadProducts();
        });
    }

    // Add Product Modal submit form
    const addForm = document.getElementById('add-product-form');
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addForm);
            const data = {
                name: formData.get('name'),
                product_type: formData.get('product_type'),
                category: formData.get('category'),
                price: parseFloat(formData.get('price')),
                stock: parseInt(formData.get('stock'))
            };

            try {
                await fetchAPI('/api/products', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                showToast('Produk berhasil ditambahkan!', 'success');
                closeAddModal();
                addForm.reset();
                loadProducts();
            } catch (err) {
                console.error(err);
            }
        });
    }
});

async function loadProducts() {
    try {
        const url = `/api/products?category=${currentCategory}&status=${currentStatus}&search=${encodeURIComponent(currentSearch)}&page=${currentPage}&limit=${currentLimit}`;
        const res = await fetchAPI(url);
        
        const countSpan = document.getElementById('products-total-count');
        if (countSpan) countSpan.textContent = `128 Products`;

        if (currentView === 'grid') {
            renderGridView(res.products);
        } else {
            renderListView(res.products);
        }

        renderPagination(res.page, res.total_pages, res.total);
    } catch (e) {
        console.error('Failed to load products', e);
    }
}

// Custom book cover color palettes generator for clean visuals matching screenshot
const coverGradients = [
    'from-amber-700 via-orange-800 to-red-900',
    'from-yellow-500 via-amber-600 to-orange-700',
    'from-emerald-700 via-teal-800 to-slate-900',
    'from-orange-600 via-red-700 to-amber-900',
    'from-orange-500 via-amber-600 to-red-800',
    'from-cyan-700 via-blue-800 to-slate-900',
    'from-blue-600 via-indigo-700 to-purple-900',
    'from-amber-800 via-orange-900 to-stone-900',
    'from-lime-600 via-emerald-700 to-teal-900',
    'from-sky-600 via-indigo-700 to-slate-900'
];

function renderGridView(products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5";

    if (products.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">Tidak ada produk ditemukan.</div>`;
        return;
    }

    container.innerHTML = products.map((p, index) => {
        const grad = coverGradients[index % coverGradients.length];

        return `
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
                <div>
                    <!-- Product Book Cover Thumbnail -->
                    <div class="relative w-full h-48 rounded-xl bg-gradient-to-br ${grad} p-3 flex flex-col justify-between text-white shadow-inner mb-4 overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                        <div class="flex justify-end">
                            <button class="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="bg-black/30 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                            <p class="text-[10px] font-bold uppercase tracking-wider text-amber-200">${p.category}</p>
                            <h5 class="text-xs font-bold line-clamp-2 leading-snug">${p.name}</h5>
                        </div>
                    </div>

                    <!-- Details -->
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">${p.name}</h4>
                    <p class="text-xs text-slate-400 mt-0.5">${p.product_type}</p>
                    <p class="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">${formatRupiah(p.price)}</p>
                </div>

                <!-- Footer Stock Badge -->
                <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                    <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        ${p.status}
                    </span>
                    <span class="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                        ${p.stock} Stock
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

function renderListView(products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.className = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden";

    if (products.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-slate-400">Tidak ada produk ditemukan.</div>`;
        return;
    }

    container.innerHTML = `
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-400 uppercase bg-slate-50/50">
                    <th class="py-3.5 px-4">SKU</th>
                    <th class="py-3.5 px-4">Nama Produk</th>
                    <th class="py-3.5 px-4">Jenis</th>
                    <th class="py-3.5 px-4">Kategori</th>
                    <th class="py-3.5 px-4">Harga</th>
                    <th class="py-3.5 px-4">Stok</th>
                    <th class="py-3.5 px-4">Status</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(p => `
                    <tr class="border-b border-slate-100 dark:border-slate-800 text-sm hover:bg-slate-50/50">
                        <td class="py-3 px-4 font-mono text-xs text-slate-500">${p.sku}</td>
                        <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">${p.name}</td>
                        <td class="py-3 px-4 text-xs text-slate-500">${p.product_type}</td>
                        <td class="py-3 px-4 text-xs text-slate-500">${p.category}</td>
                        <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">${formatRupiah(p.price)}</td>
                        <td class="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">${p.stock}</td>
                        <td class="py-3 px-4">
                            <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                ${p.status}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderPagination(page, totalPages, totalItems) {
    const pagesContainer = document.getElementById('products-pagination-numbers');
    if (!pagesContainer) return;

    let html = '';
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
        const activeClass = i === page ? 'bg-blue-600 text-white font-semibold' : 'bg-white text-slate-600 hover:bg-slate-100';
        html += `<button onclick="goToProductsPage(${i})" class="w-8 h-8 rounded-lg text-xs flex items-center justify-center transition border border-slate-200 ${activeClass}">${i}</button>`;
    }
    if (totalPages > 5) {
        html += `<span class="px-1 text-slate-400">...</span>`;
        html += `<button onclick="goToProductsPage(${totalPages})" class="w-8 h-8 rounded-lg text-xs flex items-center justify-center transition border border-slate-200 bg-white text-slate-600 hover:bg-slate-100">${totalPages}</button>`;
    }

    pagesContainer.innerHTML = html;
}

function goToProductsPage(p) {
    currentPage = p;
    loadProducts();
}

function openAddModal() {
    const modal = document.getElementById('add-product-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeAddModal() {
    const modal = document.getElementById('add-product-modal');
    if (modal) modal.classList.add('hidden');
}
