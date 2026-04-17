/**
 * Mobile Menu Utilities
 */

/**
 * Toggle menu button icons (hamburger ↔ X)
 */
function toggleMenuIcon(isOpen) {
  const iconHamburger = document.getElementById('icon-hamburger');
  const iconClose = document.getElementById('icon-close');

  if (iconHamburger && iconClose) {
    if (isOpen) {
      iconHamburger.classList.add('hidden');
      iconClose.classList.remove('hidden');
    } else {
      iconHamburger.classList.remove('hidden');
      iconClose.classList.add('hidden');
    }
  }
}

/**
 * Toggle mobile menu visibility
 */
export function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const menuBtn = document.getElementById('mobile-menu-btn');

  if (mobileMenu && menuBtn) {
    const isOpen = !mobileMenu.classList.contains('hidden');

    if (isOpen) {
      // Close menu
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('overflow-hidden');
      toggleMenuIcon(false);
    } else {
      // Open menu
      mobileMenu.classList.remove('hidden');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('overflow-hidden');
      toggleMenuIcon(true);
    }
  }
}

/**
 * Close mobile menu (used when navigating)
 */
export function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const menuBtn = document.getElementById('mobile-menu-btn');

  if (mobileMenu) {
    mobileMenu.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  if (menuBtn) {
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }

  toggleMenuIcon(false);
}

/**
 * Initialize mobile menu toggle
 */
export function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');

  if (menuBtn) {
    menuBtn.addEventListener('click', toggleMobileMenu);
  }

  // Close menu when clicking on mobile nav links
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
      if (e.target.closest('[data-link]')) {
        closeMobileMenu();
      }
    });
  }

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });
}