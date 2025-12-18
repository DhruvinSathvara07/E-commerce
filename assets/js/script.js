'use strict';

/**
 * localStorage Helper Functions
 */

/**
 * Get item from localStorage
 * @param {string} key - The key to retrieve
 * @returns {any|null} - The parsed value or null if not found
 */
function getItem(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${error}`);
    return null;
  }
}

/**
 * Set item in localStorage
 * @param {string} key - The key to store
 * @param {any} value - The value to store (will be stringified)
 */
function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in localStorage: ${error}`);
  }
}

/**
 * Load products from API and store in localStorage
 */
function loadProducts() {
  fetch(CONFIG.API.URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      setItem('apiProducts', data);
      console.log('Products loaded and stored in localStorage');
    })
    .catch(error => {
      console.error('Error loading products:', error);
    });
}

// Load products on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    loadProducts();
    // Initialize authentication system
    initAuth();
  });
} else {
  loadProducts();
  // Initialize authentication system
  initAuth();
}

// modal variables
const modal = document.querySelector('[data-modal]');
const modalCloseBtn = document.querySelector('[data-modal-close]');
const modalCloseOverlay = document.querySelector('[data-modal-overlay]');

// modal function
const modalCloseFunc = function () { modal.classList.add('closed') }

// modal eventListener
modalCloseOverlay.addEventListener('click', modalCloseFunc);
modalCloseBtn.addEventListener('click', modalCloseFunc);





// notification toast variables
const notificationToast = document.querySelector('[data-toast]');
const toastCloseBtn = document.querySelector('[data-toast-close]');

// notification toast eventListener
toastCloseBtn.addEventListener('click', function () {
  notificationToast.classList.add('closed');
});





// mobile menu variables
const mobileMenuOpenBtn = document.querySelectorAll('[data-mobile-menu-open-btn]');
const mobileMenu = document.querySelectorAll('[data-mobile-menu]');
const mobileMenuCloseBtn = document.querySelectorAll('[data-mobile-menu-close-btn]');
const overlay = document.querySelector('[data-overlay]');

for (let i = 0; i < mobileMenuOpenBtn.length; i++) {

  // mobile menu function
  const mobileMenuCloseFunc = function () {
    mobileMenu[i].classList.remove('active');
    overlay.classList.remove('active');
  }

  mobileMenuOpenBtn[i].addEventListener('click', function () {
    mobileMenu[i].classList.add('active');
    overlay.classList.add('active');
  });

  mobileMenuCloseBtn[i].addEventListener('click', mobileMenuCloseFunc);
  overlay.addEventListener('click', mobileMenuCloseFunc);

}





// accordion variables
const accordionBtn = document.querySelectorAll('[data-accordion-btn]');
const accordion = document.querySelectorAll('[data-accordion]');

for (let i = 0; i < accordionBtn.length; i++) {

  accordionBtn[i].addEventListener('click', function () {

    const clickedBtn = this.nextElementSibling.classList.contains('active');

    for (let i = 0; i < accordion.length; i++) {

      if (clickedBtn) break;

      if (accordion[i].classList.contains('active')) {

        accordion[i].classList.remove('active');
        accordionBtn[i].classList.remove('active');

      }

    }

    this.nextElementSibling.classList.toggle('active');
    this.classList.toggle('active');

  });

}
