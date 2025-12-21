/* ==========================================
   AUTH.JS - Authentication & Authorization
   ========================================== */

const Auth = {
    // Admin credentials (hardcoded)
    ADMIN_EMAIL: 'admin@gmail.com',
    ADMIN_PASSWORD: 'Admin@123',

    // Check if user is logged in
    isLoggedIn() {
        return Utils.Storage.get('currentUser') !== null;
    },

    // Get current user
    getCurrentUser() {
        return Utils.Storage.get('currentUser');
    },

    // Check if current user is admin
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    // Register new user
    register(name, email, password) {
        // Validate inputs
        if (!name || !email || !password) {
            Utils.showToast('All fields are required', 'error');
            return false;
        }

        if (!Utils.isValidEmail(email)) {
            Utils.showToast('Invalid email address', 'error');
            return false;
        }

        if (!Utils.isValidPassword(password)) {
            Utils.showToast('Password must be at least 6 characters', 'error');
            return false;
        }

        // Check if email already exists
        const users = Utils.Storage.get('users', []);
        if (users.find(u => u.email === email)) {
            Utils.showToast('Email already registered', 'error');
            return false;
        }

        // Create new user
        const newUser = {
            id: Utils.generateId('user'),
            name,
            email,
            password, // In production, this should be hashed
            role: 'user',
            createdAt: new Date().toISOString()
        };

        // Save user
        users.push(newUser);
        Utils.Storage.set('users', users);

        // Auto-login
        this.setCurrentUser({
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
        });

        Utils.showToast('Registration successful!', 'success');
        this.hideModals();
        this.updateUI();

        // Navigate to home
        if (window.App) {
            window.App.navigate('/');
        }

        return true;
    },

    // Login user
    login(email, password) {
        // Validate inputs
        if (!email || !password) {
            Utils.showToast('Email and password are required', 'error');
            return false;
        }

        // Check admin credentials
        if (email === this.ADMIN_EMAIL && password === this.ADMIN_PASSWORD) {
            this.setCurrentUser({
                id: 'admin',
                email: this.ADMIN_EMAIL,
                name: 'Administrator',
                role: 'admin'
            });

            Utils.showToast('Welcome, Admin!', 'success');
            this.hideModals();
            this.updateUI();

            // Navigate to admin dashboard
            if (window.App) {
                window.App.navigate('/admin');
            }

            return true;
        }

        // Check regular user credentials
        const users = Utils.Storage.get('users', []);
        const user = users.find(u => u.email === email);

        // Check if user exists
        if (!user) {
            Utils.showToast('User not found', 'error');
            return false;
        }

        // Check password
        if (user.password !== password) {
            Utils.showToast('Wrong password', 'error');
            return false;
        }

        // Set current user
        this.setCurrentUser({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        });

        Utils.showToast(`Welcome back, ${user.name}!`, 'success');
        this.hideModals();
        this.updateUI();

        // Navigate to home
        if (window.App) {
            window.App.navigate('/');
        }

        return true;
    },

    // Logout user
    logout() {
        Utils.Storage.remove('currentUser');
        Utils.showToast('Logged out successfully', 'success');
        this.updateUI();

        // Navigate to home
        if (window.App) {
            window.App.navigate('/');
        }
    },

    // Set current user
    setCurrentUser(user) {
        Utils.Storage.set('currentUser', user);
    },

    // Update UI based on auth state
    updateUI() {
        const isLoggedIn = this.isLoggedIn();
        const isAdmin = this.isAdmin();

        // Update visibility of elements
        document.querySelectorAll('.guest-only').forEach(el => {
            el.style.display = isLoggedIn ? 'none' : '';
        });

        document.querySelectorAll('.user-only').forEach(el => {
            el.style.display = isLoggedIn ? '' : 'none';
        });

        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = isAdmin ? '' : 'none';
        });

        // Update badges
        this.updateBadges();
    },

    // Update cart and wishlist badges
    updateBadges() {
        const user = this.getCurrentUser();
        if (!user) {
            document.getElementById('cartBadge').textContent = '0';
            document.getElementById('wishlistBadge').textContent = '0';
            return;
        }

        // Update cart badge
        const cart = Utils.Storage.get('cart', {});
        const userCart = cart[user.id] || [];
        const cartCount = userCart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartBadge').textContent = cartCount;

        // Update wishlist badge
        const wishlist = Utils.Storage.get('wishlist', {});
        const userWishlist = wishlist[user.id] || [];
        document.getElementById('wishlistBadge').textContent = userWishlist.length;
    },

    // Show login modal
    showLoginModal() {
        document.getElementById('loginModal').classList.add('active');
    },

    // Show register modal
    showRegisterModal() {
        document.getElementById('registerModal').classList.add('active');
    },

    // Hide all modals
    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    },

    // Check if user can access route
    canAccessRoute(route) {
        // Public routes
        const publicRoutes = ['/', '/products', '/categories', '/sale', '/brands'];
        if (publicRoutes.includes(route)) {
            return true;
        }

        // User-only routes
        const userRoutes = ['/cart', '/checkout', '/orders', '/wishlist', '/settings'];
        if (userRoutes.includes(route)) {
            return this.isLoggedIn();
        }

        // Admin-only routes
        const adminRoutes = ['/admin', '/winter-sale'];
        if (adminRoutes.includes(route)) {
            return this.isAdmin();
        }

        return true;
    },

    // Require login (show modal if not logged in)
    requireLogin(callback) {
        if (!this.isLoggedIn()) {
            this.showLoginModal();
            return false;
        }
        if (callback) callback();
        return true;
    },

    // Toggle password visibility
    togglePassword(inputId, iconElement) {
        const input = document.getElementById(inputId);
        const icon = iconElement;

        if (input.type === 'password') {
            input.type = 'text';
            icon.innerHTML = '<i class="far fa-eye-slash"></i>';
        } else {
            input.type = 'password';
            icon.innerHTML = '<i class="far fa-eye"></i>';
        }
    },

    // Setup password toggles
    setupPasswordToggles() {
        const passwordFields = [
            { inputId: 'loginPassword', toggleId: 'toggleLoginPassword' },
            { inputId: 'registerPassword', toggleId: 'toggleRegisterPassword' }
        ];

        passwordFields.forEach(field => {
            const toggleBtn = document.getElementById(field.toggleId);
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    this.togglePassword(field.inputId, toggleBtn);
                });
            }
        });
    }
};

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            Auth.login(email, password);
        });
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            Auth.register(name, email, password);
        });
    }

    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            Auth.showLoginModal();
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Auth.logout();
        });
    }

    // Modal close buttons
    document.getElementById('closeLoginModal')?.addEventListener('click', () => {
        Auth.hideModals();
    });

    document.getElementById('closeRegisterModal')?.addEventListener('click', () => {
        Auth.hideModals();
    });

    // Switch between login and register
    document.getElementById('showRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.hideModals();
        Auth.showRegisterModal();
    });

    document.getElementById('showLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.hideModals();
        Auth.showLoginModal();
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                Auth.hideModals();
            }
        });
    });

    // Update UI on load
    Auth.updateUI();

    // Setup password toggles
    Auth.setupPasswordToggles();
});

// Export Auth
window.Auth = Auth;
