/* BidNoroff — main entry point */

import { router, navigateTo } from './router/router.js';
import { initMobileMenu, closeMobileMenu } from './utils/mobile-menu.js';
import { initNav } from './components/Nav.js';
import { isLoggedIn } from './auth/storage.js';
import {
  mountLoginRequiredModal,
  showLoginRequiredModal,
} from './components/LoginRequiredModal.js';

//Paths that require authentication. Match by substring so /listing/create, /profile/anyone, etc. all match
const PROTECTED_PATTERNS = ['/profile/', '/listing/create', '/edit'];

function requiresAuth(href) {
  try {
    const path = new URL(href, window.location.origin).pathname;
    return PROTECTED_PATTERNS.some((p) => path.includes(p));
  } catch {
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMobileMenu();
  mountLoginRequiredModal();

  document.body.addEventListener('click', (e) => {
    //login-required(data-action attribute)
    const trigger = e.target.closest('[data-action="login-required"]');
    if (trigger) {
      e.preventDefault();
      closeMobileMenu();
      showLoginRequiredModal();
      return;
    }

    // SPA links
    const link = e.target.closest('[data-link]');
    if (link) {
      e.preventDefault();

      // Intercept protected routes for guests
      if (!isLoggedIn() && requiresAuth(link.href)) {
        closeMobileMenu();
        showLoginRequiredModal();
        return;
      }

      closeMobileMenu();
      navigateTo(link.href);
    }
  });

  // Handle browser back/forward
  window.addEventListener('popstate', router);

  // Initial route
  router();
});
