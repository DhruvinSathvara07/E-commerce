/* ==========================================
   APP.JS - SPA Router & Application Core
   ========================================== */

const App = {
    currentRoute: '/',

    // Route definitions
    routes: {
        '/': () => Products.renderHomePage(),
        '/products': () => {
            const params = new URLSearchParams(window.location.hash.split('?')[1]);
            const filters = {};

            if (params.get('category')) filters.category = params.get('category');
            if (params.get('brand')) filters.brand = params.get('brand');
            if (params.get('tag')) filters.tag = params.get('tag');
            if (params.get('sort')) filters.sort = params.get('sort');
            if (params.get('search')) {
                const searchQuery = params.get('search');
                const results = Search.search(searchQuery);
                return this.renderSearchPage(searchQuery, results);
            }

            return Products.renderProductsPage(filters);
        },
        '/categories': () => this.renderCategoriesPage(),
        '/sale': () => {
            return Products.renderProductsPage({ tag: 'sale' });
        },
        '/winter-sale': () => {
            if (!Auth.isAdmin()) {
                return `
                    <div class="container">
                        <div class="empty-state">
                            <div class="empty-state-icon">❄️</div>
                            <h3>Winter Sale Coming Soon!</h3>
                            <p>Stay tuned for amazing deals</p>
                        </div>
                    </div>
                `;
            }
            return this.renderWinterSalePage();
        },
        '/brands': () => this.renderBrandsPage(),
        '/cart': () => Cart.renderCartPage(),
        '/checkout': () => Orders.renderCheckoutPage(),
        '/orders': () => Orders.renderOrdersPage(),
        '/wishlist': () => Wishlist.renderWishlistPage(),
        '/settings': () => Settings.renderSettingsPage(),
        '/admin': () => Admin.renderAdminDashboard(),
        '/product': () => this.renderProductDetailPage()
    },

    // Initialize app
    init() {
        // Initialize default data
        Utils.initializeDefaultData();

        // Apply settings (including translations)
        Settings.apply();

        // Apply translations to static HTML elements
        if (Utils.applyTranslations) {
            Utils.applyTranslations();
        }

        // Setup hash change listener
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });

        // Handle initial route
        this.handleRoute();

        // Update UI
        Auth.updateUI();
    },

    // Handle route
    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const route = hash.split('?')[0];

        this.navigate(route, false);
    },

    // Navigate to route
    navigate(route, updateHash = true) {
        // Extract product ID if it's a product detail route
        let actualRoute = route;
        let productId = null;

        if (route.startsWith('/product/')) {
            productId = route.split('/product/')[1];
            actualRoute = '/product';
            this.currentProductId = productId;
        }

        // Check access
        if (!Auth.canAccessRoute(actualRoute)) {
            Auth.showLoginModal();
            return;
        }

        // Update hash if needed
        if (updateHash) {
            window.location.hash = route;
            return;
        }

        // Get route handler
        const handler = this.routes[actualRoute] || this.routes['/'];

        // Render content
        const content = handler();
        const app = document.getElementById('app');

        if (app) {
            app.innerHTML = content;
            window.scrollTo(0, 0);
        }

        // Update current route
        this.currentRoute = route;

        // Update active nav links
        this.updateActiveNavLinks(actualRoute);
    },

    // Update active nav links
    updateActiveNavLinks(route) {
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${route}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    // Render categories page
    renderCategoriesPage() {
        const products = Products.getProducts();
        const categories = [...new Set(products.map(p => p.category))];

        const categoryIcons = {
            'Electronics': '📱',
            'Jewelry': '💍',
            'Jackets': '🧥',
            "Women's Clothing": '👗',
            'accessories': '🎁'
        };

        return `
            <div class="container">
                <div class="section-header">
                    <h1 class="section-title">${Utils.translate('categories')}</h1>
                    <p class="section-subtitle">${Utils.translate('browseByCategory')}</p>
                </div>

                <div class="grid grid-cols-4" style="gap: var(--spacing-xl);">
                    ${categories.map(category => {
            const categoryProducts = products.filter(p => p.category === category);
            return `
                            <a href="#/products?category=${category}" style="text-decoration: none;">
                                <div style="background: var(--color-surface); padding: var(--spacing-2xl); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); text-align: center; transition: all var(--transition-base); cursor: pointer;">
                                    <div style="font-size: 4rem; margin-bottom: var(--spacing-lg);">
                                        ${categoryIcons[category] || '📦'}
                                    </div>
                                    <h3 style="margin-bottom: var(--spacing-sm); text-transform: capitalize; color: var(--color-text);">
                                        ${category}
                                    </h3>
                                    <p style="color: var(--color-text-secondary); margin: 0;">
                                        ${categoryProducts.length} ${Utils.translate('products').toLowerCase()}
                                    </p>
                                </div>
                            </a>
                        `;
        }).join('')}
                </div>
            </div>

            <style>
                .grid > a > div:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-2xl);
                }
            </style>
        `;
    },

    // Render brands page
    renderBrandsPage() {
        const products = Products.getProducts();
        const brands = [...new Set(products.map(p => p.brand))];

        return `
            <div class="container">
                <div class="section-header">
                    <h1 class="section-title">${Utils.translate('brands')}</h1>
                    <p class="section-subtitle">${Utils.translate('shopByBrand')}</p>
                </div>

                <div class="grid grid-cols-5" style="gap: var(--spacing-lg);">
                    ${brands.map(brand => {
            const brandProducts = products.filter(p => p.brand === brand);
            return `
                            <a href="#/products?brand=${brand}" style="text-decoration: none;">
                                <div style="background: var(--color-surface); padding: var(--spacing-xl); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); text-align: center; transition: all var(--transition-base); cursor: pointer;">
                                    <h3 style="margin-bottom: var(--spacing-sm); color: var(--color-text);">
                                        ${brand}
                                    </h3>
                                    <p style="color: var(--color-text-secondary); margin: 0; font-size: var(--text-sm);">
                                        ${brandProducts.length} ${Utils.translate('products').toLowerCase()}
                                    </p>
                                </div>
                            </a>
                        `;
        }).join('')}
                </div>
            </div>

            <style>
                .grid > a > div:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-xl);
                }
            </style>
        `;
    },

    // Render winter sale page (admin only)
    renderWinterSalePage() {
        const products = Products.getProducts();
        const saleProducts = products.filter(p => p.tags && p.tags.includes('sale'));

        return `
            <div class="container">
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: var(--spacing-3xl); border-radius: var(--radius-2xl); text-align: center; color: white; margin-bottom: var(--spacing-2xl);">
                    <h1 style="font-size: var(--text-5xl); margin-bottom: var(--spacing-lg); color: white;">❄️ Winter Sale ❄️</h1>
                    <p style="font-size: var(--text-xl); color: rgba(255, 255, 255, 0.9);">
                        Exclusive deals on premium gaming gear
                    </p>
                </div>

                <div class="product-grid">
                    ${saleProducts.map(product => Products.renderProductCard(product)).join('')}
                </div>
            </div>
        `;
    },

    // Render search results page
    renderSearchPage(query, results) {
        return `
            <div class="container">
                <div class="section-header">
                    <h1 class="section-title">${Utils.translate('searchResults')}</h1>
                    <p class="section-subtitle">${Utils.translate('showingResultsFor')} "${query}"</p>
                </div>

                ${results.length > 0 ? `
                    <div class="product-grid">
                        ${results.map(product => Products.renderProductCard(product)).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">🔍</div>
                        <h3>${Utils.translate('noResultsFound')}</h3>
                        <p>${Utils.translate('tryDifferentKeywords')}</p>
                        <a href="#/products" class="btn btn-primary">${Utils.translate('browseProducts')}</a>
                    </div>
                `}
            </div>
        `;
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export App
window.App = App;
