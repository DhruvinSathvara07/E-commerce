/* ==========================================
   ORDERS.JS - Order Management & Checkout
   ========================================== */

const Orders = {
    // Get all orders
    getAllOrders() {
        return Utils.Storage.get('orders', []);
    },

    // Get user's orders
    getUserOrders() {
        const user = Auth.getCurrentUser();
        if (!user) return [];

        const orders = this.getAllOrders();
        return orders.filter(order => order.userId === user.id);
    },

    // Get order by ID
    getOrderById(orderId) {
        const orders = this.getAllOrders();
        return orders.find(order => order.orderId === orderId);
    },

    // Create order
    createOrder(orderData) {
        const user = Auth.getCurrentUser();
        if (!user) {
            Utils.showToast('Please login to place an order', 'error');
            return false;
        }

        const cartItems = Cart.getUserCart();
        if (cartItems.length === 0) {
            Utils.showToast('Your cart is empty', 'error');
            return false;
        }

        // Calculate total and prepare products
        const products = cartItems.map(item => {
            const product = Products.getProductById(item.productId);
            return {
                productId: item.productId,
                title: product.title,
                image: product.image,
                quantity: item.quantity,
                price: product.price
            };
        });

        const totalPrice = Cart.calculateTotal();

        const newOrder = {
            orderId: Utils.generateId('order'),
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            products,
            totalAmount: totalPrice,
            paymentMethod: orderData.paymentMethod,
            orderStatus: 'pending',
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
            createdAt: new Date().toISOString()
        };

        const orders = this.getAllOrders();
        orders.unshift(newOrder);
        Utils.Storage.set('orders', orders);

        // Clear cart
        Cart.clearCart();

        Utils.showToast('Order placed successfully!', 'success');
        return newOrder;
    },

    // Cancel order
    cancelOrder(orderId) {
        const user = Auth.getCurrentUser();
        if (!user) return false;

        const orders = this.getAllOrders();
        const order = orders.find(o => o.orderId === orderId);

        if (!order) {
            Utils.showToast('Order not found', 'error');
            return false;
        }

        if (order.userId !== user.id) {
            Utils.showToast('Unauthorized', 'error');
            return false;
        }

        if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
            Utils.showToast('Cannot cancel this order', 'error');
            return false;
        }

        order.orderStatus = 'cancelled';
        Utils.Storage.set('orders', orders);
        Utils.showToast('Order cancelled', 'success');

        // Re-render orders page
        if (window.App && window.App.currentRoute === '/orders') {
            window.App.navigate('/orders', false);
        }

        return true;
    },

    // Update order status (admin only)
    updateOrderStatus(orderId, status) {
        if (!Auth.isAdmin()) {
            Utils.showToast('Admin access required', 'error');
            return false;
        }

        const orders = this.getAllOrders();
        const order = orders.find(o => o.orderId === orderId);

        if (!order) {
            Utils.showToast('Order not found', 'error');
            return false;
        }

        order.orderStatus = status;
        Utils.Storage.set('orders', orders);
        Utils.showToast('Order status updated', 'success');

        return true;
    },

    // Render checkout page
    renderCheckoutPage() {
        if (!Auth.isLoggedIn()) {
            return `
                <div class="container">
                    <div class="empty-state">
                        <div class="empty-state-icon"><i class="fas fa-lock"></i></div>
                        <h3>Please login to checkout</h3>
                        <button class="btn btn-primary" onclick="Auth.showLoginModal()">Login</button>
                    </div>
                </div>
            `;
        }

        const cartItems = Cart.getUserCart();
        if (cartItems.length === 0) {
            return `
                <div class="container">
                    <div class="empty-state">
                        <div class="empty-state-icon"><i class="fas fa-shopping-cart"></i></div>
                        <h3>Your cart is empty</h3>
                        <a href="#/products" class="btn btn-primary">Shop Now</a>
                    </div>
                </div>
            `;
        }

        const total = Cart.calculateTotal();
        const user = Auth.getCurrentUser();

        return `
            <div class="container">
                <div class="section-header">
                    <h1 class="section-title">${Utils.translate('checkout')}</h1>
                    <p class="section-subtitle">Complete your order</p>
                </div>

                <div class="checkout-layout">
                    <!-- Checkout Form Section -->
                    <div class="checkout-form-section">
                        <form id="checkoutForm">
                            <h3 class="checkout-section-title">Delivery Information</h3>
                            
                            <div class="form-group">
                                <label for="fullName">Full Name</label>
                                <input type="text" id="fullName" value="${user.name}" required>
                            </div>

                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" value="${user.email}" required>
                            </div>

                            <div class="form-group">
                                <label for="phone">Phone Number</label>
                                <input type="tel" id="phone" required>
                            </div>

                            <div class="form-group">
                                <label for="address">Delivery Address</label>
                                <textarea id="address" required placeholder="Street address, city, postal code" rows="3"></textarea>
                            </div>

                            <h3 class="checkout-subsection-title">Payment Method</h3>

                            <div class="payment-options">
                                <label class="payment-option">
                                    <div class="payment-content">
                                        <div class="payment-logo-wrapper">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" class="payment-logo">
                                        </div>
                                        <span class="payment-name">PayPal</span>
                                    </div>
                                    <div class="payment-select">
                                        <input type="radio" name="paymentMethod" value="PayPal" checked>
                                        <i class="far fa-circle unchecked-icon"></i>
                                        <i class="fas fa-check-circle checked-icon"></i>
                                    </div>
                                </label>
                                <label class="payment-option">
                                    <div class="payment-content">
                                        <div class="payment-logo-wrapper">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" class="payment-logo">
                                        </div>
                                        <span class="payment-name">Visa Card</span>
                                    </div>
                                    <div class="payment-select">
                                        <input type="radio" name="paymentMethod" value="Visa">
                                        <i class="far fa-circle unchecked-icon"></i>
                                        <i class="fas fa-check-circle checked-icon"></i>
                                    </div>
                                </label>
                            </div>

                            <div class="demo-notice">
                                <p>
                                    <i class="fas fa-exclamation-circle"></i> This is a demo payment gateway. No actual payment will be processed.
                                </p>
                            </div>

                            <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top: var(--spacing-xl);">
                                Place Order - ${Utils.formatPrice(total)}
                            </button>
                        </form>
                    </div>

                    <!-- Order Summary Section -->
                    <div class="checkout-summary-section">
                        <div class="order-summary-card">
                            <h3 class="order-summary-title">Order Summary</h3>
                            
                            <div class="order-summary-products">
                                ${cartItems.map(item => {
            const product = Products.getProductById(item.productId);
            if (!product) return '';
            return `
                                    <div class="order-summary-product">
                                        <img src="${product.image}" alt="${product.title}" class="order-summary-product-image">
                                        <div class="order-summary-product-details">
                                            <div class="order-summary-product-title">
                                                ${Utils.truncateText(product.title, 40)}
                                            </div>
                                            <div class="order-summary-product-meta">
                                                <span>Qty: ${item.quantity}</span>
                                                <span>${Utils.formatPrice(product.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                `;
        }).join('')}
                            </div>

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

                            <div class="order-info-box">
                                <div class="order-info-item">
                                    <i class="fas fa-truck" style="color: var(--color-primary);"></i>
                                    <span><strong>Delivery:</strong> 3-5 business days</span>
                                </div>
                                <div class="order-info-item">
                                    <i class="fas fa-undo" style="color: var(--color-primary);"></i>
                                    <span><strong>Returns:</strong> 30 days return policy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Render orders page
    renderOrdersPage() {
        if (!Auth.isLoggedIn()) {
            return `
                <div class="container">
                    <div class="empty-state">
                        <div class="empty-state-icon"><i class="fas fa-box"></i></div>
                        <h3>Please login to view your orders</h3>
                        <button class="btn btn-primary" onclick="Auth.showLoginModal()">Login</button>
                    </div>
                </div>
            `;
        }

        const orders = this.getUserOrders();

        if (orders.length === 0) {
            return `
                <div class="container">
                    <div class="empty-state">
                        <div class="empty-state-icon"><i class="fas fa-box-open"></i></div>
                        <h3>${Utils.translate('noOrders')}</h3>
                        <p>Start shopping to place your first order</p>
                        <a href="#/products" class="btn btn-primary">Shop Now</a>
                    </div>
                </div>
            `;
        }

        return `
            <div class="container">
                <div class="section-header">
                    <h1 class="section-title">${Utils.translate('orders')}</h1>
                    <p class="section-subtitle">${orders.length} orders</p>
                </div>

                <div style="max-width: 1000px; margin: 0 auto;">
                    ${orders.map(order => `
                        <div style="background: var(--color-surface); padding: var(--spacing-xl); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); margin-bottom: var(--spacing-lg);">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-lg); padding-bottom: var(--spacing-lg); border-bottom: 1px solid var(--color-border);">
                                <div>
                                    <h3 style="margin-bottom: var(--spacing-sm);">Order #${order.orderId.slice(-8)}</h3>
                                    <p style="color: var(--color-text-secondary); margin: 0;">
                                        ${Utils.formatDate(order.createdAt)}
                                    </p>
                                </div>
                                <div>
                                    <span style="padding: var(--spacing-xs) var(--spacing-md); border-radius: var(--radius-full); font-size: var(--text-sm); font-weight: var(--font-semibold); 
                                        ${order.orderStatus === 'delivered' ? 'background: var(--color-success); color: white;' : ''}
                                        ${order.orderStatus === 'pending' ? 'background: var(--color-warning); color: white;' : ''}
                                        ${order.orderStatus === 'cancelled' ? 'background: var(--color-danger); color: white;' : ''}
                                        ${order.orderStatus === 'processing' ? 'background: var(--color-info); color: white;' : ''}
                                    ">
                                        ${order.orderStatus.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div style="margin-bottom: var(--spacing-lg);">
                                ${order.products.map(item => `
                                    <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                                        <img src="${item.image}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-md);">
                                        <div style="flex: 1;">
                                            <h4 style="margin-bottom: var(--spacing-xs);">${item.title}</h4>
                                            <p style="color: var(--color-text-secondary); margin: 0;">
                                                Qty: ${item.quantity} × ${Utils.formatPrice(item.price)}
                                            </p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: var(--spacing-lg); border-top: 1px solid var(--color-border);">
                                <div>
                                    <p style="margin: 0; color: var(--color-text-secondary);">Total Amount</p>
                                    <p style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--color-primary); margin: 0;">
                                        ${Utils.formatPrice(order.totalAmount)}
                                    </p>
                                </div>
                                ${order.orderStatus === 'pending' || order.orderStatus === 'processing' ? `
                                    <button class="btn btn-danger" onclick="Orders.cancelOrder('${order.orderId}')">
                                        Cancel Order
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

// Initialize orders on page load
document.addEventListener('DOMContentLoaded', () => {
    // Handle checkout form submission
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'checkoutForm') {
            e.preventDefault();

            const address = document.getElementById('address').value;
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

            const order = Orders.createOrder({ address, paymentMethod });

            if (order) {
                // Navigate to orders page
                window.App.navigate('/orders');
            }
        }
    });
});

// Export Orders
window.Orders = Orders;
