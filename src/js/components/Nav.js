/**
 * Navigation Component
 * Handles auth state display in the navbar.
 */

import { isLoggedIn, getUser, clearAuth } from '../auth/storage.js';
import { navigateTo } from '../router/router.js';

/**
 * Initialize navigation.
 * Call once on app start — wires mobile menu and sets the initial auth state.
 */
export function initNav() {
  updateNavAuth();
  // Note: initLogoutHandler() is NOT called here separately.
  // updateNavAuth() calls it in the logged-in branch, which is the only
  // time there is a logout button to wire up.
}

/**
 * Sync navbar UI with the current auth state.
 * Safe to call multiple times (e.g. after placing a bid to refresh credits).
 */
export function updateNavAuth() {
  const user     = getUser();
  const loggedIn = isLoggedIn();

  // Desktop elements
  const authLink      = document.getElementById('auth-link');
  const creditsBadge  = document.getElementById('credits-badge');
  const creditsAmount = document.getElementById('credits-amount');
  const profileLink   = document.getElementById('profile-link');

  // Mobile elements
  const authLinkMobile      = document.getElementById('auth-link-mobile');
  const creditsBadgeMobile  = document.getElementById('credits-badge-mobile');
  const creditsAmountMobile = document.getElementById('credits-amount-mobile');
  const profileLinkMobile   = document.getElementById('profile-link-mobile');

  // "New Listing" buttons — stable IDs, same href in both states
  const createBtns = [
    document.getElementById('new-listing-btn'),
    document.getElementById('new-listing-btn-mobile'),
  ].filter(Boolean);

  if (loggedIn && user) {
    // ── Logged-in state ──────────────────────────────

    profileLink?.classList.remove('hidden');

    if (authLink) {
      authLink.textContent = 'Logout';
      authLink.href = '#';
      authLink.id = 'logout-link';
      authLink.removeAttribute('data-link');
    }

    if (creditsBadge && creditsAmount) {
      creditsBadge.style.display = 'flex';
      creditsAmount.textContent  = user.credits ?? 0;
    }

    profileLinkMobile?.classList.remove('hidden');

    if (authLinkMobile) {
      authLinkMobile.textContent = 'Logout';
      authLinkMobile.href = '#';
      authLinkMobile.id = 'logout-link-mobile';
      authLinkMobile.removeAttribute('data-link');
    }

    if (creditsBadgeMobile && creditsAmountMobile) {
      creditsBadgeMobile.style.display = 'flex';
      creditsAmountMobile.textContent  = user.credits ?? 0;
    }

    createBtns.forEach((btn) => { btn.href = '/listing/create'; });

    // Wire logout handlers now that the elements have their logout IDs.
    // initLogoutHandler uses removeEventListener + addEventListener so
    // calling it multiple times (on each updateNavAuth) never duplicates
    // the handler — there is always exactly one click listener.
    initLogoutHandler();
  } else {
    // ── Logged-out state ─────────────────────────────

    profileLink?.classList.add('hidden');

    // The element may currently have id="logout-link" (user just logged out)
    // or id="auth-link" (fresh page load). Handle both.
    const link = authLink ?? document.getElementById('logout-link');
    if (link) {
      link.textContent = 'Login';
      link.href = '/login';
      link.id = 'auth-link';
      link.setAttribute('data-link', '');
    }

    if (creditsBadge) creditsBadge.style.display = 'none';

    profileLinkMobile?.classList.add('hidden');

    const linkMobile =
      authLinkMobile ?? document.getElementById('logout-link-mobile');
    if (linkMobile) {
      linkMobile.textContent = 'Login';
      linkMobile.href = '/login';
      linkMobile.id = 'auth-link-mobile';
      linkMobile.setAttribute('data-link', '');
    }

    if (creditsBadgeMobile) creditsBadgeMobile.style.display = 'none';

    createBtns.forEach((btn) => { btn.href = '/listing/create'; });
  }
}

/**
 * Update only the credits display (called after bid placed / profile sync).
 */
export function updateCredits(credits) {
  const creditsAmount       = document.getElementById('credits-amount');
  const creditsAmountMobile = document.getElementById('credits-amount-mobile');
  if (creditsAmount)       creditsAmount.textContent       = credits;
  if (creditsAmountMobile) creditsAmountMobile.textContent = credits;
}

// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────

/**
 * Attach the logout click handler.
 *
 * Uses removeEventListener before addEventListener so this function is
 * idempotent — calling it N times results in exactly one handler on each
 * element. This prevents the double-handler bug that would occur if
 * updateNavAuth() (which calls this) is invoked multiple times while
 * the user is logged in.
 */
function initLogoutHandler() {
  const logoutLink       = document.getElementById('logout-link');
  const logoutLinkMobile = document.getElementById('logout-link-mobile');

  if (logoutLink) {
    logoutLink.removeEventListener('click', handleLogout);
    logoutLink.addEventListener('click', handleLogout);
  }
  if (logoutLinkMobile) {
    logoutLinkMobile.removeEventListener('click', handleLogout);
    logoutLinkMobile.addEventListener('click', handleLogout);
  }
}

function handleLogout(e) {
  e.preventDefault();
  clearAuth();
  updateNavAuth();
  navigateTo('/');
}