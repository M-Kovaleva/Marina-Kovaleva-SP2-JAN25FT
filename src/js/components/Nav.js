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
  const user     = getUser();
  const loggedIn = isLoggedIn();

  // Desktop elements
  const authLink    = document.getElementById('auth-link');
  const creditsBadge  = document.getElementById('credits-badge');
  const creditsAmount = document.getElementById('credits-amount');
  const profileLink   = document.getElementById('profile-link');

  // Mobile elements
  const authLinkMobile      = document.getElementById('auth-link-mobile');
  const creditsBadgeMobile  = document.getElementById('credits-badge-mobile');
  const creditsAmountMobile = document.getElementById('credits-amount-mobile');
  const profileLinkMobile   = document.getElementById('profile-link-mobile');

  // "New Listing" buttons — selected by stable ID (not href, which changes)
  const createBtns = [
    document.getElementById('new-listing-btn'),
    document.getElementById('new-listing-btn-mobile'),
  ].filter(Boolean);

  if (loggedIn && user) {
    // === LOGGED IN STATE ===

    if (profileLink) profileLink.classList.remove('hidden');

    if (authLink) {
      authLink.textContent = 'Logout';
      authLink.href = '#';
      authLink.id   = 'logout-link';
      authLink.removeAttribute('data-link');
    }

    if (creditsBadge && creditsAmount) {
      creditsBadge.style.display  = 'flex';
      creditsAmount.textContent   = user.credits ?? 0;
    }

    if (profileLinkMobile) profileLinkMobile.classList.remove('hidden');

    if (authLinkMobile) {
      authLinkMobile.textContent = 'Logout';
      authLinkMobile.href = '#';
      authLinkMobile.id   = 'logout-link-mobile';
      authLinkMobile.removeAttribute('data-link');
    }

    if (creditsBadgeMobile && creditsAmountMobile) {
      creditsBadgeMobile.style.display  = 'flex';
      creditsAmountMobile.textContent   = user.credits ?? 0;
    }

    // Logged in: restore original destination
    createBtns.forEach((btn) => { btn.href = '/listing/create'; });

    initLogoutHandler();
  } else {
    // === LOGGED OUT STATE ===

    if (profileLink) profileLink.classList.add('hidden');

    if (authLink || document.getElementById('logout-link')) {
      const link = authLink || document.getElementById('logout-link');
      link.textContent = 'Login';
      link.href = '/login';
      link.id   = 'auth-link';
      link.setAttribute('data-link', '');
    }

    if (creditsBadge) creditsBadge.style.display = 'none';

    if (profileLinkMobile) profileLinkMobile.classList.add('hidden');

    if (authLinkMobile || document.getElementById('logout-link-mobile')) {
      const link = authLinkMobile || document.getElementById('logout-link-mobile');
      link.textContent = 'Login';
      link.href = '/login';
      link.id   = 'auth-link-mobile';
      link.setAttribute('data-link', '');
    }

    if (creditsBadgeMobile) creditsBadgeMobile.style.display = 'none';

    // Guest: redirect to login on click
    createBtns.forEach((btn) => { btn.href = '/login'; });
  }
}

/**
 * Update credits display only (called after bid placed)
 * @param {number} credits
 */
export function updateCredits(credits) {
  const creditsAmount       = document.getElementById('credits-amount');
  const creditsAmountMobile = document.getElementById('credits-amount-mobile');
  if (creditsAmount)       creditsAmount.textContent       = credits;
  if (creditsAmountMobile) creditsAmountMobile.textContent = credits;
}

/**
 * Initialize logout handler
 */
function initLogoutHandler() {
  const logoutLink       = document.getElementById('logout-link');
  const logoutLinkMobile = document.getElementById('logout-link-mobile');
  if (logoutLink)       logoutLink.addEventListener('click', handleLogout);
  if (logoutLinkMobile) logoutLinkMobile.addEventListener('click', handleLogout);
}

function handleLogout(e) {
  e.preventDefault();
  clearAuth();
  updateNavAuth();
  navigateTo('/');
}