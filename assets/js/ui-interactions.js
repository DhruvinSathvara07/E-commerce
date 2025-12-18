'use strict';

/**
 * UI Interactions Handler
 * Handles dropdowns, dark mode, profile modal, and policy modals
 */

/**
 * Initialize all UI interactions
 */
function initUIInteractions() {
    initLogoutDropdown();
    initSettingsDropdown();
    initDarkMode();
    initProfileModal();
    initPolicyModals();
}

/**
 * Initialize logout dropdown
 */
function initLogoutDropdown() {
    const logoutBtn = document.querySelector('[data-nav-logout]');
    const logoutDropdown = document.querySelector('[data-logout-dropdown]');
    const logoutConfirm = document.querySelector('[data-logout-confirm]');

    if (logoutBtn && logoutDropdown) {
        // Remove any existing listeners by cloning the button
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);

        newLogoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            // Toggle dropdown
            const isShowing = logoutDropdown.classList.contains('show');
            closeAllDropdowns();
            if (!isShowing) {
                logoutDropdown.classList.add('show');
                logoutDropdown.style.display = 'block';
            }
        });

        // Close dropdown when clicking outside
        const clickHandler = function (e) {
            if (!newLogoutBtn.contains(e.target) && !logoutDropdown.contains(e.target)) {
                logoutDropdown.classList.remove('show');
                logoutDropdown.style.display = 'none';
            }
        };
        document.addEventListener('click', clickHandler);

        // Logout confirmation
        if (logoutConfirm) {
            logoutConfirm.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                logoutDropdown.classList.remove('show');
                logoutDropdown.style.display = 'none';

                // Check if logout function exists
                if (typeof logout === 'function') {
                    const result = logout();
                    if (result && result.message) {
                        alert(result.message);
                    }
                    // Reload page to update UI
                    setTimeout(function () {
                        window.location.reload();
                    }, 100);
                } else {
                    // Fallback logout
                    localStorage.removeItem('currentUser');
                    alert('Logged out successfully');
                    window.location.reload();
                }
            });
        }
    }
}

/**
 * Initialize settings dropdown
 */
function initSettingsDropdown() {
    const settingsBtn = document.querySelector('[data-nav-settings]');
    const settingsDropdown = document.querySelector('[data-settings-dropdown]');
    const themeToggle = document.querySelector('[data-theme-toggle]');
    const privacyPolicy = document.querySelector('[data-privacy-policy]');
    const returnPolicy = document.querySelector('[data-return-policy]');

    if (settingsBtn && settingsDropdown) {
        // Remove any existing listeners by cloning the button
        const newSettingsBtn = settingsBtn.cloneNode(true);
        settingsBtn.parentNode.replaceChild(newSettingsBtn, settingsBtn);

        newSettingsBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            // Toggle dropdown
            const isShowing = settingsDropdown.classList.contains('show');
            closeAllDropdowns();
            if (!isShowing) {
                settingsDropdown.classList.add('show');
                settingsDropdown.style.display = 'block';
            }
        });

        // Close dropdown when clicking outside
        const clickHandler = function (e) {
            if (!newSettingsBtn.contains(e.target) && !settingsDropdown.contains(e.target)) {
                settingsDropdown.classList.remove('show');
                settingsDropdown.style.display = 'none';
            }
        };
        document.addEventListener('click', clickHandler);

        // Theme toggle
        if (themeToggle) {
            themeToggle.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                // Add rotation animation
                const icon = themeToggle.querySelector('ion-icon');
                if (icon) {
                    icon.style.animation = 'rotateIcon 0.5s ease';
                    setTimeout(function () {
                        icon.style.animation = '';
                    }, 500);
                }
                toggleDarkMode();
                updateThemeToggleIcon();
                // Close dropdown after toggle
                setTimeout(function () {
                    settingsDropdown.classList.remove('show');
                    settingsDropdown.style.display = 'none';
                }, 300);
            });
        }

        // Privacy policy
        if (privacyPolicy) {
            privacyPolicy.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                settingsDropdown.classList.remove('show');
                settingsDropdown.style.display = 'none';
                openPolicyModal('privacy');
            });
        }

        // Return policy
        if (returnPolicy) {
            returnPolicy.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                settingsDropdown.classList.remove('show');
                settingsDropdown.style.display = 'none';
                openPolicyModal('return');
            });
        }
    }
}

/**
 * Initialize dark mode
 */
function initDarkMode() {
    // Check saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateThemeToggleIcon();
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

/**
 * Update theme toggle icon
 */
function updateThemeToggleIcon() {
    const themeToggle = document.querySelector('[data-theme-toggle]');
    if (themeToggle) {
        const icon = themeToggle.querySelector('ion-icon');
        const text = themeToggle.querySelector('span');
        const isDark = document.body.classList.contains('dark-mode');

        if (isDark) {
            // Dark mode - show sun icon
            if (icon) {
                icon.setAttribute('name', 'sunny-outline');
                icon.style.color = '#fbbf24'; // Yellow color for sun
            }
            if (text) text.textContent = 'Light Mode';
        } else {
            // Light mode - show moon icon
            if (icon) {
                icon.setAttribute('name', 'moon-outline');
                icon.style.color = '#3b82f6'; // Blue color for moon
            }
            if (text) text.textContent = 'Dark Mode';
        }
    }
}

/**
 * Initialize profile modal
 */
function initProfileModal() {
    const userProfileBtn = document.querySelector('[data-user-profile-btn]');
    const profileModal = document.querySelector('[data-profile-modal]');
    const profileClose = document.querySelector('[data-profile-close]');

    if (userProfileBtn && profileModal) {
        userProfileBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const currentUser = getCurrentUser();
            if (currentUser) {
                updateProfileModal(currentUser);
                profileModal.classList.add('show');
            }
        });
    }

    if (profileClose) {
        profileClose.addEventListener('click', function () {
            profileModal.classList.remove('show');
        });
    }

    if (profileModal) {
        profileModal.addEventListener('click', function (e) {
            if (e.target === profileModal) {
                profileModal.classList.remove('show');
            }
        });
    }
}

/**
 * Update profile modal with user data
 */
function updateProfileModal(user) {
    const avatar = document.querySelector('[data-profile-avatar]');
    const name = document.querySelector('[data-profile-name]');
    const email = document.querySelector('[data-profile-email]');

    if (avatar) {
        // Get first letter of name for avatar
        const initial = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
        avatar.textContent = initial;
    }

    if (name) {
        name.textContent = user.name || user.email.split('@')[0];
    }

    if (email) {
        email.textContent = user.email;
    }
}

/**
 * Initialize policy modals
 */
function initPolicyModals() {
    const policyModal = document.querySelector('[data-policy-modal]');
    const returnModal = document.querySelector('[data-return-modal]');

    // Privacy policy modal close handlers
    if (policyModal) {
        const closeBtn = policyModal.querySelector('[data-policy-modal-close]');
        const overlay = policyModal.querySelector('[data-policy-modal-overlay]');

        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                policyModal.classList.add('closed');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                policyModal.classList.add('closed');
            });
        }
    }

    // Return policy modal close handlers
    if (returnModal) {
        const closeBtn = returnModal.querySelector('[data-return-modal-close]');
        const overlay = returnModal.querySelector('[data-return-modal-overlay]');

        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                returnModal.classList.add('closed');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                returnModal.classList.add('closed');
            });
        }
    }
}

/**
 * Open policy modal
 */
function openPolicyModal(type) {
    if (type === 'privacy') {
        const modal = document.querySelector('[data-policy-modal]');
        if (modal) {
            modal.classList.remove('closed');
        }
    } else if (type === 'return') {
        const modal = document.querySelector('[data-return-modal]');
        if (modal) {
            modal.classList.remove('closed');
        }
    }
}

/**
 * Close all dropdowns
 */
function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.settings-dropdown, .logout-dropdown, .user-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
    });
}

// Initialize on page load - wait a bit to ensure DOM is ready
function initializeUI() {
    // Wait for auth.js to be loaded
    setTimeout(function () {
        initUIInteractions();
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI);
} else {
    initializeUI();
}


