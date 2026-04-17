/**
 * BidNoroff — Main entry point
 */

import { router, navigateTo } from './router/router.js';
import { initMobileMenu, closeMobileMenu } from './utils/mobile-menu.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize mobile menu
  initMobileMenu();

  // Handle clicks on [data-link] elements
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]');

    if (link) {
      e.preventDefault();
      // Close mobile menu when navigating
      closeMobileMenu();
      navigateTo(link.href);
    }
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', router);

  // Initial route
  router();
});