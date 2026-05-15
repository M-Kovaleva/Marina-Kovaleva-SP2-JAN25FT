/* BidNoroff SPA router - client-side routing */
import { HomeView } from '../views/HomeView.js';
import { LoginView } from '../views/LoginView.js';
import { RegisterView } from '../views/RegisterView.js';
import { ListingView } from '../views/ListingView.js';
import { ProfileView } from '../views/ProfileView.js';
import { CreateListingView } from '../views/CreateListingView.js';
import { NotFoundView } from '../views/NotFoundView.js';
import { showLoginRequiredModal } from '../components/LoginRequiredModal.js';
import { isLoggedIn, getUser } from '../auth/storage.js';

// Routes
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

// Routes that require authentication
const PROTECTED = ['/profile', '/profile/:name', '/listing/create', '/listing/:id/edit'];

/**
 * The currently active view instance.
 * Kept so we can call destroy() before replacing it — this stops any
 * timers (e.g. ListingView countdown) and removes scroll listeners
 * (e.g. HomeView infinity scroll) that would otherwise leak.
 */
let currentView = null;

function pathToRegex(path) {
  return new RegExp('^' + path.replace(/\//g, '\\/').replace(/:\w+/g, '([^/]+)') + '$');
}

function getParams(match) {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map((r) => r[1]);
  return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
}

export function navigateTo(url) {
  history.pushState(null, null, url);
  router();
}

export async function router() {
  const potentialMatches = routes.map((route) => ({
    route,
    result: location.pathname.match(pathToRegex(route.path)),
  }));

  let match = potentialMatches.find((m) => m.result !== null);

  if (!match) {
    match = {
      route: { path: '/404', view: NotFoundView, title: 'Page Not Found' },
      result: [location.pathname],
    };
  }

  // Auth guard — redirect guests away from protected routes.
  // No view is rendered here, so no destroy needed; the recursive
  // router() call triggered by navigateTo will handle it.
  if (PROTECTED.includes(match.route.path) && !isLoggedIn()) {
    navigateTo('/');
    showLoginRequiredModal();
    return;
  }

  // /profile → /profile/:name redirect.
  // Uses replaceState so the back button skips this intermediate step.
  if (match.route.path === '/profile') {
    const me = getUser();
    history.replaceState(null, null, me?.name ? `/profile/${me.name}` : '/login');
    return router();
  }

  const params = getParams(match);

  // Tear down the previous view before replacing the DOM.
  // This stops any active intervals (countdown) and removes window
  // event listeners (scroll → infinity scroll) that belong to it.
  currentView?.destroy?.();

  const view = new match.route.view(params);
  currentView = view;

  document.title = `${match.route.title} | BidNoroff`;

  const app = document.getElementById('app');
  app.innerHTML = await view.render();

  await view.init?.();

  window.scrollTo(0, 0);
}
