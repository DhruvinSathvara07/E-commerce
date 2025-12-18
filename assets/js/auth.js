'use strict';

/**
 * Authentication System
 * Handles user registration, login, logout, and page protection
 */

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name (optional)
 * @returns {Object} - { success: boolean, message: string }
 */
function register(email, password, name = '') {
    // Validate input
    if (!email || !password) {
        return {
            success: false,
            message: 'Email and password are required'
        };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            success: false,
            message: 'Invalid email format'
        };
    }

    // Validate password length
    if (password.length < 6) {
        return {
            success: false,
            message: 'Password must be at least 6 characters'
        };
    }

    // Get existing users from localStorage
    const users = getItem('users') || [];

    // Check if user already exists
    const existingUser = users.find(user => user.email === email.toLowerCase());
    if (existingUser) {
        return {
            success: false,
            message: 'User with this email already exists'
        };
    }

    // Create new user object
    const newUser = {
        id: Date.now().toString(), // Simple ID generation
        email: email.toLowerCase(),
        password: password, // In production, this should be hashed
        name: name || email.split('@')[0],
        role: 'user', // Default role is 'user'
        createdAt: new Date().toISOString()
    };

    // Add user to array
    users.push(newUser);

    // Save to localStorage
    setItem('users', users);

    return {
        success: true,
        message: 'Registration successful! Please login.',
        user: newUser
    };
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - { success: boolean, message: string, user: Object }
 */
function login(email, password) {
    // Validate input
    if (!email || !password) {
        return {
            success: false,
            message: 'Email and password are required'
        };
    }

    // Get users from localStorage
    const users = getItem('users') || [];

    // Find user by email
    const user = users.find(u => u.email === email.toLowerCase());

    // Check if user exists
    if (!user) {
        return {
            success: false,
            message: 'User not found. Please register first.'
        };
    }

    // Check password
    if (user.password !== password) {
        return {
            success: false,
            message: 'Invalid password'
        };
    }

    // Check if email is admin email and set role to admin
    let userToLogin = { ...user };
    const adminEmails = ['admin@gmail.com'];
    if (adminEmails.includes(userToLogin.email.toLowerCase())) {
        userToLogin.role = 'admin';
        // Update user role in users array
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex].role = 'admin';
            setItem('users', users);
        }
    }

    // Save current user to localStorage
    setItem('currentUser', userToLogin);

    // Update navbar after login
    updateNavbar();

    return {
        success: true,
        message: 'Login successful!',
        user: userToLogin
    };
}

/**
 * Logout current user
 * Clears currentUser from localStorage and updates navbar
 */
function logout() {
    setItem('currentUser', null);
    // Update navbar after logout
    updateNavbar();
    return {
        success: true,
        message: 'Logged out successfully'
    };
}

/**
 * Get current logged-in user
 * @returns {Object|null} - Current user object or null
 */
function getCurrentUser() {
    return getItem('currentUser');
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is logged in
 */
function isAuthenticated() {
    const currentUser = getCurrentUser();
    return currentUser !== null && currentUser !== undefined;
}

/**
 * Check if current user is admin
 * @returns {boolean} - True if user is admin
 */
function isAdmin() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.role === 'admin';
}

/**
 * Protect page - redirects or shows message if user is not authenticated
 * @param {string} pageName - Name of the page (e.g., 'checkout', 'order')
 * @returns {boolean} - True if user is authenticated, false otherwise
 */
function protectPage(pageName = 'this page') {
    if (!isAuthenticated()) {
        // Show alert (in production, you might want to redirect to login page)
        alert(`You must be logged in to access ${pageName}. Please login or register first.`);
        // Optionally redirect to home or login
        // window.location.href = 'index.html';
        return false;
    }
    return true;
}

/**
 * Initialize admin users
 * Creates default admin account if it doesn't exist
 */
function initAdminUsers() {
    const users = getItem('users') || [];

    // Admin email and password
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin';

    // Check if admin user exists
    const existingUser = users.find(user => user.email === adminEmail.toLowerCase());
    if (!existingUser) {
        // Create admin user
        const adminUser = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            email: adminEmail.toLowerCase(),
            password: adminPassword,
            name: 'Admin',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        users.push(adminUser);
        // Save updated users
        setItem('users', users);
    } else {
        // Update existing user to admin role and password
        const userIndex = users.findIndex(user => user.email === adminEmail.toLowerCase());
        if (userIndex !== -1) {
            users[userIndex].role = 'admin';
            users[userIndex].password = adminPassword; // Update password
            setItem('users', users);
        }
    }
}

/**
 * Initialize authentication on page load
 * Checks authentication status and protects pages if needed
 */
function initAuth() {
    // Initialize admin users first
    initAdminUsers();

    // Check if we're on a protected page
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    // List of protected pages (checkout and order pages)
    const protectedPages = ['checkout.html', 'order.html'];

    // Check if current page needs protection
    if (protectedPages.includes(currentPage)) {
        protectPage(currentPage.replace('.html', ''));
    }

    // Update UI based on authentication status (if needed)
    updateAuthUI();

    // Initialize authentication UI (dropdown, modals, forms)
    if (typeof initAuthUI === 'function') {
        initAuthUI();
    }
}

/**
 * Update navbar visibility based on authentication status and user role
 * Shows/hides elements based on login state and role (user/admin)
 */
function updateNavbar() {
    const currentUser = getCurrentUser();
    const isLoggedIn = isAuthenticated();
    const userIsAdmin = isAdmin();

    // Get navbar elements
    const loginBtn = document.querySelector('[data-nav-login]');
    const wishlistBtn = document.querySelector('[data-nav-wishlist]');
    const cartBtn = document.querySelector('[data-nav-cart]');
    const settingsBtn = document.querySelector('[data-nav-settings]');
    const logoutBtn = document.querySelector('[data-nav-logout]');
    const ordersMenu = document.querySelector('[data-nav-orders]');
    const adminDashboardMenu = document.querySelector('[data-nav-admin-dashboard]');
    const addProductMenu = document.querySelector('[data-nav-add-product]');
    const manageOrdersMenu = document.querySelector('[data-nav-manage-orders]');

    // Update auth dropdown if function exists
    if (typeof updateAuthDropdown === 'function') {
        updateAuthDropdown();
    }

    if (!isLoggedIn) {
        // Not logged in: Show Login, hide everything else
        if (loginBtn) loginBtn.style.display = '';
        if (wishlistBtn) wishlistBtn.style.display = 'none';
        if (cartBtn) cartBtn.style.display = 'none';
        if (settingsBtn) settingsBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (ordersMenu) ordersMenu.style.display = 'none';
        if (adminDashboardMenu) adminDashboardMenu.style.display = 'none';
        if (addProductMenu) addProductMenu.style.display = 'none';
        if (manageOrdersMenu) manageOrdersMenu.style.display = 'none';
    } else if (userIsAdmin) {
        // Logged in as Admin: Show Admin menu items
        if (loginBtn) loginBtn.style.display = 'none';
        if (wishlistBtn) wishlistBtn.style.display = 'none';
        if (cartBtn) cartBtn.style.display = 'none';
        if (settingsBtn) settingsBtn.style.display = '';
        if (logoutBtn) logoutBtn.style.display = '';
        if (ordersMenu) ordersMenu.style.display = 'none';
        if (adminDashboardMenu) adminDashboardMenu.style.display = '';
        if (addProductMenu) addProductMenu.style.display = '';
        if (manageOrdersMenu) manageOrdersMenu.style.display = '';
    } else {
        // Logged in as User: Show user menu items
        if (loginBtn) loginBtn.style.display = 'none';
        if (wishlistBtn) wishlistBtn.style.display = '';
        if (cartBtn) cartBtn.style.display = '';
        if (settingsBtn) settingsBtn.style.display = '';
        if (logoutBtn) logoutBtn.style.display = '';
        if (ordersMenu) ordersMenu.style.display = '';
        if (adminDashboardMenu) adminDashboardMenu.style.display = 'none';
        if (addProductMenu) addProductMenu.style.display = 'none';
        if (manageOrdersMenu) manageOrdersMenu.style.display = 'none';
    }
}

/**
 * Update UI elements based on authentication status
 * This can be extended to show/hide login/logout buttons
 */
function updateAuthUI() {
    const currentUser = getCurrentUser();

    // Update navbar based on authentication status
    updateNavbar();

    // Log authentication status
    if (currentUser) {
        console.log('User is logged in:', currentUser.email, 'Role:', currentUser.role);
    } else {
        console.log('No user logged in');
    }
}

