/* ==========================================
   WISHLIST.JS - Wishlist Management
   ========================================== */

const Wishlist = {
    // Get user's wishlist
    getUserWishlist() {
        const user = Auth.getCurrentUser();
        if (!user) return [];

        const wishlist = Utils.Storage.get('wishlist', {});
        return wishlist[user.id] || [];
    },

    // Save user's wishlist
    saveUserWishlist(items) {
        const user = Auth.getCurrentUser();
        if (!user) return false;

        const wishlist = Utils.Storage.get('wishlist', {});
        wishlist[user.id] = items;
        Utils.Storage.set('wishlist', wishlist);
        Auth.updateBadges();
        return true;
    },

    // Add item to wishlist
    add(productId) {
        if (!Auth.requireLogin()) return;

        const items = this.getUserWishlist();

        if (!items.includes(productId)) {
            items.push(productId);
            this.saveUserWishlist(items);
            Utils.showToast('Added to wishlist', 'success');
        }
    },

    // Remove item from wishlist
    remove(productId) {
        const items = this.getUserWishlist();
        const filtered = items.filter(id => id != productId);
        this.saveUserWishlist(filtered);
        Utils.showToast('Removed from wishlist', 'success');

        // Re-render wishlist page if on wishlist page
        if (window.App && window.App.currentRoute === '/wishlist') {
            window.App.navigate('/wishlist', false);
        }
    },

    // Toggle wishlist
    toggle(productId) {
        if (!Auth.requireLogin()) return;

        const items = this.getUserWishlist();

        if (items.includes(productId)) {
            this.remove(productId);
        } else {
            this.add(productId);
        }

        // Update product card UI
        const wishlistBtn = document.querySelector(`[data-product-id="${productId}"] .wishlist-btn`);
        if (wishlistBtn) {
            const isInWishlist = items.includes(productId);
            wishlistBtn.classList.toggle('active', !isInWishlist);

            const icon = wishlistBtn.querySelector('i');
            if (icon) {
                if (!isInWishlist) {
                    // Item was just added (so it IS in wishlist now from UI perspective, wait logic is inverted?)
                    // The 'isInWishlist' var above comes from 'items.includes(productId)'.
                    // But wait, the toggle function logic:
                    // 1. Get current list.
                    // 2. If present, remove. Else add.
                    // 3. 'isInWishlist' variable is calculated *after* the toggle?
                    // Let's check lines 57-63.
                    // It modifies storage. It DOES NOT return the new state.
                    // Code at line 68: `const isInWishlist = items.includes(productId);`
                    // 'items' here is the OLD list (fetched at line 57).
                    // So if it WAS in wishlist, we removed it. So new state is false.
                    // So 'isInWishlist' (old state) is true -> we removed -> show outline (far).
                    // Correct logic:
                    if (isInWishlist) {
                        // Was in wishlist, now removed -> empty heart
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                    } else {
                        // Was not in wishlist, now added -> full heart
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                    }
                }
            }
        }
    },

    // Render wishlist page
    renderWishlistPage() {
        if (!Auth.isLoggedIn()) {
            return `
                <div class="container">
                    <div class="empty-state">
                        <div class="empty-state-icon">❤️</div>
                        <h3>Please login to view your wishlist</h3>
                        <button class="btn btn-primary" onclick="Auth.showLoginModal()">Login</button>
                    </div>
                </div>
            `;
        }

        const wishlistItems = this.getUserWishlist();

        if (wishlistItems.length === 0) {
            return `
                <div class="container">
                    <div class="empty-state">
                        <div class="empty-state-icon">❤️</div>
                        <h3>${Utils.translate('emptyWishlist')}</h3>
                        <p>Save your favorite items for later</p>
                        <a href="#/products" class="btn btn-primary">Browse Products</a>
                    </div>
                </div>
            `;
        }

        const products = wishlistItems.map(id => Products.getProductById(id)).filter(p => p);

        return `
            <div class="container">
                <div class="section-header">
                    <h1 class="section-title">${Utils.translate('wishlist')}</h1>
                    <p class="section-subtitle">${products.length} items saved</p>
                </div>

                <div class="product-grid">
                    ${products.map(product => Products.renderProductCard(product)).join('')}
                </div>
            </div>
        `;
    }
};

// Export Wishlist
window.Wishlist = Wishlist;
