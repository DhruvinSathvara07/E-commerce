/* ==========================================
   CART.JS - Shopping Cart Management
   ========================================== */

const Cart = {
    // Get user's cart
    getUserCart() {
        const user = Auth.getCurrentUser();
        if (!user) return [];

        const cart = Utils.Storage.get('cart', {});
        return cart[user.id] || [];
    },

    // Save user's cart
    saveUserCart(cartItems) {
        const user = Auth.getCurrentUser();
        if (!user) return false;

        const cart = Utils.Storage.get('cart', {});
        cart[user.id] = cartItems;
        Utils.Storage.set('cart', cart);
        Auth.updateBadges();
        return true;
    },

    // Add item to cart
    addItem(productId, quantity = 1) {
        if (!Auth.requireLogin()) return;

        const product = Products.getProductById(productId);
        if (!product) {
            Utils.showToast('Product not found', 'error');
            return;
        }

        const cartItems = this.getUserCart();
        const existingItem = cartItems.find(item => item.productId == productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cartItems.push({ productId, quantity });
        }

        this.saveUserCart(cartItems);
        Utils.showToast('Added to cart', 'success');
    },

    // Remove item from cart
    removeItem(productId) {
        const cartItems = this.getUserCart();
        const filtered = cartItems.filter(item => item.productId != productId);
        this.saveUserCart(filtered);
        Utils.showToast('Removed from cart', 'success');

        // Re-render cart page if on cart page
        if (window.App && window.App.currentRoute === '/cart') {
            window.App.navigate('/cart', false);
        }
    },

    // Update item quantity
    updateQuantity(productId, quantity) {
        if (quantity < 1) {
            this.removeItem(productId);
            return;
        }

        const cartItems = this.getUserCart();
        const item = cartItems.find(item => item.productId == productId);

        if (item) {
            item.quantity = quantity;
            this.saveUserCart(cartItems);

            // Re-render cart page
            if (window.App && window.App.currentRoute === '/cart') {
                window.App.navigate('/cart', false);
            }
        }
    },

    // Calculate cart total
    calculateTotal() {
        const cartItems = this.getUserCart();
        let total = 0;

        cartItems.forEach(item => {
            const product = Products.getProductById(item.productId);
            if (product) {
                total += product.price * item.quantity;
            }
        });

        return total;
    },

    // Clear cart
    clearCart() {
        this.saveUserCart([]);
    },

    // Render cart page
    renderCartPage() {
        if (!Auth.isLoggedIn()) {
            return `
                <div class="container">
                    <div class="empty-state">
                        <div class="empty-state-icon"><i class="fas fa-shopping-cart"></i></div>
                        <h3>Please login to view your cart</h3>
                        <button class="btn btn-primary" onclick="Auth.showLoginModal()">Login</button>
                    </div>
                </div>
            `;
        }

        const cartItems = this.getUserCart();

        if (cartItems.length === 0) {
            return `
                <div class="container">
                    <div class="empty-state">
                        <div class="empty-state-icon"><i class="fas fa-shopping-cart"></i></div>
                        <h3>${Utils.translate('emptyCart')}</h3>
                        <p>Start shopping to add items to your cart</p>
                        <a href="#/products" class="btn btn-primary">Shop Now</a>
                    </div>
                </div>
            `;
        }

        const total = this.calculateTotal();

        return `
            <div class="container">
                <div class="section-header">
                    <h1 class="section-title">${Utils.translate('cart')}</h1>
                    <p class="section-subtitle">Review your items</p>
                </div>

                <div class="cart-layout">
                    <!-- Cart Items Section -->
                    <div class="cart-items-section">
                        ${cartItems.map(item => {
            const product = Products.getProductById(item.productId);
            if (!product) return '';

            return `
                                <div class="cart-item">
                                    <img src="${product.image}" alt="${product.title}" class="cart-item-image">
                                    
                                    <div class="cart-item-details">
                                        <h3 class="cart-item-title">${product.title}</h3>
                                        <p class="cart-item-category">${product.category || 'Product'}</p>
                                        <div class="cart-item-price">${Utils.formatPrice(product.price)}</div>
                                    </div>
                                    
                                    <div class="cart-item-quantity">
                                        <button class="qty-control-btn" onclick="Cart.updateQuantity(${product.id}, ${item.quantity - 1})">−</button>
                                        <span class="qty-display">${item.quantity}</span>
                                        <button class="qty-control-btn" onclick="Cart.updateQuantity(${product.id}, ${item.quantity + 1})">+</button>
                                    </div>
                                    
                                    <button class="cart-item-remove" onclick="Cart.removeItem(${product.id})" title="Remove item">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `;
        }).join('')}
                    </div>

                    <!-- Order Summary Section -->
                    <div class="cart-summary-section">
                        <div class="order-summary-card">
                            <h3 class="order-summary-title">Order Summary</h3>
                            
                            <div class="order-summary-row">
                                <span class="label">Subtotal:</span>
                                <span class="value">${Utils.formatPrice(total)}</span>
                            </div>
                            
                            <div class="order-summary-row">
                                <span class="label">Shipping:</span>
                                <span class="value" style="color: var(--color-success);">FREE</span>
                            </div>
                            
                            <div class="order-summary-row total">
                                <span class="label">Total:</span>
                                <span class="value">${Utils.formatPrice(total)}</span>
                            </div>
                            
                            <div class="order-summary-actions">
                                <a href="#/checkout" class="btn btn-primary btn-block btn-lg">${Utils.translate('checkout')}</a>
                                <a href="#/products" class="btn btn-outline btn-block">Continue Shopping</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Export Cart
window.Cart = Cart;
