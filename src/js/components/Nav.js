/* Navigation component - handles auth state display in the navbar */

import { isLoggedIn, getUser, clearAuth } from '../auth/storage.js';
import { navigateTo } from '../router/router.js';

//Initialize navigation - call once on app start
export function initNav() {
  updateNavAuth();
}

// Sync navbar UI with the current auth state, safe to call multiple times (after placing a bid to refresh credits)
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
    // Logged-in state 
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

    initLogoutHandler();
  } else {
    // Logged-out state

    profileLink?.classList.add('hidden');

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

// Update only the credits display (called after bid placed / profile sync)
export function updateCredits(credits) {
  const creditsAmount       = document.getElementById('credits-amount');
  const creditsAmountMobile = document.getElementById('credits-amount-mobile');
  if (creditsAmount)       creditsAmount.textContent       = credits;
  if (creditsAmountMobile) creditsAmountMobile.textContent = credits;
}

// Logout
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