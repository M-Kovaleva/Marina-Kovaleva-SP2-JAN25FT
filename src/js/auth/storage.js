/* Auth storage utilities - handles token and user data in localStorage */

// Storage keys
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Get access token from storage
 * @returns {string|null} access token or null
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Save access token to storage
 * @param {string} token - access token
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove access token from storage
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Get user data from storage
 * @returns {Object|null} User object or null
 */
export function getUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * Save user data to storage
 * @param {Object} user - User object { name, email, avatar, banner, credits }
 */
export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Remove user data from storage
 */
export function removeUser() {
  localStorage.removeItem(USER_KEY);
}

/**
 * Update specific user fields in storage
 * @param {Object} updates - fields to update
 */
export function updateUser(updates) {
  const user = getUser();
  if (user) {
    setUser({ ...user, ...updates });
  }
}

/**
 * Save auth data after login
 *
 * @param {string} token - access token
 * @param {Object} user  - user object from login/register response
 */
export function saveAuth(token, user) {
  setToken(token);
  // remove accessToken if still present in the user payload
  const { accessToken, ...cleanUser } = user;
  setUser(cleanUser);
}

//Clear all auth data - logout
export function clearAuth() {
  removeToken();
  removeUser();
}

/**
 * Check if user is logged in
 * @returns {boolean} - true if token exists
 */
export function isLoggedIn() {
  return !!getToken();
}

/**
 * Get current user's name
 * @returns {string|null} - username or null
 */
export function getUserName() {
  const user = getUser();
  return user?.name || null;
}

/**
 * Get current user's credits
 * @returns {number} - Credits or 0
 */
export function getUserCredits() {
  const user = getUser();
  return user?.credits || 0;
}