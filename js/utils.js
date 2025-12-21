/* ==========================================
   UTILS.JS - Helper Functions & LocalStorage
   ========================================== */

// LocalStorage Helper Functions
const Storage = {
    // Get item from localStorage
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error getting ${key} from localStorage:`, error);
            return defaultValue;
        }
    },

    // Set item in localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting ${key} in localStorage:`, error);
            return false;
        }
    },

    // Remove item from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing ${key} from localStorage:`, error);
            return false;
        }
    },

    // Clear all localStorage
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Generate unique ID
function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format price based on currency
function formatPrice(price, currency = 'USD') {
    const settings = Storage.get('settings', { currency: 'USD' });
    const currentCurrency = settings.currency || currency;

    // Convert price if needed
    let convertedPrice = price;
    if (currentCurrency === 'MNT') {
        convertedPrice = price * 3500; // 1 USD = 3500 MNT (approximate)
    }

    // Format with currency symbol
    if (currentCurrency === 'USD') {
        return `$${convertedPrice.toFixed(2)}`;
    } else {
        return `₮${Math.round(convertedPrice).toLocaleString()}`;
    }
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password (minimum 6 characters)
function isValidPassword(password) {
    return password && password.length >= 6;
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Add styles
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        animation: 'slideIn 0.3s ease-out',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    });

    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    // Add to document
    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations for toast
if (!document.querySelector('#toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Calculate average rating
function calculateAverageRating(comments) {
    if (!comments || comments.length === 0) return 0;
    const sum = comments.reduce((acc, comment) => acc + comment.rating, 0);
    return (sum / comments.length).toFixed(1);
}

// Render stars
// Render stars
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = '';

    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }

    return starsHtml;
}

// Initialize default data
function initializeDefaultData() {
    // Initialize users if not exists
    if (!Storage.get('users')) {
        Storage.set('users', []);
    }

    // Initialize products if not exists
    if (!Storage.get('products')) {
        Storage.set('products', []);
    }

    // Initialize orders if not exists
    if (!Storage.get('orders')) {
        Storage.set('orders', []);
    }

    // Initialize cart if not exists
    if (!Storage.get('cart')) {
        Storage.set('cart', {});
    }

    // Initialize wishlist if not exists
    if (!Storage.get('wishlist')) {
        Storage.set('wishlist', {});
    }

    // Initialize comments if not exists
    if (!Storage.get('comments')) {
        Storage.set('comments', {});
    }

    // Initialize settings if not exists
    if (!Storage.get('settings')) {
        Storage.set('settings', {
            language: 'en',
            currency: 'USD',
            theme: 'light'
        });
    }
}

// Get translation
function translate(key) {
    const settings = Storage.get('settings', { language: 'en' });
    const language = settings.language || 'en';

    const translations = {
        en: {
            // Navbar
            home: 'Home',
            products: 'Products',
            categories: 'Categories',
            sale: 'Sale',
            winterSale: 'Winter Sale',
            brands: 'Brands',
            orders: 'Orders',
            wishlist: 'Wishlist',
            cart: 'Cart',
            settings: 'Settings',
            login: 'Login',
            logout: 'Logout',
            signup: 'Signup',
            register: 'Register',
            admin: 'Admin',

            // Homepage
            welcomeToProGear: 'Welcome to ProGear',
            premiumGamingEquipment: 'Premium gaming equipment trusted by professional esports players worldwide',
            shopNow: 'Shop Now',
            viewSale: 'View Sale',
            featuredProducts: 'Featured Products',
            handpickedGear: 'Handpicked gear for serious gamers',
            viewAllProducts: 'View All Products',

            // Product Page
            discoverPremiumGaming: 'Discover premium gaming equipment',
            productsFound: 'products found',
            filters: 'Filters',
            category: 'Category',
            brand: 'Brand',
            tags: 'Tags',
            all: 'All',
            sortDefault: 'Sort: Default',
            sortPriceLow: 'Price: Low to High',
            sortPriceHigh: 'Price: High to Low',
            sortRating: 'Rating',
            sortName: 'Name',
            noProductsFound: 'No products found',
            tryAdjustingFilters: 'Try adjusting your filters',

            // Product Card
            addToCart: 'Add to Cart',
            buyNow: 'Buy Now',
            usedBy: 'Used by',
            new: 'New',
            topRated: 'Top Rated',
            featured: 'Featured',

            // Cart
            yourCart: 'Your Cart',
            emptyCart: 'Your cart is empty',
            startShopping: 'Start shopping to add items',
            browseProducts: 'Browse Products',
            quantity: 'Quantity',
            price: 'Price',
            remove: 'Remove',
            subtotal: 'Subtotal',
            shipping: 'Shipping',
            tax: 'Tax',
            total: 'Total',
            proceedToCheckout: 'Proceed to Checkout',
            continueShopping: 'Continue Shopping',

            // Checkout
            checkout: 'Checkout',
            shippingInformation: 'Shipping Information',
            fullName: 'Full Name',
            emailAddress: 'Email Address',
            phoneNumber: 'Phone Number',
            address: 'Address',
            city: 'City',
            zipCode: 'Zip Code',
            country: 'Country',
            paymentMethod: 'Payment Method',
            creditCard: 'Credit Card',
            paypal: 'PayPal',
            cashOnDelivery: 'Cash on Delivery',
            placeOrder: 'Place Order',
            orderSummary: 'Order Summary',

            // Orders
            myOrders: 'My Orders',
            noOrders: 'No orders yet',
            startShoppingToPlaceOrders: 'Start shopping to place orders',
            orderNumber: 'Order',
            orderDate: 'Order Date',
            orderStatus: 'Status',
            orderTotal: 'Total',
            viewDetails: 'View Details',
            pending: 'Pending',
            processing: 'Processing',
            shipped: 'Shipped',
            delivered: 'Delivered',
            cancelled: 'Cancelled',

            // Wishlist
            myWishlist: 'My Wishlist',
            emptyWishlist: 'Your wishlist is empty',
            addItemsYouLove: 'Add items you love to your wishlist',
            moveToCart: 'Move to Cart',

            // Search
            search: 'Search products, brands, pro players...',
            searchResults: 'Search Results',
            showingResultsFor: 'Showing results for',
            noResultsFound: 'No results found',
            tryDifferentKeywords: 'Try searching with different keywords',

            // Categories
            browseByCategory: 'Browse by category',
            shopByBrand: 'Shop by brand',

            // Forms
            enterYourEmail: 'Enter your email',
            enterYourPassword: 'Enter your password',
            enterYourFullName: 'Enter your full name',
            password: 'Password',
            createPassword: 'Create a password (min 6 characters)',
            passwordMinLength: 'Password must be at least 6 characters long',
            welcomeBack: 'Welcome Back!',
            loginToContinue: 'Login to continue shopping',
            createAccount: 'Create Account',
            joinUs: 'Join us and start shopping!',
            dontHaveAccount: "Don't have an account?",
            alreadyHaveAccount: 'Already have an account?',
            or: 'or',

            // Settings
            customizeExperience: 'Customize your experience',
            theme: 'Theme',
            lightMode: 'Light Mode',
            darkMode: 'Dark Mode',
            language: 'Language',
            english: 'English',
            mongolian: 'Mongolian',
            currency: 'Currency',
            account: 'Account',
            email: 'Email',
            role: 'Role',
            youAreNotLoggedIn: 'You are not logged in',

            // Footer
            proGearFooterDesc: 'Premium gaming equipment trusted by professional esports players worldwide.',
            quickLinks: 'Quick Links',
            support: 'Support',
            contact: 'Contact',
            contactUs: 'Contact Us',
            shippingInfo: 'Shipping Info',
            returnsPolicy: 'Returns Policy',
            faq: 'FAQ',
            privacyPolicy: 'Privacy Policy',
            termsOfService: 'Terms of Service',
            allRightsReserved: 'All rights reserved.',

            // Admin
            adminDashboard: 'Admin Dashboard',
            manageYourPlatform: 'Manage your e-commerce platform',
            totalProducts: 'Total Products',
            totalOrders: 'Total Orders',
            totalRevenue: 'Total Revenue',
            pendingOrders: 'Pending Orders',
            winterSaleControls: 'Winter Sale Controls',
            removeBanner: 'Remove Banner',
            addBanner: 'Add Banner',
            winterSale: 'Winter Sale',
            on: 'ON',
            off: 'OFF',
            banner: 'Banner',
            visible: 'Visible',
            hidden: 'Hidden',
            saleStatus: 'Sale Status',
            active: 'Active',
            inactive: 'Inactive',
            productsManagement: 'Products Management',
            ordersManagement: 'Orders Management',
            addNewProduct: 'Add New Product',
            productTitle: 'Product Title',
            description: 'Description',
            image: 'Image',
            imageUrl: 'Image URL',
            title: 'Title',
            actions: 'Actions',
            delete: 'Delete',
            cancel: 'Cancel',
            save: 'Save',
            addProduct: 'Add Product',
            editProduct: 'Edit Product',
            deleteProduct: 'Delete Product',
            manageProducts: 'Manage Products',
            manageOrders: 'Manage Orders',
            manageUsers: 'Manage Users',
            noOrdersYet: 'No orders yet',
            order: 'Order',
            customer: 'Customer',
            date: 'Date',
            status: 'Status',
            deliveryAddress: 'Delivery Address',
            totalAmount: 'Total Amount',
            qty: 'Qty',
            accessDenied: 'Access Denied',
            adminPrivilegesRequired: 'Admin privileges required',
            goHome: 'Go Home',
            areYouSure: 'Are you sure you want to delete this product?',
            winterSaleBannerAdded: 'Winter Sale banner added!',
            winterSaleBannerRemoved: 'Winter Sale banner removed!',
            winterSaleActivated: 'Winter Sale activated!',
            winterSaleDeactivated: 'Winter Sale deactivated!',
            winterSaleIsLive: 'Winter Sale is Live! Get amazing discounts on premium gaming gear!',
            shopNowLink: 'Shop Now',

            // Messages
            productAdded: 'Product added to cart',
            productRemoved: 'Product removed from cart',
            addedToWishlist: 'Added to wishlist',
            removedFromWishlist: 'Removed from wishlist',
            orderPlaced: 'Order placed successfully',
            loginRequired: 'Please login to continue',
            adminAccessRequired: 'Admin access required',

            // Misc
            filter: 'Filter',
            sortBy: 'Sort By',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            warning: 'Warning',
            info: 'Info'
        },
        mn: {
            // Navbar
            home: 'Нүүр',
            products: 'Бүтээгдэхүүн',
            categories: 'Ангилал',
            sale: 'Хямдрал',
            winterSale: 'Өвлийн Хямдрал',
            brands: 'Брэнд',
            orders: 'Захиалга',
            wishlist: 'Хүслийн жагсаалт',
            cart: 'Сагс',
            settings: 'Тохиргоо',
            login: 'Нэвтрэх',
            logout: 'Гарах',
            signup: 'Бүртгүүлэх',
            register: 'Бүртгүүлэх',
            admin: 'Админ',

            // Homepage
            welcomeToProGear: 'ProGear-т тавтай морил',
            premiumGamingEquipment: 'Дэлхийн мэргэжлийн киберспортын тоглогчдын итгэдэг дээд зэргийн тоглоомын төхөөрөмж',
            shopNow: 'Худалдан авах',
            viewSale: 'Хямдрал үзэх',
            featuredProducts: 'Онцлох бүтээгдэхүүн',
            handpickedGear: 'Жинхэнэ тоглогчдод зориулсан сонгосон төхөөрөмж',
            viewAllProducts: 'Бүх бүтээгдэхүүн үзэх',

            // Product Page
            discoverPremiumGaming: 'Дээд зэргийн тоглоомын төхөөрөмж олох',
            productsFound: 'бүтээгдэхүүн олдлоо',
            filters: 'Шүүлтүүр',
            category: 'Ангилал',
            brand: 'Брэнд',
            tags: 'Шошго',
            all: 'Бүгд',
            sortDefault: 'Эрэмбэлэх: Үндсэн',
            sortPriceLow: 'Үнэ: Бага-их',
            sortPriceHigh: 'Үнэ: Их-бага',
            sortRating: 'Үнэлгээ',
            sortName: 'Нэр',
            noProductsFound: 'Бүтээгдэхүүн олдсонгүй',
            tryAdjustingFilters: 'Шүүлтүүрээ өөрчилж үзнэ үү',

            // Product Card
            addToCart: 'Сагсанд нэмэх',
            buyNow: 'Худалдаж авах',
            usedBy: 'Хэрэглэдэг',
            new: 'Шинэ',
            topRated: 'Шилдэг',
            featured: 'Онцлох',

            // Cart
            yourCart: 'Таны сагс',
            emptyCart: 'Таны сагс хоосон байна',
            startShopping: 'Бараа нэмэхийн тулд худалдан авалт эхлүүлнэ үү',
            browseProducts: 'Бүтээгдэхүүн үзэх',
            quantity: 'Тоо ширхэг',
            price: 'Үнэ',
            remove: 'Устгах',
            subtotal: 'Дэд нийлбэр',
            shipping: 'Хүргэлт',
            tax: 'Татвар',
            total: 'Нийт',
            proceedToCheckout: 'Төлбөр төлөхөд шилжих',
            continueShopping: 'Үргэлжлүүлэн худалдан авах',

            // Checkout
            checkout: 'Төлбөр төлөх',
            shippingInformation: 'Хүргэлтийн мэдээлэл',
            fullName: 'Бүтэн нэр',
            emailAddress: 'Имэйл хаяг',
            phoneNumber: 'Утасны дугаар',
            address: 'Хаяг',
            city: 'Хот',
            zipCode: 'Шуудангийн код',
            country: 'Улс',
            paymentMethod: 'Төлбөрийн арга',
            creditCard: 'Кредит карт',
            paypal: 'PayPal',
            cashOnDelivery: 'Бэлнээр төлөх',
            placeOrder: 'Захиалга өгөх',
            orderSummary: 'Захиалгын хураангуй',

            // Orders
            myOrders: 'Миний захиалга',
            noOrders: 'Захиалга байхгүй байна',
            startShoppingToPlaceOrders: 'Захиалга өгөхийн тулд худалдан авалт эхлүүлнэ үү',
            orderNumber: 'Захиалга',
            orderDate: 'Захиалгын огноо',
            orderStatus: 'Төлөв',
            orderTotal: 'Нийт',
            viewDetails: 'Дэлгэрэнгүй үзэх',
            pending: 'Хүлээгдэж буй',
            processing: 'Боловсруулж байна',
            shipped: 'Илгээсэн',
            delivered: 'Хүргэгдсэн',
            cancelled: 'Цуцлагдсан',

            // Wishlist
            myWishlist: 'Миний хүслийн жагсаалт',
            emptyWishlist: 'Таны хүслийн жагсаалт хоосон байна',
            addItemsYouLove: 'Таалагдсан бараагаа хүслийн жагсаалтандаа нэмнэ үү',
            moveToCart: 'Сагсанд шилжүүлэх',

            // Search
            search: 'Бүтээгдэхүүн, брэнд, тоглогч хайх...',
            searchResults: 'Хайлтын үр дүн',
            showingResultsFor: 'Үр дүн харуулж байна',
            noResultsFound: 'Үр дүн олдсонгүй',
            tryDifferentKeywords: 'Өөр түлхүүр үгээр хайж үзнэ үү',

            // Categories
            browseByCategory: 'Ангилалаар үзэх',
            shopByBrand: 'Брэндээр худалдан авах',

            // Forms
            enterYourEmail: 'Имэйл хаягаа оруулна уу',
            enterYourPassword: 'Нууц үгээ оруулна уу',
            enterYourFullName: 'Бүтэн нэрээ оруулна уу',
            password: 'Нууц үг',
            createPassword: 'Нууц үг үүсгэх (хамгийн багадаа 6 тэмдэгт)',
            passwordMinLength: 'Нууц үг хамгийн багадаа 6 тэмдэгттэй байх ёстой',
            welcomeBack: 'Тавтай морил!',
            loginToContinue: 'Үргэлжлүүлэхийн тулд нэвтэрнэ үү',
            createAccount: 'Бүртгэл үүсгэх',
            joinUs: 'Бидэнтэй нэгдэж, худалдан авалт эхлүүлээрэй!',
            dontHaveAccount: 'Бүртгэлгүй юу?',
            alreadyHaveAccount: 'Бүртгэлтэй юу?',
            or: 'эсвэл',

            // Settings
            customizeExperience: 'Өөрийн туршлагаа тохируулах',
            theme: 'Загвар',
            lightMode: 'Цайвар горим',
            darkMode: 'Харанхуй горим',
            language: 'Хэл',
            english: 'Англи',
            mongolian: 'Монгол',
            currency: 'Валют',
            account: 'Бүртгэл',
            email: 'Имэйл',
            role: 'Үүрэг',
            youAreNotLoggedIn: 'Та нэвтрээгүй байна',

            // Footer
            proGearFooterDesc: 'Дэлхийн мэргэжлийн киберспортын тоглогчдын итгэдэг дээд зэргийн тоглоомын төхөөрөмж.',
            quickLinks: 'Шуурхай холбоос',
            support: 'Дэмжлэг',
            contact: 'Холбоо барих',
            contactUs: 'Бидэнтэй холбогдох',
            shippingInfo: 'Хүргэлтийн мэдээлэл',
            returnsPolicy: 'Буцаалтын бодлого',
            faq: 'Түгээмэл асуулт',
            privacyPolicy: 'Нууцлалын бодлого',
            termsOfService: 'Үйлчилгээний нөхцөл',
            allRightsReserved: 'Бүх эрх хуулиар хамгаалагдсан.',

            // Admin
            adminDashboard: 'Админ самбар',
            manageYourPlatform: 'Цахим худалдааны платформоо удирдах',
            totalProducts: 'Нийт бүтээгдэхүүн',
            totalOrders: 'Нийт захиалга',
            totalRevenue: 'Нийт орлого',
            pendingOrders: 'Хүлээгдэж буй захиалга',
            winterSaleControls: 'Өвлийн хямдралын удирдлага',
            removeBanner: 'Баннер устгах',
            addBanner: 'Баннер нэмэх',
            winterSale: 'Өвлийн хямдрал',
            on: 'ИДЭВХТЭЙ',
            off: 'ИДЭВХГҮЙ',
            banner: 'Баннер',
            visible: 'Харагдаж байна',
            hidden: 'Нуугдсан',
            saleStatus: 'Хямдралын төлөв',
            active: 'Идэвхтэй',
            inactive: 'Идэвхгүй',
            productsManagement: 'Бүтээгдэхүүний удирдлага',
            ordersManagement: 'Захиалгын удирдлага',
            addNewProduct: 'Шинэ бүтээгдэхүүн нэмэх',
            productTitle: 'Бүтээгдэхүүний нэр',
            description: 'Тайлбар',
            image: 'Зураг',
            imageUrl: 'Зургийн URL',
            title: 'Нэр',
            actions: 'Үйлдэл',
            delete: 'Устгах',
            cancel: 'Цуцлах',
            save: 'Хадгалах',
            addProduct: 'Бүтээгдэхүүн нэмэх',
            editProduct: 'Бүтээгдэхүүн засах',
            deleteProduct: 'Бүтээгдэхүүн устгах',
            manageProducts: 'Бүтээгдэхүүн удирдах',
            manageOrders: 'Захиалга удирдах',
            manageUsers: 'Хэрэглэгч удирдах',
            noOrdersYet: 'Захиалга байхгүй байна',
            order: 'Захиалга',
            customer: 'Үйлчлүүлэгч',
            date: 'Огноо',
            status: 'Төлөв',
            deliveryAddress: 'Хүргэлтийн хаяг',
            totalAmount: 'Нийт дүн',
            qty: 'Тоо',
            accessDenied: 'Нэвтрэх эрхгүй',
            adminPrivilegesRequired: 'Админ эрх шаардлагатай',
            goHome: 'Нүүр хуудас руу очих',
            areYouSure: 'Та энэ бүтээгдэхүүнийг устгахдаа итгэлтэй байна уу?',
            winterSaleBannerAdded: 'Өвлийн хямдралын баннер нэмэгдлээ!',
            winterSaleBannerRemoved: 'Өвлийн хямдралын баннер устгагдлаа!',
            winterSaleActivated: 'Өвлийн хямдрал идэвхжлээ!',
            winterSaleDeactivated: 'Өвлийн хямдрал идэвхгүй боллоо!',
            winterSaleIsLive: 'Өвлийн хямдрал эхэллээ! Дээд зэргийн тоглоомын төхөөрөмжид гайхалтай хөнгөлөлт аваарай!',
            shopNowLink: 'Худалдан авах',

            // Messages
            productAdded: 'Бүтээгдэхүүн сагсанд нэмэгдлээ',
            productRemoved: 'Бүтээгдэхүүн сагснаас хасагдлаа',
            addedToWishlist: 'Хүслийн жагсаалтанд нэмэгдлээ',
            removedFromWishlist: 'Хүслийн жагсаалтаас хасагдлаа',
            orderPlaced: 'Захиалга амжилттай өгөгдлөө',
            loginRequired: 'Үргэлжлүүлэхийн тулд нэвтэрнэ үү',
            adminAccessRequired: 'Админ эрх шаардлагатай',

            // Misc
            filter: 'Шүүлтүүр',
            sortBy: 'Эрэмбэлэх',
            loading: 'Ачааллаж байна...',
            error: 'Алдаа',
            success: 'Амжилттай',
            warning: 'Анхааруулга',
            info: 'Мэдээлэл'
        }
    };

    return translations[language][key] || translations.en[key] || key;
}

// Translate product data from API
function translateProduct(product) {
    const settings = Storage.get('settings', { language: 'en' });
    const language = settings.language || 'en';

    if (language === 'en' || !product) {
        return product;
    }

    // Mongolian translations for product categories
    const categoryTranslations = {
        'Electronics': 'Электроник',
        'Jewelry': 'Үнэт эдлэл',
        'Jackets': 'Хүрэм',
        "Women's Clothing": 'Эмэгтэй хувцас',
        'accessories': 'Нэмэлт хэрэгсэл'
    };

    // Simple translation mapping for common product terms
    const productTranslations = {
        // Common product words
        'Wireless': 'Утасгүй',
        'Gaming': 'Тоглоомын',
        'Pro': 'Мэргэжлийн',
        'RGB': 'RGB',
        'Mechanical': 'Механик',
        'Optical': 'Оптик',
        'Mouse': 'Хулгана',
        'Keyboard': 'Гар',
        'Headset': 'Чихэвч',
        'Mousepad': 'Хулганы дэвсгэр',
        'Premium': 'Дээд зэрэг',
        'Professional': 'Мэргэжлийн',
        'Edition': 'Хувилбар',
        'Black': 'Хар',
        'White': 'Цагаан',
        'Red': 'Улаан',
        'Blue': 'Цэнхэр',
        'Green': 'Ногоон',
        'Gold': 'Алтан',
        'Silver': 'Мөнгөн',
        'Ring': 'Бөгж',
        'Bracelet': 'Бугуйвч',
        'Necklace': 'Зүүлт',
        'Shirt': 'Цамц',
        'Jacket': 'Хүрэм',
        'Backpack': 'Үүргэвч',
        'Slim': 'Нарийн',
        'Fit': 'Тохирох',
        'Cotton': 'Хөвөн',
        'Solid': 'Хатуу',
        'Casual': 'Энгийн',
        'Sleeve': 'Ханцуй',
        'Biker': 'Дугуйчин',
        'Removable': 'Салгах боломжтой',
        'Lock': 'Цоож',
        'and': 'ба',
        'Key': 'Түлхүүр',
        'Pierced': 'Цоолсон',
        'Earrings': 'Ээмэг',
        'Set': 'Багц',
        'Plated': 'Бүрсэн',
        'Classic': 'Сонгодог',
        'Dragon': 'Луу',
        'Station': 'Станц',
        'Chain': 'Гинж',
        'Petite': 'Жижиг',
        'Micropave': 'Микропав',
        'Rain': 'Бороо',
        'Short': 'Богино',
        'Opna': 'Нээлттэй',
        'Moto': 'Мото',
        'Hooded': 'Юүдэнтэй',
        'Faux': 'Хиймэл',
        'Leather': 'Арьс',
        'Fjallraven': 'Фьяллравен',
        'Foldsack': 'Нугалах',
        'No': 'Үгүй'
    };

    // Translate title
    let translatedTitle = product.title;
    Object.keys(productTranslations).forEach(key => {
        const regex = new RegExp(key, 'gi');
        translatedTitle = translatedTitle.replace(regex, productTranslations[key]);
    });

    // Translate description (basic translation)
    let translatedDescription = product.description;
    const descriptionTranslations = {
        'Your perfect pack for everyday use and walks in the forest': 'Өдөр тутмын хэрэглээ болон ойд алхахад тохиромжтой цүнх',
        'Slim-fitting style': 'Нарийн загварын хэв маяг',
        'comfortable': 'тухтай',
        'lightweight': 'хөнгөн',
        'durable': 'бат бөх',
        'water-resistant': 'ус нэвтрүүлдэггүй',
        'perfect': 'төгс',
        'great': 'гайхалтай',
        'classic': 'сонгодог',
        'stylish': 'загварлаг',
        'quality': 'чанар',
        'design': 'загвар',
        'material': 'материал',
        'fabric': 'даавуу',
        'color': 'өнгө',
        'size': 'хэмжээ',
        'fit': 'тохирох',
        'for': 'зориулсан',
        'with': 'бүхий',
        'and': 'ба',
        'the': '',
        'a': '',
        'is': '',
        'to': '',
        'in': '',
        'on': ''
    };

    Object.keys(descriptionTranslations).forEach(key => {
        const regex = new RegExp(key, 'gi');
        translatedDescription = translatedDescription.replace(regex, descriptionTranslations[key]);
    });

    return {
        ...product,
        title: translatedTitle,
        description: translatedDescription,
        category: categoryTranslations[product.category] || product.category
    };
}

// Apply translations to all elements with data-i18n attribute
function applyTranslations() {
    const settings = Storage.get('settings', { language: 'en' });
    const language = settings.language || 'en';

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translatedText = translate(key);

        // Update text content or placeholder based on element type
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.placeholder) {
                element.placeholder = translatedText;
            }
        } else {
            element.textContent = translatedText;
        }
    });

    // Update all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = translate(key);
    });

    // Update all elements with data-i18n-title attribute
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = translate(key);
    });

    // Update document title
    const titleKey = document.documentElement.getAttribute('data-i18n-title');
    if (titleKey) {
        document.title = translate(titleKey);
    }
}

// Export functions for use in other files
window.Utils = {
    Storage,
    generateId,
    formatDate,
    formatPrice,
    isValidEmail,
    isValidPassword,
    showToast,
    debounce,
    truncateText,
    calculateAverageRating,
    renderStars,
    initializeDefaultData,
    translate,
    translateProduct,
    applyTranslations
};
