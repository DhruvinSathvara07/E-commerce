/* ==========================================
   PRODUCT PAGE LOGIC
   ========================================== */

const ProductPage = {
    currentProduct: null,

    // Initialize page
    async init() {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            this.renderError('No product specified');
            return;
        }

        // Render loading state
        this.renderLoading();

        try {
            // Fetch product details from API
            const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
            if (!response.ok) throw new Error('Product not found');

            const product = await response.json();
            this.currentProduct = product;

            // Render basic product details and reviews
            this.renderProduct(product);
            this.renderReviewsSection();

        } catch (error) {
            console.error('Error loading product:', error);
            this.renderError('Failed to load product details');
        }

        // Initialize UI components
        if (window.Auth) Auth.updateUI();
    },

    // Render loading state
    renderLoading() {
        const container = document.getElementById('product-detail-container');
        if (container) {
            container.innerHTML = `
                <div class="container" style="padding: var(--spacing-3xl) 0; text-align: center;">
                    <div class="spinner"></div>
                    <p style="margin-top: var(--spacing-md); color: var(--color-text-secondary);">Loading product...</p>
                </div>
            `;
        }
    },

    // Render error state
    renderError(message) {
        const container = document.getElementById('product-detail-container');
        if (container) {
            container.innerHTML = `
                <div class="container" style="padding: var(--spacing-3xl) 0; text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: var(--spacing-lg); color: var(--color-warning);"><i class="fas fa-exclamation-triangle"></i></div>
                    <h3>${message}</h3>
                    <a href="index.html#/products" class="btn btn-primary" style="margin-top: var(--spacing-lg);">Browse Products</a>
                </div>
            `;
        }
    },

    // Render product details
    renderProduct(product) {
        const container = document.getElementById('product-detail-container');
        if (!container) return;

        // Use Products.getProductStats if available (loaded via products.js), else local calc
        // Since products.js is loaded, we can rely on it if Products object exists, 
        // but we need to ensure Products has 'comments' loaded from storage.
        // For safety, let's recalculate simply here to be standalone-ish.

        const comments = Utils.Storage.get('comments', {});
        const productComments = comments[product.id] || [];
        const avgRating = productComments.length > 0
            ? Utils.calculateAverageRating(productComments)
            : product.rating?.rate || 0;
        const ratingCount = productComments.length || product.rating?.count || 0;

        // Determine top rated dynamically for badge
        const isTopRated = avgRating >= 4.5 && ratingCount >= 2;

        const user = Auth.getCurrentUser();
        const wishlist = Utils.Storage.get('wishlist', {});
        const userWishlist = user ? (wishlist[user.id] || []) : [];
        const isInWishlist = userWishlist.includes(product.id);

        // Tags
        const tags = [];
        if (product.price > 50) tags.push('sale');
        if (isTopRated) tags.push('top-rated');

        // Category Map
        const categoryMap = {
            'electronics': 'Electronics',
            'jewelery': 'Jewelry',
            "men's clothing": 'Jackets',
            "women's clothing": "Women's Clothing"
        };
        const displayCategory = categoryMap[product.category] || product.category;

        container.innerHTML = `
            <div class="container" style="padding: var(--spacing-2xl) var(--spacing-lg);">
                <div style="margin-bottom: var(--spacing-xl);">
                    <a href="index.html#/products" class="btn btn-ghost" style="padding-left: 0; color: var(--color-text-secondary);">← Back to Products</a>
                </div>

                <div class="product-detail-grid">
                    <!-- Product Image -->
                    <div class="product-detail-image">
                        <div style="background: var(--color-bg-secondary); border-radius: var(--radius-2xl); padding: var(--spacing-2xl); position: relative; border: 1px solid var(--color-border);">
                            ${tags.length > 0 ? `
                                <div class="product-tags">
                                    ${tags.map(tag => `
                                        <span class="product-tag tag-${tag.replace('-', '')}">${Utils.translate(tag.replace('-', ''))}</span>
                                    `).join('')}
                                </div>
                            ` : ''}
                            <img src="${product.image}" alt="${product.title}" style="width: 100%; height: auto; max-height: 500px; object-fit: contain;">
                        </div>
                    </div>

                    <!-- Product Info -->
                    <div class="product-detail-info">
                        <div style="margin-bottom: var(--spacing-md);">
                            <span style="font-size: var(--text-sm); color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: var(--font-semibold);">
                                ${displayCategory}
                            </span>
                        </div>

                        <h1 style="font-size: var(--text-4xl); font-weight: var(--font-bold); margin-bottom: var(--spacing-lg); line-height: 1.2; color: var(--color-text);">
                            ${product.title}
                        </h1>

                        <div style="display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-xl);">
                            <div style="display: flex; align-items: center; gap: var(--spacing-xs);">
                                <span class="stars" style="font-size: var(--text-lg); color: #fbbf24;">${Utils.renderStars(avgRating)}</span>
                                <span style="font-size: var(--text-base); color: var(--color-text-secondary); font-weight: var(--font-semibold);">${avgRating.toFixed(1)}</span>
                            </div>
                            <span style="color: var(--color-text-tertiary);">•</span>
                            <a href="#reviews-anchor" style="font-size: var(--text-sm); color: var(--color-primary); text-decoration: none;">${ratingCount} reviews</a>
                        </div>

                        <div style="margin-bottom: var(--spacing-2xl);">
                            <div class="product-price" style="font-size: var(--text-3xl); font-weight: var(--font-bold); color: var(--color-text);">
                                ${Utils.formatPrice(product.price)}
                            </div>
                        </div>

                        <div style="padding: var(--spacing-xl); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); margin-bottom: var(--spacing-2xl);">
                            <h3 style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin-bottom: var(--spacing-md); color: var(--color-text);">Description</h3>
                            <p style="line-height: 1.8; color: var(--color-text-secondary); margin: 0;">${product.description}</p>
                        </div>

                        <div style="display: flex; gap: var(--spacing-lg); align-items: center; margin-bottom: var(--spacing-xl);">
                            <div>
                                <label style="display: block; margin-bottom: var(--spacing-sm); font-weight: var(--font-medium); font-size: var(--text-sm); color: var(--color-text);">Quantity</label>
                                <div style="display: flex; align-items: center; border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; background: var(--color-bg-secondary);">
                                    <button onclick="this.nextElementSibling.stepDown()" class="qty-btn" style="color: var(--color-text);">-</button>
                                    <input type="number" id="productQuantity" value="1" min="1" max="99" class="qty-input" style="background: transparent; color: var(--color-text); border: none;">
                                    <button onclick="this.previousElementSibling.stepUp()" class="qty-btn" style="color: var(--color-text);">+</button>
                                </div>
                            </div>
                        </div>

                        <div style="display: flex; gap: var(--spacing-md);">
                            <button class="btn btn-primary btn-lg" style="flex: 1;" onclick="Cart.addItem(${product.id}, parseInt(document.getElementById('productQuantity').value))">
                                ${Utils.translate('addToCart')}
                            </button>
                            <button class="wishlist-btn ${isInWishlist ? 'active' : ''} btn btn-outline btn-lg" 
                                    onclick="Wishlist.toggle(${product.id})" 
                                    style="position: static; width: auto; height: auto; border-radius: var(--radius-md); padding: var(--spacing-md); aspect-ratio: 1; border-color: var(--color-border);">
                                <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Reviews Section Injection Point -->
                <div id="reviews-anchor"></div>
                <div id="reviews-container" class="reviews-section"></div>
            </div>
        `;
    },

    // Render Reviews Section
    renderReviewsSection() {
        const container = document.getElementById('reviews-container');
        if (!container || !this.currentProduct) return;

        const productId = this.currentProduct.id;
        const comments = Utils.Storage.get('comments', {});
        const productComments = comments[productId] || [];

        // Calculate Rating Stats
        const avgRating = productComments.length > 0
            ? Utils.calculateAverageRating(productComments)
            : this.currentProduct.rating?.rate || 0;
        const totalReviews = Math.max(productComments.length, this.currentProduct.rating?.count || 0);

        // Sort comments: Newest first
        const sortedComments = [...productComments].sort((a, b) => new Date(b.date) - new Date(a.date));

        const user = Auth.getCurrentUser();

        container.innerHTML = `
            <div class="reviews-header">
                <h2 class="section-title">Customer Reviews</h2>
            </div>
            
            <div class="review-stats">
                <div>
                    <div class="stat-big">${avgRating.toFixed(1)}</div>
                    <div class="stars" style="color: #fbbf24; font-size: var(--text-xl);">${Utils.renderStars(avgRating)}</div>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: var(--font-semibold); color: var(--color-text);">Based on ${totalReviews} reviews</div>
                    <p style="color: var(--color-text-secondary); font-size: var(--text-sm);">See what other customers have to say about this product.</p>
                </div>
            </div>

            <!-- Review Input Form (Only for logged in users) -->
            ${user ? `
                <div class="review-form-container">
                    <h3 style="margin-bottom: var(--spacing-md); font-size: var(--text-lg); color: var(--color-text);">Write a Review</h3>
                    <form id="reviewForm" onsubmit="ProductPage.handleReviewSubmit(event)">
                        <div class="star-rating-input">
                            <input type="radio" name="rating" id="star5" value="5" required/><label for="star5" title="5 stars"><i class="fas fa-star"></i></label>
                            <input type="radio" name="rating" id="star4" value="4"/><label for="star4" title="4 stars"><i class="fas fa-star"></i></label>
                            <input type="radio" name="rating" id="star3" value="3"/><label for="star3" title="3 stars"><i class="fas fa-star"></i></label>
                            <input type="radio" name="rating" id="star2" value="2"/><label for="star2" title="2 stars"><i class="fas fa-star"></i></label>
                            <input type="radio" name="rating" id="star1" value="1"/><label for="star1" title="1 star"><i class="fas fa-star"></i></label>
                        </div>
                        <textarea class="review-input" name="comment" placeholder="Share your thoughts about this product..." required></textarea>
                        <button type="submit" class="btn btn-primary" style="min-width: 150px;">Submit Review</button>
                    </form>
                </div>
            ` : `
                <div class="empty-state" style="padding: var(--spacing-xl); margin-bottom: var(--spacing-2xl); border: 1px dashed var(--color-border);">
                    <p style="margin-bottom: var(--spacing-md);">Please login to write a review.</p>
                    <button class="btn btn-outline" onclick="window.location.hash = '/login'; Auth.showLoginModal()">Login to Review</button>
                </div>
            `}

            <!-- Reviews List -->
            <div class="reviews-list">
                ${sortedComments.length > 0 ? sortedComments.map(review => `
                    <div class="review-card">
                        <div class="review-header">
                            <div class="review-user">${review.user}</div>
                            <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
                        </div>
                        <div class="stars" style="color: #fbbf24; margin-bottom: var(--spacing-sm); font-size: var(--text-sm);">
                            ${Utils.renderStars(review.rating)}
                        </div>
                        <div class="review-text">${review.comment}</div>
                    </div>
                `).join('') : `
                    <div style="text-align: center; color: var(--color-text-tertiary); padding: var(--spacing-xl);">
                        <i class="far fa-comment-alt" style="font-size: 3rem; margin-bottom: var(--spacing-md); opacity: 0.5;"></i>
                        <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                `}
            </div>
        `;
    },

    // Handle Review Submission
    handleReviewSubmit(e) {
        e.preventDefault();

        const user = Auth.getCurrentUser();
        if (!user) {
            alert('Please login to submit a review');
            return;
        }

        const form = e.target;
        const rating = form.querySelector('input[name="rating"]:checked').value;
        const comment = form.querySelector('[name="comment"]').value;

        const newReview = {
            id: Date.now(),
            productId: this.currentProduct.id,
            userId: user.email, // using email or id as identifier
            user: user.name,
            rating: parseInt(rating),
            comment: comment,
            date: new Date().toISOString()
        };

        // Save to LocalStorage
        const comments = Utils.Storage.get('comments', {});
        if (!comments[this.currentProduct.id]) {
            comments[this.currentProduct.id] = [];
        }
        comments[this.currentProduct.id].push(newReview);
        Utils.Storage.set('comments', comments);

        // Clear form
        form.reset();

        // Show success
        Utils.showToast('Review submitted successfully', 'success');

        // Re-render
        this.renderProduct(this.currentProduct); // Update top summary stats
        this.renderReviewsSection(); // Update list
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ProductPage.init();
});
