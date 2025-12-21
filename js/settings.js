/* ==========================================
   SETTINGS.JS - Theme, Language, Currency
   ========================================== */

const Settings = {
    // Get current settings
    get() {
        return Utils.Storage.get('settings', {
            language: 'en',
            currency: 'USD',
            theme: 'light'
        });
    },

    // Update settings
    update(newSettings) {
        const currentSettings = this.get();
        const updatedSettings = { ...currentSettings, ...newSettings };
        Utils.Storage.set('settings', updatedSettings);
        this.apply();
        return updatedSettings;
    },

    // Apply all settings
    apply() {
        this.applyTheme();
        this.applyLanguage();
        this.applyCurrency();
    },

    // Apply theme
    applyTheme() {
        const settings = this.get();
        const theme = settings.theme || 'light';

        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    },

    // Toggle theme
    toggleTheme() {
        const settings = this.get();
        const newTheme = settings.theme === 'light' ? 'dark' : 'light';
        this.update({ theme: newTheme });
        Utils.showToast(`Switched to ${newTheme} mode`, 'success');
    },

    // Apply language
    applyLanguage() {
        // Apply translations to all static HTML elements
        if (window.Utils && window.Utils.applyTranslations) {
            window.Utils.applyTranslations();
        }

        // Re-render current page to apply translations to dynamic content
        if (window.App && window.App.currentRoute) {
            window.App.navigate(window.App.currentRoute, false);
        }
    },

    // Change language
    changeLanguage(language) {
        this.update({ language });
        Utils.showToast(`Language changed to ${language === 'en' ? 'English' : 'Mongolian'}`, 'success');
    },

    // Apply currency
    applyCurrency() {
        // Currency is applied through formatPrice function in utils
        // Re-render current page to apply currency
        if (window.App && window.App.currentRoute) {
            window.App.navigate(window.App.currentRoute, false);
        }
    },

    // Change currency
    changeCurrency(currency) {
        this.update({ currency });
        Utils.showToast(`Currency changed to ${currency}`, 'success');
    },

    // Render settings page
    renderSettingsPage() {
        const settings = this.get();

        return `
            <div class="container">
                <div class="section-header">
                    <h1 class="section-title">${Utils.translate('settings')}</h1>
                    <p class="section-subtitle">Customize your experience</p>
                </div>

                <div class="settings-container" style="max-width: 800px; margin: 0 auto;">
                    <!-- Theme Settings -->
                    <div class="settings-card" style="background: var(--color-surface); padding: var(--spacing-xl); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); margin-bottom: var(--spacing-lg);">
                        <h3 style="margin-bottom: var(--spacing-lg);"><i class="fas fa-palette"></i> Theme</h3>
                        <div style="display: flex; gap: var(--spacing-md);">
                            <button class="btn ${settings.theme === 'light' ? 'btn-primary' : 'btn-outline'}" onclick="Settings.update({ theme: 'light' })">
                                <i class="fas fa-sun"></i> Light Mode
                            </button>
                            <button class="btn ${settings.theme === 'dark' ? 'btn-primary' : 'btn-outline'}" onclick="Settings.update({ theme: 'dark' })">
                                <i class="fas fa-moon"></i> Dark Mode
                            </button>
                        </div>
                    </div>

                    <!-- Language Settings -->
                    <div class="settings-card" style="background: var(--color-surface); padding: var(--spacing-xl); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); margin-bottom: var(--spacing-lg);">
                        <h3 style="margin-bottom: var(--spacing-lg);"><i class="fas fa-language"></i> Language</h3>
                        <div style="display: flex; gap: var(--spacing-md);">
                            <button class="btn ${settings.language === 'en' ? 'btn-primary' : 'btn-outline'}" onclick="Settings.changeLanguage('en')">
                                <i class="fas fa-flag-usa"></i> English
                            </button>
                            <button class="btn ${settings.language === 'mn' ? 'btn-primary' : 'btn-outline'}" onclick="Settings.changeLanguage('mn')">
                                <i class="fas fa-globe"></i> Mongolian
                            </button>
                        </div>
                    </div>

                    <!-- Currency Settings -->
                    <div class="settings-card" style="background: var(--color-surface); padding: var(--spacing-xl); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); margin-bottom: var(--spacing-lg);">
                        <h3 style="margin-bottom: var(--spacing-lg);"><i class="fas fa-money-bill-wave"></i> Currency</h3>
                        <div style="display: flex; gap: var(--spacing-md);">
                            <button class="btn ${settings.currency === 'USD' ? 'btn-primary' : 'btn-outline'}" onclick="Settings.changeCurrency('USD')">
                                <i class="fas fa-dollar-sign"></i> USD
                            </button>
                            <button class="btn ${settings.currency === 'MNT' ? 'btn-primary' : 'btn-outline'}" onclick="Settings.changeCurrency('MNT')">
                                <i class="fas fa-coins"></i> MNT (Tugrik)
                            </button>
                        </div>
                    </div>

                    <!-- Account Settings -->
                    <div class="settings-card" style="background: var(--color-surface); padding: var(--spacing-xl); border-radius: var(--radius-xl); box-shadow: var(--shadow-md);">
                        <h3 style="margin-bottom: var(--spacing-lg);"><i class="fas fa-user-circle"></i> Account</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                            ${Auth.isLoggedIn() ? `
                                <div style="padding: var(--spacing-md); background: var(--color-bg-secondary); border-radius: var(--radius-md);">
                                    <p><strong>Email:</strong> ${Auth.getCurrentUser().email}</p>
                                    <p><strong>Role:</strong> ${Auth.getCurrentUser().role}</p>
                                </div>
                                <button class="btn btn-danger" onclick="Auth.logout()">
                                    Logout
                                </button>
                            ` : `
                                <p style="color: var(--color-text-secondary);">You are not logged in</p>
                                <button class="btn btn-primary" onclick="Auth.showLoginModal()">
                                    Login
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Initialize settings on page load
document.addEventListener('DOMContentLoaded', () => {
    Settings.apply();

    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            Settings.toggleTheme();
        });
    }
});

// Export Settings
window.Settings = Settings;
