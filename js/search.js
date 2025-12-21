/* ==========================================
   SEARCH.JS - Advanced Search Functionality
   ========================================== */

const Search = {
    selectedIndex: -1,
    currentResults: [],

    // Search products
    search(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        const products = Products.getProducts();
        const lowerQuery = query.toLowerCase();

        return products.filter(product => {
            // Search in title
            if (product.title.toLowerCase().includes(lowerQuery)) {
                return true;
            }

            // Search in brand
            if (product.brand && product.brand.toLowerCase().includes(lowerQuery)) {
                return true;
            }

            // Search in category
            if (product.category && product.category.toLowerCase().includes(lowerQuery)) {
                return true;
            }

            // Search in description
            if (product.description && product.description.toLowerCase().includes(lowerQuery)) {
                return true;
            }

            return false;
        });
    },

    // Render search results
    renderSearchResults(results) {
        const searchResults = document.getElementById('searchResults');

        if (!searchResults) return;

        this.currentResults = results;
        this.selectedIndex = -1;

        if (!results || results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 12px; color: var(--color-text-secondary); opacity: 0.5;"></i>
                    <p>No products found</p>
                </div>
            `;
            searchResults.classList.add('active');
            return;
        }

        // Limit to top 8 results
        const displayResults = results.slice(0, 8);

        searchResults.innerHTML = displayResults.map((product, index) => `
            <div class="search-result-item" data-index="${index}" data-product-id="${product.id}">
                <img src="${product.image}" alt="${product.title}" class="search-result-image">
                <div class="search-result-info">
                    <div class="search-result-title">
                        ${Utils.truncateText(product.title, 60)}
                    </div>
                    <div class="search-result-meta">
                        ${product.category ? `<span class="search-result-category">${product.category}</span>` : ''}
                        ${product.brand ? `<span class="search-result-brand">${product.brand}</span>` : ''}
                    </div>
                    <div class="search-result-price">
                        ${Utils.formatPrice(product.price)}
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const productId = item.getAttribute('data-product-id');
                this.navigateToProduct(productId);
            });
        });

        searchResults.classList.add('active');
    },

    // Navigate to product detail page
    navigateToProduct(productId) {
        this.hideResults();
        if (searchInput) {
            searchInput.value = '';
        }
        window.location.href = `product.html?id=${productId}`;
    },

    // Hide search results
    hideResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.classList.remove('active');
        }
        this.selectedIndex = -1;
        this.currentResults = [];
    },

    // Handle keyboard navigation
    handleKeyDown(e) {
        const searchResults = document.getElementById('searchResults');

        if (!searchResults || !searchResults.classList.contains('active')) {
            return;
        }

        const items = searchResults.querySelectorAll('.search-result-item');

        if (items.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                this.updateSelection(items);
                break;

            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection(items);
                break;

            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0 && this.selectedIndex < items.length) {
                    const selectedItem = items[this.selectedIndex];
                    const productId = selectedItem.getAttribute('data-product-id');
                    this.navigateToProduct(productId);
                }
                break;

            case 'Escape':
                e.preventDefault();
                this.hideResults();
                document.getElementById('searchInput').blur();
                break;
        }
    },

    // Update visual selection
    updateSelection(items) {
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                // Scroll into view if needed
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('selected');
            }
        });
    },

    // Handle search input with debouncing
    handleSearch: Utils.debounce(function (query) {
        if (!query || query.trim() === '') {
            Search.hideResults();
            return;
        }

        const results = Search.search(query);
        Search.renderSearchResults(results);
    }, 300)
};

// Initialize search on page load
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput) {
        // Input event for live search
        searchInput.addEventListener('input', (e) => {
            Search.handleSearch(e.target.value);
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            Search.handleKeyDown(e);
        });

        // Focus event
        searchInput.addEventListener('focus', (e) => {
            if (e.target.value.trim()) {
                Search.handleSearch(e.target.value);
            }
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                Search.hideResults();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value;
            if (query && query.trim()) {
                // Navigate to products page with search query
                const searchUrl = `/products?search=${encodeURIComponent(query)}`;
                if (window.App) {
                    window.App.navigate(searchUrl);
                } else {
                    window.location.href = `index.html#${searchUrl}`;
                }
                Search.hideResults();
            }
        });
    }
});

// Export Search
window.Search = Search;
