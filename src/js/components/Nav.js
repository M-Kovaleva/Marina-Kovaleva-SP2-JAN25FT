/**
 * Navigation Component
 * Handles auth state display in navbar
 */

import { isLoggedIn, getUser, clearAuth, getUserCredits } from '../auth/storage.js';
import { navigateTo } from '../router/router.js';

/**
 * Initialize navigation
 * Call on app start
 */
export function initNav() {
  updateNavAuth();
  initLogoutHandler();
}

/**
 * Update navbar based on auth state
 */
export function updateNavAuth() {
  const user = getUser();
  const loggedIn = isLoggedIn();

  // Desktop elements
  const authLink = document.getElementById('auth-link');
  const creditsBadge = document.getElementById('credits-badge');
  const creditsAmount = document.getElementById('credits-amount');
  const profileLink = document.getElementById('profile-link');

  // Mobile elements
  const authLinkMobile = document.getElementById('auth-link-mobile');
  const creditsBadgeMobile = document.getElementById('credits-badge-mobile');
  const creditsAmountMobile = document.getElementById('credits-amount-mobile');
  const profileLinkMobile = document.getElementById('profile-link-mobile');

  if (loggedIn && user) {
    // === LOGGED IN STATE ===

    // Desktop: Show Profile link
    if (profileLink) {
      profileLink.classList.remove('hidden');
    }

    // Desktop: Show Logout link
    if (authLink) {
      authLink.textContent = 'Logout';
      authLink.href = '#';
      authLink.id = 'logout-link';
      authLink.removeAttribute('data-link');
    }

    // Desktop: Show credits badge
    if (creditsBadge && creditsAmount) {
      creditsBadge.style.display = 'flex';
      creditsAmount.textContent = user.credits ?? 0;
    }

    // Mobile: Show Profile link
    if (profileLinkMobile) {
      profileLinkMobile.classList.remove('hidden');
    }

    // Mobile: Show Logout link
    if (authLinkMobile) {
      authLinkMobile.textContent = 'Logout';
      authLinkMobile.href = '#';
      authLinkMobile.id = 'logout-link-mobile';
      authLinkMobile.removeAttribute('data-link');
    }

    // Mobile: Show credits badge
    if (creditsBadgeMobile && creditsAmountMobile) {
      creditsBadgeMobile.style.display = 'flex';
      creditsAmountMobile.textContent = user.credits ?? 0;
    }

    // Re-attach logout handlers
    initLogoutHandler();
  } else {
    // === LOGGED OUT STATE ===

    // Desktop: Hide Profile link
    if (profileLink) {
      profileLink.classList.add('hidden');
    }

    // Desktop: Show Login link
    if (authLink || document.getElementById('logout-link')) {
      const link = authLink || document.getElementById('logout-link');
      link.textContent = 'Login';
      link.href = '/login';
      link.id = 'auth-link';
      link.setAttribute('data-link', '');
    }

    // Desktop: Hide credits badge
    if (creditsBadge) {
      creditsBadge.style.display = 'none';
    }

    // Mobile: Hide Profile link
    if (profileLinkMobile) {
      profileLinkMobile.classList.add('hidden');
    }

    // Mobile: Show Login link
    if (authLinkMobile || document.getElementById('logout-link-mobile')) {
      const link = authLinkMobile || document.getElementById('logout-link-mobile');
      link.textContent = 'Login';
      link.href = '/login';
      link.id = 'auth-link-mobile';
      link.setAttribute('data-link', '');
    }

    // Mobile: Hide credits badge
    if (creditsBadgeMobile) {
      creditsBadgeMobile.style.display = 'none';
    }
  }
}

/**
 * Update credits display
 * @param {number} credits
 */
export function updateCredits(credits) {
  const creditsAmount = document.getElementById('credits-amount');
  const creditsAmountMobile = document.getElementById('credits-amount-mobile');

  if (creditsAmount) {
    creditsAmount.textContent = credits;
  }
  if (creditsAmountMobile) {
    creditsAmountMobile.textContent = credits;
  }
}

/**
 * Initialize logout handler
 */
function initLogoutHandler() {
  // Desktop logout
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', handleLogout);
  }

  // Mobile logout
  const logoutLinkMobile = document.getElementById('logout-link-mobile');
  if (logoutLinkMobile) {
    logoutLinkMobile.addEventListener('click', handleLogout);
  }
}

/**
 * Handle logout click
 * @param {Event} e
 */
function handleLogout(e) {
  e.preventDefault();

  // Clear auth data
  clearAuth();

  // Update navbar
  updateNavAuth();

  // Redirect to home
  navigateTo('/');
}