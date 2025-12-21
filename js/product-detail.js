// Product Detail Page Extension for App
App.renderProductDetailPage = function () {
    const productId = this.currentProductId;
    const product = Products.getProductById(productId);

    if (!product) {
        return `
            <div class="container">
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <h3>Product Not Found</h3>
                    <p>The product you are looking for does not exist.</p>
                    <a href="#/products" class="btn btn-primary">${Utils.translate('browseProducts')}</a>
                </div>
            </div>
        `;
    }

    const translatedProduct = Utils.translateProduct(product);
    const user = Auth.getCurrentUser();
    const wishlist = Utils.Storage.get('wishlist', {});
    const userWishlist = user ? (wishlist[user.id] || []) : [];
    const isInWishlist = userWishlist.includes(product.id);

    const comments = Utils.Storage.get('comments', {});
    const productComments = comments[product.id] || [];
    const avgRating = productComments.length > 0
        ? Utils.calculateAverageRating(productComments)
        : product.rating?.rate || 0;
    const ratingCount = productComments.length || product.rating?.count || 0;

    return `
        <div class="container" style="padding: var(--spacing-2xl) var(--spacing-lg);" data-product-id="${product.id}">
            <div style="margin-bottom: var(--spacing-xl);">
                <a href="#/products" class="btn btn-ghost" style="padding-left: 0;">← Back to Products</a>
            </div>

            <div class="product-detail-grid">
                <!-- Product Image -->
                <div class="product-detail-image">
                    <div style="background: var(--color-bg-secondary); border-radius: var(--radius-2xl); padding: var(--spacing-2xl); position: relative;">
                        ${product.tags && product.tags.length > 0 ? `
                            <div class="product-tags">
                                ${product.tags.map(tag => `
                                    <span class="product-tag tag-${tag.replace('-', '')}">${Utils.translate(tag.replace('-', ''))}</span>
                                `).join('')}
                            </div>
                        ` : ''}
                        <img src="${product.image}" alt="${translatedProduct.title}" style="width: 100%; height: auto; max-height: 500px; object-fit: contain;">
                    </div>
                </div>

                <!-- Product Info -->
                <div class="product-detail-info">
                    <div style="margin-bottom: var(--spacing-md);">
                        <span style="font-size: var(--text-sm); color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: var(--font-semibold);">${translatedProduct.category}</span>
                    </div>

                    <h1 style="font-size: var(--text-4xl); font-weight: var(--font-bold); margin-bottom: var(--spacing-lg); line-height: 1.2;">${translatedProduct.title}</h1>

                    <div style="display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-xl);">
                        <div style="display: flex; align-items: center; gap: var(--spacing-xs);">
                            <span class="stars" style="font-size: var(--text-lg);">${Utils.renderStars(avgRating)}</span>
                            <span style="font-size: var(--text-base); color: var(--color-text-secondary); font-weight: var(--font-semibold);">${avgRating.toFixed(1)}</span>
                        </div>
                        <span style="color: var(--color-text-tertiary);">•</span>
                        <span style="font-size: var(--text-sm); color: var(--color-text-tertiary);">${ratingCount} reviews</span>
                    </div>

                    <div style="margin-bottom: var(--spacing-2xl);">
                        ${Products.renderProductPrice(product)}
                    </div>

                    <div style="padding: var(--spacing-xl); background: var(--color-bg-secondary); border-radius: var(--radius-xl); margin-bottom: var(--spacing-2xl);">
                        <h3 style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin-bottom: var(--spacing-md);">Description</h3>
                        <p style="line-height: 1.8; color: var(--color-text-secondary);">${translatedProduct.description}</p>
                    </div>

                    <div style="display: flex; gap: var(--spacing-lg); align-items: center; margin-bottom: var(--spacing-xl);">
                        <div>
                            <label style="display: block; margin-bottom: var(--spacing-sm); font-weight: var(--font-medium); font-size: var(--text-sm);">Quantity</label>
                            <div style="display: flex; align-items: center; border: 2px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden;">
                                <button onclick="this.nextElementSibling.stepDown()" class="qty-btn">−</button>
                                <input type="number" id="productQuantity" value="1" min="1" max="99" class="qty-input">
                                <button onclick="this.previousElementSibling.stepUp()" class="qty-btn">+</button>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: var(--spacing-md);">
                        <button class="btn btn-primary btn-lg" style="flex: 1;" onclick="Cart.addItem(${product.id}, parseInt(document.getElementById('productQuantity').value))">
                            ${Utils.translate('addToCart')}
                        </button>
                        <button class="wishlist-btn ${isInWishlist ? 'active' : ''} btn btn-outline btn-lg" onclick="Wishlist.toggle(${product.id})" style="position: static; width: auto; height: auto; border-radius: var(--radius-md); padding: var(--spacing-md); aspect-ratio: 1;">
                            <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};
