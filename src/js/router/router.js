/* BidNoroff SPA router - client-side routing */
import { HomeView } from '../views/HomeView.js';
import { LoginView } from '../views/LoginView.js';
import { RegisterView } from '../views/RegisterView.js';
import { ListingView } from '../views/ListingView.js';
import { ProfileView } from '../views/ProfileView.js';
import { CreateListingView } from '../views/CreateListingView.js';
import { NotFoundView } from '../views/NotFoundView.js';
import { isLoggedIn, getUser } from '../auth/storage.js';

//Routes
const routes = [
  { path: '/',                  view: HomeView,           title: 'Explore Listings' },
  { path: '/login',             view: LoginView,          title: 'Login' },
  { path: '/register',          view: RegisterView,       title: 'Register' },
  { path: '/listing/create',    view: CreateListingView,  title: 'Create Listing' },
  { path: '/listing/:id',       view: ListingView,        title: 'Listing' },
  { path: '/listing/:id/edit',  view: CreateListingView,  title: 'Edit Listing' },
  { path: '/profile',           view: ProfileView,        title: 'My Profile' },
  { path: '/profile/:name',     view: ProfileView,        title: 'Profile' },
];

// Routes that require authentication
const PROTECTED = [
  '/profile',
  '/profile/:name',
  '/listing/create',
  '/listing/:id/edit',
];

// Define route patterns and their corresponding views
function pathToRegex(path) {
  return new RegExp(
    '^' + path.replace(/\//g, '\\/').replace(/:\w+/g, '([^/]+)') + '$'
  );
}

function getParams(match) {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g))
    .map((result) => result[1]);
  return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
}

export function navigateTo(url) {
  history.pushState(null, null, url);
  router();
}

export async function router() {
  // Test each route for potential match
  const potentialMatches = routes.map((route) => ({
    route,
    result: location.pathname.match(pathToRegex(route.path)),
  }));
  // Find the first matching route
  let match = potentialMatches.find((m) => m.result !== null);

  // If no match found, show 404 page
  if (!match) {
    match = {
      route: { path: '/404', view: NotFoundView, title: 'Page Not Found' },
      result: [location.pathname],
    };
  }

  // Authorization checking
  if (PROTECTED.includes(match.route.path) && !isLoggedIn()) {
    navigateTo('/login');
    return;
  }

  // Handling for /profile
  if (match.route.path === '/profile') {
    const me = getUser();
    if (me?.name) {
      navigateTo(`/profile/${me.name}`);
      return;
    }
    navigateTo('/login');
    return;
  }

  // Extract params if the route has any
  const params = getParams(match);

  // Render
  const view = new match.route.view(params);
  document.title = `${match.route.title} | BidNoroff`;

  const app = document.getElementById('app');
  app.innerHTML = await view.render();

  if (view.init) {
    await view.init();
  }

  window.scrollTo(0, 0);
}