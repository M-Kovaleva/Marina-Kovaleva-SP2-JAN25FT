/**
 * BidNoroff — SPA Router
 * Handles client-side routing without page reloads
 */

// Import views (will create next)
import { HomeView } from '../views/HomeView.js';
import { LoginView } from '../views/LoginView.js';
import { RegisterView } from '../views/RegisterView.js';
import { ListingView } from '../views/ListingView.js';
import { ProfileView } from '../views/ProfileView.js';
import { CreateListingView } from '../views/CreateListingView.js';
import { NotFoundView } from '../views/NotFoundView.js';

/**
 * Route definitions
 */
const routes = [
  { path: '/', view: HomeView, title: 'Explore Listings' },
  { path: '/login', view: LoginView, title: 'Login' },
  { path: '/register', view: RegisterView, title: 'Register' },
  { path: '/listing/create', view: CreateListingView, title: 'Create Listing' },
  { path: '/listing/:id', view: ListingView, title: 'Listing' },
  { path: '/listing/:id/edit', view: CreateListingView, title: 'Edit Listing' },
  { path: '/profile', view: ProfileView, title: 'My Profile' },
  { path: '/profile/:name', view: ProfileView, title: 'Profile' },
];

/**
 * Convert route path to regex
 * /listing/:id → /listing/([^/]+)
 */
function pathToRegex(path) {
  return new RegExp(
    '^' + path.replace(/\//g, '\\/').replace(/:\w+/g, '([^/]+)') + '$'
  );
}

/**
 * Extract params from URL
 */
function getParams(match) {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
    (result) => result[1]
  );
  return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
}

/**
 * Navigate to URL
 */
export function navigateTo(url) {
  history.pushState(null, null, url);
  router();
}

/**
 * Main router function
 */
export async function router() {
  // Find matching route
  const potentialMatches = routes.map((route) => ({
    route,
    result: location.pathname.match(pathToRegex(route.path)),
  }));

  let match = potentialMatches.find((m) => m.result !== null);

  // 404 if no match
  if (!match) {
    match = {
      route: { path: '/404', view: NotFoundView, title: 'Page Not Found' },
      result: [location.pathname],
    };
  }

  // Get params
  const params = getParams(match);

  // Create view instance
  const view = new match.route.view(params);

  // Update page title
  document.title = `${match.route.title} | BidNoroff`;

  // Render view
  const app = document.getElementById('app');
  app.innerHTML = await view.render();

  // Initialize view
  if (view.init) {
    await view.init();
  }

  // Scroll to top
  window.scrollTo(0, 0);
}