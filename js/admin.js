/* ==========================================
   ADMIN.JS - Admin Dashboard & Management
   ========================================== */

const Admin = {
    // Render admin dashboard
    renderAdminDashboard() {
        if (!Auth.isAdmin()) {
            return `
                <div class="container">
                    <div class="empty-state">
                        <div class="empty-state-icon"><i class="fas fa-lock"></i></div>
                        <h3>${Utils.translate('accessDenied')}</h3>
                        <p>${Utils.translate('adminPrivilegesRequired')}</p>
                        <a href="#/" class="btn btn-primary">${Utils.translate('goHome')}</a>
                    </div>
                </div>
            `;
        }

        const products = Products.getProducts();
        const orders = Orders.getAllOrders();
        const users = Utils.Storage.get('users', []);

        const totalRevenue = orders.reduce((sum, order) => {
            if (order.orderStatus !== 'cancelled') {
                return sum + (order.totalAmount || 0);
            }
            return sum;
        }, 0);

        const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;

        return `
            <div class="container">
                <div class="section-header">
                    <h1 class="section-title">${Utils.translate('adminDashboard')}</h1>
                    <p class="section-subtitle">${Utils.translate('manageYourPlatform')}</p>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-4" style="margin-bottom: var(--spacing-2xl);">
                    <div style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); padding: var(--spacing-xl); border-radius: var(--radius-xl); color: white;">
                        <div style="font-size: var(--text-sm); opacity: 0.9; margin-bottom: var(--spacing-sm);">${Utils.translate('totalProducts')}</div>
                        <div style="font-size: var(--text-4xl); font-weight: var(--font-bold);">${products.length}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, var(--color-secondary), #db2777); padding: var(--spacing-xl); border-radius: var(--radius-xl); color: white;">
                        <div style="font-size: var(--text-sm); opacity: 0.9; margin-bottom: var(--spacing-sm);">${Utils.translate('totalOrders')}</div>
                        <div style="font-size: var(--text-4xl); font-weight: var(--font-bold);">${orders.length}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, var(--color-success), #059669); padding: var(--spacing-xl); border-radius: var(--radius-xl); color: white;">
                        <div style="font-size: var(--text-sm); opacity: 0.9; margin-bottom: var(--spacing-sm);">${Utils.translate('totalRevenue')}</div>
                        <div style="font-size: var(--text-4xl); font-weight: var(--font-bold);">${Utils.formatPrice(totalRevenue)}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, var(--color-warning), #d97706); padding: var(--spacing-xl); border-radius: var(--radius-xl); color: white;">
                        <div style="font-size: var(--text-sm); opacity: 0.9; margin-bottom: var(--spacing-sm);">${Utils.translate('pendingOrders')}</div>
                        <div style="font-size: var(--text-4xl); font-weight: var(--font-bold);">${pendingOrders}</div>
                    </div>
                </div>

                <!-- Winter Sale Controls -->
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: var(--spacing-xl); border-radius: var(--radius-xl); color: white; margin-bottom: var(--spacing-2xl);">
                    <h3 style="margin-bottom: var(--spacing-lg); color: white;"><i class="fas fa-snowflake"></i> ${Utils.translate('winterSaleControls')}</h3>
                    <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap;">
                        <button class="btn btn-light" onclick="Admin.toggleWinterSaleBanner()" id="bannerToggleBtn">
                            ${this.isWinterSaleBannerActive() ? Utils.translate('removeBanner') : Utils.translate('addBanner')}
                        </button>
                        <button class="btn btn-light" onclick="Admin.toggleWinterSale()" id="saleToggleBtn">
                            ${Utils.translate('winterSale')}: ${this.isWinterSaleActive() ? Utils.translate('on') : Utils.translate('off')}
                        </button>
                    </div>
                    <p style="margin-top: var(--spacing-md); font-size: var(--text-sm); opacity: 0.9;">
                        ${Utils.translate('banner')}: ${this.isWinterSaleBannerActive() ? `<i class="fas fa-check-circle"></i> ${Utils.translate('visible')}` : `<i class="fas fa-times-circle"></i> ${Utils.translate('hidden')}`} | 
                        ${Utils.translate('saleStatus')}: ${this.isWinterSaleActive() ? `<i class="fas fa-check-circle"></i> ${Utils.translate('active')}` : `<i class="fas fa-times-circle"></i> ${Utils.translate('inactive')}`}
                    </p>
                </div>

                </div>
                
                <!-- Data Management -->
                <div style="margin-bottom: var(--spacing-xl); display: flex; gap: var(--spacing-md);">
                    <button class="btn btn-outline" onclick="Admin.exportData('users')">
                        <i class="fas fa-download"></i> Export Users
                    </button>
                    <button class="btn btn-outline" onclick="Admin.exportData('orders')">
                        <i class="fas fa-download"></i> Export Orders
                    </button>
                </div>

                <!-- Tabs -->
                <div style="margin-bottom: var(--spacing-xl);">
                    <div style="display: flex; gap: var(--spacing-md); border-bottom: 2px solid var(--color-border);">
                        <button class="admin-tab active" data-tab="products" onclick="Admin.switchTab('products')">
                            ${Utils.translate('productsManagement')}
                        </button>
                        <button class="admin-tab" data-tab="orders" onclick="Admin.switchTab('orders')">
                            ${Utils.translate('ordersManagement')}
                        </button>
                        <button class="admin-tab" data-tab="users" onclick="Admin.switchTab('users')">
                             ${Utils.translate('manageUsers')}
                        </button>
                    </div>
                </div>

                <!-- Tab Content -->
                <div id="adminTabContent">
                    ${this.renderProductsTab()}
                </div>
            </div>

            <style>
                .admin-tab {
                    padding: var(--spacing-md) var(--spacing-lg);
                    background: transparent;
                    border: none;
                    border-bottom: 3px solid transparent;
                    font-weight: var(--font-semibold);
                    color: var(--color-text-secondary);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                .admin-tab.active {
                    color: var(--color-primary);
                    border-bottom-color: var(--color-primary);
                }
                .admin-tab:hover {
                    color: var(--color-primary);
                }
            </style>
        `;
    },

    // Switch tabs
    switchTab(tab) {
        // Update active tab
        document.querySelectorAll('.admin-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update content
        let content = '';
        if (tab === 'products') content = this.renderProductsTab();
        else if (tab === 'orders') content = this.renderOrdersTab();
        else if (tab === 'users') content = this.renderUsersTab();

        document.getElementById('adminTabContent').innerHTML = content;
    },

    // Render products management tab
    renderProductsTab() {
        const products = Products.getProducts();

        return `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xl);">
                    <h2>${Utils.translate('productsManagement')}</h2>
                    <button class="btn btn-primary" onclick="Admin.showAddProductForm()">
                        + ${Utils.translate('addNewProduct')}
                    </button>
                </div>

                <div id="addProductForm" style="display: none; background: var(--color-surface); padding: var(--spacing-xl); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); margin-bottom: var(--spacing-xl);">
                    <h3 style="margin-bottom: var(--spacing-lg);">${Utils.translate('addNewProduct')}</h3>
                    <form id="productForm">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                            <div class="form-group">
                                <label>${Utils.translate('productTitle')}</label>
                                <input type="text" id="productTitle" required>
                            </div>
                            <div class="form-group">
                                <label>${Utils.translate('price')}</label>
                                <input type="number" id="productPrice" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label>${Utils.translate('category')}</label>
                                <select id="productCategory" required>
                                    <option value="mouse">Mouse</option>
                                    <option value="keyboard">Keyboard</option>
                                    <option value="headset">Headset</option>
                                    <option value="mousepad">Mousepad</option>
                                    <option value="keycaps">Keycaps</option>
                                    <option value="stickers">Stickers</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>${Utils.translate('brand')}</label>
                                <input type="text" id="productBrand" required>
                            </div>
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label>${Utils.translate('imageUrl')}</label>
                                <input type="url" id="productImage" required>
                            </div>
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label>${Utils.translate('description')}</label>
                                <textarea id="productDescription" required></textarea>
                            </div>
                        </div>
                        <div style="display: flex; gap: var(--spacing-md); margin-top: var(--spacing-lg);">
                            <button type="submit" class="btn btn-primary">${Utils.translate('addProduct')}</button>
                            <button type="button" class="btn btn-ghost" onclick="Admin.hideAddProductForm()">${Utils.translate('cancel')}</button>
                        </div>
                    </form>
                </div>

                <div style="background: var(--color-surface); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: var(--color-bg-secondary);">
                            <tr>
                                <th style="padding: var(--spacing-md); text-align: left;">${Utils.translate('image')}</th>
                                <th style="padding: var(--spacing-md); text-align: left;">${Utils.translate('title')}</th>
                                <th style="padding: var(--spacing-md); text-align: left;">${Utils.translate('category')}</th>
                                <th style="padding: var(--spacing-md); text-align: left;">${Utils.translate('brand')}</th>
                                <th style="padding: var(--spacing-md); text-align: left;">${Utils.translate('price')}</th>
                                <th style="padding: var(--spacing-md); text-align: left;">${Utils.translate('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(product => `
                                <tr style="border-bottom: 1px solid var(--color-border);">
                                    <td style="padding: var(--spacing-md);">
                                        <img src="${product.image}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-md);">
                                    </td>
                                    <td style="padding: var(--spacing-md);">${Utils.truncateText(product.title, 40)}</td>
                                    <td style="padding: var(--spacing-md);">${product.category}</td>
                                    <td style="padding: var(--spacing-md);">${product.brand}</td>
                                    <td style="padding: var(--spacing-md); font-weight: var(--font-semibold);">${Utils.formatPrice(product.price)}</td>
                                    <td style="padding: var(--spacing-md);">
                                        <button class="btn btn-sm btn-danger" onclick="Admin.deleteProduct(${product.id})">${Utils.translate('delete')}</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // Render orders management tab
    renderOrdersTab() {
        const orders = Orders.getAllOrders();

        return `
            <div>
                <h2 style="margin-bottom: var(--spacing-xl);">${Utils.translate('ordersManagement')}</h2>

                ${orders.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon"><i class="fas fa-box"></i></div>
                        <h3>${Utils.translate('noOrdersYet')}</h3>
                    </div>
                ` : `
                    <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
                        ${orders.map(order => `
                            <div style="background: var(--color-surface); padding: var(--spacing-xl); border-radius: var(--radius-xl); box-shadow: var(--shadow-md);">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-lg);">
                                    <div>
                                        <h3>${Utils.translate('order')} #${order.orderId.slice(-8)}</h3>
                                        <p style="color: var(--color-text-secondary); margin: var(--spacing-sm) 0;">
                                            ${Utils.translate('customer')}: ${order.userName} (${order.userEmail})
                                        </p>
                                        <p style="color: var(--color-text-secondary); margin: 0;">
                                            ${Utils.translate('date')}: ${Utils.formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <select onchange="Orders.updateOrderStatus('${order.orderId}', this.value); Admin.switchTab('orders');" 
                                            style="padding: var(--spacing-sm) var(--spacing-md); border: 2px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); font-weight: var(--font-semibold);">
                                        <option value="pending" ${order.orderStatus === 'pending' ? 'selected' : ''}>Pending</option>
                                        <option value="processing" ${order.orderStatus === 'processing' ? 'selected' : ''}>Processing</option>
                                        <option value="delivered" ${order.orderStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
                                        <option value="cancelled" ${order.orderStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                    </select>
                                    </div>
                                </div>

                                <div style="margin-bottom: var(--spacing-lg);">
                                    ${order.products.map(item => `
                                        <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-sm);">
                                            <img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-md);">
                                            <div>
                                                <div style="font-weight: var(--font-semibold);">${item.title}</div>
                                                <div style="color: var(--color-text-secondary); font-size: var(--text-sm);">
                                                    ${Utils.translate('qty')}: ${item.quantity} × ${Utils.formatPrice(item.price)}
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>

                                <div style="display: flex; justify-content: space-between; padding-top: var(--spacing-lg); border-top: 1px solid var(--color-border);">
                                    <div>
                                        <strong>${Utils.translate('deliveryAddress')}:</strong><br>
                                        ${order.address}
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="color: var(--color-text-secondary);">${Utils.translate('totalAmount')}</div>
                                        <div style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-primary);">
                                        ${Utils.formatPrice(order.totalAmount)}
                                    </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    },

    // Render Users Tab
    renderUsersTab() {
        const users = Utils.Storage.get('users', []);

        return `
            <div>
                 <h2 style="margin-bottom: var(--spacing-xl);">${Utils.translate('manageUsers')}</h2>
                 
                 <div style="background: var(--color-surface); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: var(--color-bg-secondary);">
                            <tr>
                                <th style="padding: var(--spacing-md); text-align: left;">Name</th>
                                <th style="padding: var(--spacing-md); text-align: left;">Email</th>
                                <th style="padding: var(--spacing-md); text-align: left;">Role</th>
                                <th style="padding: var(--spacing-md); text-align: left;">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
                                <tr style="border-bottom: 1px solid var(--color-border);">
                                    <td style="padding: var(--spacing-md);">${user.name}</td>
                                    <td style="padding: var(--spacing-md);">${user.email}</td>
                                    <td style="padding: var(--spacing-md);"><span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}">${user.role}</span></td>
                                    <td style="padding: var(--spacing-md);">${new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                 </div>
            </div>
        `;
    },

    // Export Data
    exportData(type) {
        let data, filename;
        if (type === 'users') {
            data = Utils.Storage.get('users', []);
            filename = 'users.json';
        } else if (type === 'orders') {
            data = Utils.Storage.get('orders', []);
            filename = 'orders.json';
        } else {
            return;
        }

        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Utils.showToast(`${type} exported successfully`, 'success');
    },

    // Show add product form
    showAddProductForm() {
        document.getElementById('addProductForm').style.display = 'block';
    },

    // Hide add product form
    hideAddProductForm() {
        document.getElementById('addProductForm').style.display = 'none';
        document.getElementById('productForm').reset();
    },

    // Delete product
    deleteProduct(productId) {
        if (confirm(Utils.translate('areYouSure'))) {
            const success = Products.deleteProduct(productId);
            if (success) {
                // Force refresh the entire admin dashboard to show updated product list
                if (window.App && window.App.currentRoute === '/admin') {
                    window.App.navigate('/admin', false);
                } else {
                    // If not on admin page, just refresh the products tab
                    this.switchTab('products');
                }
            }
        }
    },

    // Check if winter sale banner is active
    isWinterSaleBannerActive() {
        return Utils.Storage.get('winterSaleBanner', false);
    },

    // Check if winter sale is active
    isWinterSaleActive() {
        return Utils.Storage.get('winterSaleActive', false);
    },

    // Toggle winter sale banner
    toggleWinterSaleBanner() {
        const currentState = this.isWinterSaleBannerActive();
        Utils.Storage.set('winterSaleBanner', !currentState);
        Utils.showToast(
            !currentState ? Utils.translate('winterSaleBannerAdded') : Utils.translate('winterSaleBannerRemoved'),
            'success'
        );

        // Refresh admin dashboard
        if (window.App && window.App.currentRoute === '/admin') {
            window.App.navigate('/admin', false);
        }

        // Update banner on page
        this.updateWinterSaleBanner();
    },

    // Toggle winter sale status
    toggleWinterSale() {
        const currentState = this.isWinterSaleActive();
        Utils.Storage.set('winterSaleActive', !currentState);
        Utils.showToast(
            !currentState ? Utils.translate('winterSaleActivated') : Utils.translate('winterSaleDeactivated'),
            'success'
        );

        // Refresh admin dashboard
        if (window.App && window.App.currentRoute === '/admin') {
            window.App.navigate('/admin', false);
        }
    },

    // Update winter sale banner on page
    updateWinterSaleBanner() {
        const bannerActive = this.isWinterSaleBannerActive();
        let banner = document.getElementById('winterSaleBanner');

        if (bannerActive && !banner) {
            // Create banner
            banner = document.createElement('div');
            banner.id = 'winterSaleBanner';
            banner.innerHTML = `
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: var(--spacing-md); text-align: center; color: white; font-weight: var(--font-semibold);">
                    <i class="fas fa-snowflake"></i> ${Utils.translate('winterSaleIsLive')} 
                    <a href="#/winter-sale" style="color: white; text-decoration: underline; margin-left: var(--spacing-sm);">${Utils.translate('shopNowLink')}</a>
                </div>
            `;

            const navbar = document.getElementById('navbar');
            if (navbar && navbar.nextSibling) {
                navbar.parentNode.insertBefore(banner, navbar.nextSibling);
            }
        } else if (!bannerActive && banner) {
            // Remove banner
            banner.remove();
        }
    }
};

// Initialize admin on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize winter sale banner
    Admin.updateWinterSaleBanner();

    // Handle product form submission
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'productForm') {
            e.preventDefault();

            const productData = {
                title: document.getElementById('productTitle').value,
                price: parseFloat(document.getElementById('productPrice').value),
                category: document.getElementById('productCategory').value,
                brand: document.getElementById('productBrand').value,
                image: document.getElementById('productImage').value,
                description: document.getElementById('productDescription').value
            };

            if (Products.addProduct(productData)) {
                Admin.hideAddProductForm();
                Admin.switchTab('products');
            }
        }
    });
});

// Export Admin
window.Admin = Admin;
