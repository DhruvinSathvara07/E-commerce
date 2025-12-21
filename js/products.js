/* ==========================================
   PRODUCTS.JS - Product Management & Display
   ========================================== */

const Products = {
    // API URL
    API_URL: 'https://fakestoreapi.com/products',

    // Sample pro player data
    proPlayers: {
        's1mple': { name: 's1mple', team: 'NAVI', mouse: 'Logitech G Pro X Superlight', keyboard: 'HyperX Alloy FPS Pro' },
        'ZywOo': { name: 'ZywOo', team: 'Vitality', mouse: 'Logitech G Pro Wireless', keyboard: 'Logitech G Pro X' },
        'NiKo': { name: 'NiKo', team: 'G2', mouse: 'Logitech G Pro X Superlight', keyboard: 'Logitech G815' },
        'device': { name: 'device', team: 'Astralis', mouse: 'Logitech G Pro Wireless', keyboard: 'SteelSeries Apex Pro' }
    },

    // Fetch products from API
    async fetchProducts() {
        try {
            const response = await fetch(this.API_URL);
            if (!response.ok) throw new Error('Failed to fetch products');

            const products = await response.json();

            // Enhance products with e-commerce categories
            const enhancedProducts = products.map((product, index) => {
                // Map FakeStore API categories to display categories
                const categoryMap = {
                    'electronics': 'Electronics',
                    'jewelery': 'Jewelry',
                    "men's clothing": 'Jackets',
                    "women's clothing": "Women's Clothing"
                };

                const brands = ['Logitech', 'Razer', 'SteelSeries', 'HyperX', 'Corsair'];
                const proPlayerNames = Object.keys(this.proPlayers);

                return {
                    ...product,
                    category: categoryMap[product.category] || 'accessories',
                    brand: brands[index % brands.length],
                    proPlayer: index % 3 === 0 ? proPlayerNames[index % proPlayerNames.length] : null,
                    tags: this.generateTags(product, index),
                    isAdminAdded: false
                };
            });

            // Save to localStorage
            Utils.Storage.set('products', enhancedProducts);
            return enhancedProducts;
        } catch (error) {
            console.error('Error fetching products:', error);
            Utils.showToast('Failed to load products', 'error');
            return Utils.Storage.get('products', []);
        }
    },

    // Get product stats (rating & reviews)
    getProductStats(productId) {
        const comments = Utils.Storage.get('comments', {});
        const productComments = comments[productId] || [];

        // Default API values if no local comments
        const product = this.getProductById(productId);
        const apiRate = product?.rating?.rate || 0;
        const apiCount = product?.rating?.count || 0;

        // If we have local comments, weight them higher or mix them
        // For this requirement ("Save reviews in localStorage (no backend)"), 
        // we heavily rely on local reviews if they exist, but fallback to API for "initial" look
        // The user wants "Real" ranking. Let's use local data primarily.

        if (productComments.length > 0) {
            const avgRating = Utils.calculateAverageRating(productComments);
            const count = productComments.length;
            const score = avgRating * Math.log(count + 1) * 2; // Simple weighted score
            return { rating: avgRating, count: count, score: score };
        }

        // Fallback score for API data
        return {
            rating: apiRate,
            count: apiCount,
            score: apiRate * Math.log(apiCount + 10) // Boost API data slightly so page isn't empty
        };
    },

    // Generate tags for products
    generateTags(product, index) {
        const tags = [];

        // New products (first 5)
        if (index < 5) tags.push('new');

        // Sale products (high price items)
        if (product.price > 50) tags.push('sale');

        // "top-rated" is now dynamic, we don't hardcode it here
        return tags;
    },

    // Get all products
    getProducts() {
        return Utils.Storage.get('products', []);
    },

    // Get product by ID
    getProductById(id) {
        // We get the list from storage
        const products = Utils.Storage.get('products', []);
        return products.find(p => p.id == id);
    },

    // ... (addProduct, updateProduct, deleteProduct, filterProducts remain unchanged) ...

    // Sort products
    sortProducts(products, sortBy = 'default') {
        const sorted = [...products];

        // Helper to get score
        const getScore = (p) => this.getProductStats(p.id).score;

        switch (sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price);
            case 'rating':
                return sorted.sort((a, b) => getScore(b) - getScore(a));
            case 'newest':
                return sorted.sort((a, b) => b.id - a.id);
            case 'name':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            default:
                // Custom Priority: 
                // 1. Top Rated (High Score) 
                // 2. New (Tag)
                // 3. Normal
                return sorted.sort((a, b) => {
                    const statsA = this.getProductStats(a.id);
                    const statsB = this.getProductStats(b.id);

                    // Define strict threshold for "Top Rated" sorting boost
                    const isTopA = statsA.rating >= 4.5 && statsA.count >= 2;
                    const isTopB = statsB.rating >= 4.5 && statsB.count >= 2;

                    if (isTopA && !isTopB) return -1;
                    if (!isTopA && isTopB) return 1;

                    if (a.tags?.includes('new') && !b.tags?.includes('new')) return -1;
                    if (!a.tags?.includes('new') && b.tags?.includes('new')) return 1;

                    // Fallback to score
                    return statsB.score - statsA.score;
                });
        }
    },

    // Render product price with Winter Sale discount
    renderProductPrice(product) {
        const isWinterSaleActive = Utils.Storage.get('winterSaleActive', false);
        const originalPrice = product.price;
        const discountedPrice = originalPrice * 0.8; // 20% off

        if (isWinterSaleActive) {
            return `
                <div class=\"product-price\">
                    <div style=\"display: flex; align-items: center; gap: var(--spacing-sm);\">
                        <span style=\"text-decoration: line-through; color: var(--color-text-secondary); font-size: var(--text-sm);\">${Utils.formatPrice(originalPrice)}</span>
                        <span style=\"color: var(--color-primary); font-weight: var(--font-bold);\">${Utils.formatPrice(discountedPrice)}</span>
                    </div>
                    <div style=\"background: var(--color-primary); color: white; padding: 2px 8px; border-radius: var(--radius-sm); font-size: var(--text-xs); font-weight: var(--font-semibold); margin-top: 4px; display: inline-block;\">
                        <i class="fas fa-snowflake"></i> Winter Sale
                    </div>
                </div>
            `;
        } else {
            return `<div class=\"product-price\">${Utils.formatPrice(originalPrice)}</div>`;
        }
    },

    // Render product card
    renderProductCard(product) {
        // Translate product data based on current language
        const translatedProduct = Utils.translateProduct(product);

        const user = Auth.getCurrentUser();
        const wishlist = Utils.Storage.get('wishlist', {});
        const userWishlist = user ? (wishlist[user.id] || []) : [];
        const isInWishlist = userWishlist.includes(product.id);

        // Calculate dynamic stats
        const stats = this.getProductStats(product.id);
        const avgRating = stats.rating;
        const ratingCount = stats.count;

        // Determine if Top Rated dynamically
        const isTopRated = avgRating >= 4.5 && ratingCount >= 2;

        // Merge dynamic top-rated tag into visual tags
        let displayTags = [...(product.tags || [])];
        if (isTopRated && !displayTags.includes('top-rated')) {
            displayTags.push('top-rated');
        }

        return `
            <div class="product-card" data-product-id="${product.id}" onclick="window.location.href = 'product.html?id=${product.id}'">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${translatedProduct.title}" class="product-image">
                    
                    ${displayTags.length > 0 ? `
                        <div class="product-tags">
                            ${displayTags.map(tag => `
                                <span class="product-tag tag-${tag.replace('-', '')}">${Utils.translate(tag.replace('-', ''))}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" 
                            onclick="event.stopPropagation(); Wishlist.toggle(${product.id})"
                            title="${isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}">
                        <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                
                <div class="product-info">
                    <div class="product-category">${translatedProduct.category}</div>
                    <h3 class="product-title">${translatedProduct.title}</h3>
                    
                    <div class="product-rating">
                        <span class="stars">${Utils.renderStars(avgRating)}</span>
                        <span class="rating-count">${avgRating.toFixed(1)} (${ratingCount})</span>
                    </div>
                    
                    <div class="product-footer">
                        ${this.renderProductPrice(product)}
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); Cart.addItem(${product.id})">
                            ${Utils.translate('addToCart')}
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Render products page
    renderProductsPage(filters = {}) {
        let products = this.filterProducts(filters);

        // Apply sorting from filters or default
        const sortBy = filters.sort || 'default';
        products = this.sortProducts(products, sortBy);

        const categories = [...new Set(this.getProducts().map(p => p.category))];
        const brands = [...new Set(this.getProducts().map(p => p.brand))];

        // Determine active filter display
        let activeFilterText = '';
        let activeFilterType = '';

        if (filters.category) {
            activeFilterText = `Category: ${filters.category}`;
            activeFilterType = 'category';
        } else if (filters.brand) {
            activeFilterText = `Brand: ${filters.brand}`;
            activeFilterType = 'brand';
        } else if (filters.tag) {
            activeFilterText = `Tag: ${filters.tag}`;
            activeFilterType = 'tag';
        }

        return `
            <div class="container">
                <div class="section-header">
                    <h1 class="section-title">${Utils.translate('products')}</h1>
                    ${activeFilterText ? `
                        <div style="display: flex; align-items: center; justify-content: center; gap: var(--spacing-md); margin-top: var(--spacing-md);">
                            <div style="background: var(--color-primary); color: white; padding: var(--spacing-sm) var(--spacing-lg); border-radius: var(--radius-full); font-weight: var(--font-semibold); display: inline-flex; align-items: center; gap: var(--spacing-sm);">
                                <span>${activeFilterText}</span>
                            </div>
                            <button onclick="window.App.navigate('/products')" class="btn btn-outline btn-sm" style="border-radius: var(--radius-full);">
                                <i class="fas fa-times" style="margin-right: var(--spacing-xs);"></i>
                                Clear Filter
                            </button>
                        </div>
                    ` : `<p class="section-subtitle">${Utils.translate('discoverPremiumGaming')}</p>`}
                </div>

                <div class="layout-with-sidebar">
                    <!-- Filters Sidebar -->
                    <aside class="sidebar">
                        <h3 class="filter-title">${Utils.translate('filters')}</h3>
                        
                        <!-- Category Filter -->
                        <div class="filter-group">
                            <h4 class="filter-title">${Utils.translate('category')}</h4>
                            <div class="filter-options">
                                <label class="filter-option">
                                    <input type="radio" name="category" value="" ${!filters.category ? 'checked' : ''} onchange="Products.applyFilters()">
                                    <span>${Utils.translate('all')}</span>
                                </label>
                                ${categories.map(cat => `
                                    <label class="filter-option ${filters.category === cat ? 'active' : ''}">
                                        <input type="radio" name="category" value="${cat}" ${filters.category === cat ? 'checked' : ''} onchange="Products.applyFilters()">
                                        <span>${cat}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Brand Filter -->
                        <div class="filter-group">
                            <h4 class="filter-title">${Utils.translate('brand')}</h4>
                            <div class="filter-options">
                                <label class="filter-option">
                                    <input type="radio" name="brand" value="" ${!filters.brand ? 'checked' : ''} onchange="Products.applyFilters()">
                                    <span>${Utils.translate('all')}</span>
                                </label>
                                ${brands.map(brand => `
                                    <label class="filter-option ${filters.brand === brand ? 'active' : ''}">
                                        <input type="radio" name="brand" value="${brand}" ${filters.brand === brand ? 'checked' : ''} onchange="Products.applyFilters()">
                                        <span>${brand}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Tags Filter -->
                        <div class="filter-group">
                            <h4 class="filter-title">${Utils.translate('tags')}</h4>
                            <div class="filter-options">
                                <label class="filter-option">
                                    <input type="checkbox" value="new" ${filters.tag === 'new' ? 'checked' : ''} onchange="Products.applyFilters()">
                                    <span>${Utils.translate('new')}</span>
                                </label>
                                <label class="filter-option">
                                    <input type="checkbox" value="sale" ${filters.tag === 'sale' ? 'checked' : ''} onchange="Products.applyFilters()">
                                    <span>${Utils.translate('sale')}</span>
                                </label>
                                <label class="filter-option">
                                    <input type="checkbox" value="top-rated" ${filters.tag === 'top-rated' ? 'checked' : ''} onchange="Products.applyFilters()">
                                    <span>${Utils.translate('topRated')}</span>
                                </label>
                            </div>
                        </div>
                    </aside>

                    <!-- Products Grid -->
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                            <p style="color: var(--color-text-secondary);">${products.length} ${Utils.translate('productsFound')}</p>
                            <select onchange="Products.applySorting(this.value)" style="padding: var(--spacing-sm) var(--spacing-md); border: 2px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg);">
                                <option value="default" ${sortBy === 'default' ? 'selected' : ''}>Sort: Default</option>
                                <option value="price-low" ${sortBy === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
                                <option value="price-high" ${sortBy === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
                                <option value="rating" ${sortBy === 'rating' ? 'selected' : ''}>Rating: High to Low</option>
                                <option value="newest" ${sortBy === 'newest' ? 'selected' : ''}>Newest First</option>
                            </select>
                        </div>

                        ${products.length > 0 ? `
                            <div class="product-grid">
                                ${products.map(product => this.renderProductCard(product)).join('')}
                            </div>
                        ` : `
                            <div class="empty-state">
                                <div class="empty-state-icon"><i class="fas fa-box"></i></div>
                                <h3>${Utils.translate('noProductsFound')}</h3>
                                <p>${Utils.translate('tryAdjustingFilters')}</p>
                                ${activeFilterText ? `
                                    <button onclick="window.App.navigate('/products')" class="btn btn-primary" style="margin-top: var(--spacing-lg);">
                                        Show All Products
                                    </button>
                                ` : ''}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    // Apply filters (called from UI)
    applyFilters() {
        const filters = {};

        const category = document.querySelector('input[name="category"]:checked')?.value;
        if (category) filters.category = category;

        const brand = document.querySelector('input[name="brand"]:checked')?.value;
        if (brand) filters.brand = brand;

        // Navigate with filters
        const params = new URLSearchParams(filters).toString();
        window.App.navigate(`/products${params ? '?' + params : ''}`);
    },

    // Apply sorting
    applySorting(sortBy) {
        // Get current filters from URL
        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        const filters = {};

        if (params.get('category')) filters.category = params.get('category');
        if (params.get('brand')) filters.brand = params.get('brand');
        if (params.get('tag')) filters.tag = params.get('tag');

        // Store sort preference
        filters.sort = sortBy;

        // Navigate with filters and sort
        const queryString = new URLSearchParams(filters).toString();
        window.location.hash = `/products${queryString ? '?' + queryString : ''}`;
    },

    // Render home page
    renderHomePage() {
        const products = this.getProducts();
        const featuredProducts = this.sortProducts(products).slice(0, 8);

        return `
            <div class="container">
                <!-- Hero Section -->
                <div class="hero">
                    <div class="hero-content">
                        <h1>${Utils.translate('welcomeToProGear')}</h1>
                        <p>${Utils.translate('premiumGamingEquipment')}</p>
                        <div style="display: flex; gap: var(--spacing-md); justify-content: center; margin-top: var(--spacing-xl);">
                            <a href="#/products" class="btn btn-primary btn-lg">${Utils.translate('shopNow')}</a>
                            <a href="#/sale" class="btn btn-outline btn-lg" style="color: white; border-color: white;">${Utils.translate('viewSale')}</a>
                        </div>
                    </div>
                </div>

                <!-- Featured Products -->
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">${Utils.translate('featuredProducts')}</h2>
                        <p class="section-subtitle">${Utils.translate('handpickedGear')}</p>
                    </div>

                    <div class="product-grid">
                        ${featuredProducts.map(product => this.renderProductCard(product)).join('')}
                    </div>

                    <div style="text-align: center; margin-top: var(--spacing-2xl);">
                        <a href="#/products" class="btn btn-primary btn-lg">${Utils.translate('viewAllProducts')}</a>
                    </div>
                </div>
            </div>
        `;
    }
};

// Initialize products on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Version check - force re-fetch if category mapping changed
    const PRODUCTS_VERSION = '2.0'; // Updated for new category names
    const currentVersion = Utils.Storage.get('productsVersion');

    // Fetch products if not in localStorage or version mismatch
    const products = Utils.Storage.get('products');
    if (!products || products.length === 0 || currentVersion !== PRODUCTS_VERSION) {
        await Products.fetchProducts();
        Utils.Storage.set('productsVersion', PRODUCTS_VERSION);
    }
});

// Export Products
window.Products = Products;
