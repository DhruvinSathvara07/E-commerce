'use strict';

/**
 * Authentication UI Handler
 * Handles dropdown, modals, and form interactions for authentication
 */

/**
 * Initialize authentication UI
 * Sets up dropdown toggle, modal handlers, and form submissions
 */
function initAuthUI() {
  // Get elements
  const userIcon = document.querySelector('[data-user-icon]');
  const userDropdown = document.querySelector('[data-user-dropdown]');
  const signupBtn = document.querySelector('[data-auth-signup-btn]');
  const loginBtn = document.querySelector('[data-auth-login-btn]');
  const logoutBtn = document.querySelector('[data-auth-logout-btn]');
  const authModal = document.querySelector('[data-auth-modal]');
  const authModalClose = document.querySelector('[data-auth-modal-close]');
  const authModalOverlay = document.querySelector('[data-auth-modal-overlay]');
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const switchToLogin = document.querySelector('[data-switch-to-login]');
  const switchToSignup = document.querySelector('[data-switch-to-signup]');
  const signupFormDiv = document.querySelector('[data-auth-signup]');
  const loginFormDiv = document.querySelector('[data-auth-login]');

  // Toggle dropdown on user icon click
  if (userIcon && userDropdown) {
    userIcon.addEventListener('click', function(e) {
      e.stopPropagation();
      // Toggle dropdown visibility
      if (userDropdown.style.display === 'none') {
        userDropdown.style.display = 'block';
      } else {
        userDropdown.style.display = 'none';
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!userIcon.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.style.display = 'none';
      }
    });
  }

  // Open signup modal
  if (signupBtn) {
    signupBtn.addEventListener('click', function(e) {
      e.preventDefault();
      userDropdown.style.display = 'none';
      showSignupForm();
      // Remove closed class and ensure immediate display
      authModal.classList.remove('closed');
      authModal.style.display = 'flex';
      authModal.style.opacity = '1';
      authModal.style.visibility = 'visible';
      authModal.style.pointerEvents = 'all';
    });
  }

  // Open login modal
  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      userDropdown.style.display = 'none';
      showLoginForm();
      // Remove closed class and ensure immediate display
      authModal.classList.remove('closed');
      authModal.style.display = 'flex';
      authModal.style.opacity = '1';
      authModal.style.visibility = 'visible';
      authModal.style.pointerEvents = 'all';
    });
  }

  // User profile handler (logout removed from dropdown)
  const userProfileBtn = document.querySelector('[data-user-profile-btn]');
  if (userProfileBtn) {
    userProfileBtn.addEventListener('click', function(e) {
      e.preventDefault();
      userDropdown.style.display = 'none';
      // Profile modal will be handled by ui-interactions.js
    });
  }

  // Close modal handlers
  if (authModalClose) {
    authModalClose.addEventListener('click', function() {
      authModal.classList.add('closed');
      authModal.style.display = 'none';
      authModal.style.opacity = '0';
      authModal.style.visibility = 'hidden';
      authModal.style.pointerEvents = 'none';
      clearAuthMessages();
    });
  }

  if (authModalOverlay) {
    authModalOverlay.addEventListener('click', function() {
      authModal.classList.add('closed');
      authModal.style.display = 'none';
      authModal.style.opacity = '0';
      authModal.style.visibility = 'hidden';
      authModal.style.pointerEvents = 'none';
      clearAuthMessages();
    });
  }

  // Switch to login form
  if (switchToLogin) {
    switchToLogin.addEventListener('click', function(e) {
      e.preventDefault();
      showLoginForm();
    });
  }

  // Switch to signup form
  if (switchToSignup) {
    switchToSignup.addEventListener('click', function(e) {
      e.preventDefault();
      showSignupForm();
    });
  }

  // Signup form submission
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(signupForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const password = formData.get('password');

      // Validate form fields
      if (!name || !name.trim()) {
        showAuthMessage('Please enter your full name', 'error');
        return;
      }
      if (!email || !email.trim()) {
        showAuthMessage('Please enter your email address', 'error');
        return;
      }
      if (!password || !password.trim()) {
        showAuthMessage('Please enter a password', 'error');
        return;
      }

      const result = register(email, password, name);
      
      showAuthMessage(result.message, result.success ? 'success' : 'error');
      
      if (result.success) {
        // Clear form
        signupForm.reset();
        // Switch to login form after 2 seconds
        setTimeout(function() {
          showLoginForm();
          showAuthMessage('Please login with your credentials', 'success');
        }, 2000);
      }
    });
  }

  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(loginForm);
      const email = formData.get('email');
      const password = formData.get('password');

      // Validate form fields
      if (!email || !email.trim()) {
        showAuthMessage('Please enter your email address', 'error');
        return;
      }
      if (!password || !password.trim()) {
        showAuthMessage('Please enter your password', 'error');
        return;
      }

      const result = login(email, password);
      
      showAuthMessage(result.message, result.success ? 'success' : 'error');
      
      if (result.success) {
        // Clear form
        loginForm.reset();
        // Close modal after 1 second
        setTimeout(function() {
          authModal.classList.add('closed');
          clearAuthMessages();
          updateAuthDropdown();
          // Show success message
          alert('Welcome! ' + (result.user.role === 'admin' ? 'Admin access granted.' : 'Login successful.'));
        }, 1000);
      }
    });
  }

  // Update dropdown on page load
  updateAuthDropdown();
}

/**
 * Show signup form and hide login form
 */
function showSignupForm() {
  const signupFormDiv = document.querySelector('[data-auth-signup]');
  const loginFormDiv = document.querySelector('[data-auth-login]');
  
  if (signupFormDiv) signupFormDiv.style.display = 'block';
  if (loginFormDiv) loginFormDiv.style.display = 'none';
  
  clearAuthMessages();
}

/**
 * Show login form and hide signup form
 */
function showLoginForm() {
  const signupFormDiv = document.querySelector('[data-auth-signup]');
  const loginFormDiv = document.querySelector('[data-auth-login]');
  
  if (signupFormDiv) signupFormDiv.style.display = 'none';
  if (loginFormDiv) loginFormDiv.style.display = 'block';
  
  clearAuthMessages();
}

/**
 * Show authentication message
 */
function showAuthMessage(message, type) {
  const messageDivs = document.querySelectorAll('[data-auth-message]');
  messageDivs.forEach(function(div) {
    div.textContent = message;
    div.className = 'auth-message ' + (type === 'success' ? 'success' : 'error');
    div.style.display = 'block';
  });
}

/**
 * Clear authentication messages
 */
function clearAuthMessages() {
  const messageDivs = document.querySelectorAll('[data-auth-message]');
  messageDivs.forEach(function(div) {
    div.textContent = '';
    div.style.display = 'none';
  });
}

/**
 * Update dropdown based on authentication status
 */
function updateAuthDropdown() {
  const signupBtn = document.querySelector('[data-auth-signup-btn]');
  const loginBtn = document.querySelector('[data-auth-login-btn]');
  const userProfileBtn = document.querySelector('[data-user-profile-btn]');
  const isLoggedIn = isAuthenticated();

  if (isLoggedIn) {
    // User is logged in - show profile, hide signup/login
    if (signupBtn) signupBtn.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'none';
    if (userProfileBtn) userProfileBtn.style.display = 'block';
  } else {
    // User is not logged in - show signup/login, hide profile
    if (signupBtn) signupBtn.style.display = 'block';
    if (loginBtn) loginBtn.style.display = 'block';
    if (userProfileBtn) userProfileBtn.style.display = 'none';
  }
}

