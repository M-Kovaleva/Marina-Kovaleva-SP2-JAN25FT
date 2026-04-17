/**
 * BidNoroff API Client
 * Noroff Auction House API v2
 *
 * @see https://docs.noroff.dev/docs/v2/auction-house/listings
 */

import { getToken } from '../auth/storage.js';

// ============================================
// CONSTANTS (from Vite env variables)
// ============================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://v2.api.noroff.dev';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Endpoint paths
const AUTH = '/auth';
const AUCTION = '/auction';
const LISTINGS = `${AUCTION}/listings`;
const PROFILES = `${AUCTION}/profiles`;

// ============================================
// HEADERS
// ============================================

/**
 * Get headers for API requests
 * @param {boolean} includeAuth - Include Authorization header
 * @returns {Object} Headers object
 */
function getHeaders(includeAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers['X-Noroff-API-Key'] = API_KEY;
  }

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

// ============================================
// FETCH WRAPPER
// ============================================

/**
 * Universal fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options + includeAuth flag
 * @returns {Promise<Object>} API response data
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: getHeaders(options.includeAuth),
  };

  // Remove custom property before fetch
  delete config.includeAuth;

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content (for DELETE)
    if (response.status === 204) {
      return { data: null, meta: {} };
    }

    const data = await response.json();

    if (!response.ok) {
      const message =
        data.errors?.[0]?.message || data.message || 'Something went wrong';
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

// ============================================
// AUTH ENDPOINTS
// ============================================

/**
 * Register a new user
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<Object>} Created user data
 */
export async function register({ name, email, password }) {
  return apiFetch(`${AUTH}/register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} User data with accessToken
 */
export async function login({ email, password }) {
  return apiFetch(`${AUTH}/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ============================================
// LISTINGS ENDPOINTS
// ============================================

/**
 * Get all listings with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of items per page
 * @param {number} params.page - Page number
 * @param {string} params.sort - Sort field
 * @param {string} params.sortOrder - 'asc' or 'desc'
 * @param {string} params._tag - Filter by tag
 * @param {boolean} params._active - Filter active listings only
 * @param {boolean} params._seller - Include seller info
 * @param {boolean} params._bids - Include bids info
 * @returns {Promise<Object>} Listings array with meta
 */
export async function getListings(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `${LISTINGS}?${query}` : LISTINGS;
  return apiFetch(endpoint);
}

/**
 * Get single listing by ID
 * @param {string} id - Listing ID
 * @param {boolean} includeSeller - Include seller info
 * @param {boolean} includeBids - Include bids info
 * @returns {Promise<Object>} Listing data
 */
export async function getListing(id, includeSeller = true, includeBids = true) {
  const params = new URLSearchParams();
  if (includeSeller) params.append('_seller', 'true');
  if (includeBids) params.append('_bids', 'true');

  const query = params.toString();
  const endpoint = query ? `${LISTINGS}/${id}?${query}` : `${LISTINGS}/${id}`;

  return apiFetch(endpoint);
}

/**
 * Create a new listing
 * @param {Object} listingData - { title, description, tags, media, endsAt }
 * @returns {Promise<Object>} Created listing data
 */
export async function createListing(listingData) {
  return apiFetch(LISTINGS, {
    method: 'POST',
    includeAuth: true,
    body: JSON.stringify(listingData),
  });
}

/**
 * Update a listing
 * @param {string} id - Listing ID
 * @param {Object} listingData - { title, description, tags, media }
 * @returns {Promise<Object>} Updated listing data
 */
export async function updateListing(id, listingData) {
  return apiFetch(`${LISTINGS}/${id}`, {
    method: 'PUT',
    includeAuth: true,
    body: JSON.stringify(listingData),
  });
}

/**
 * Delete a listing
 * @param {string} id - Listing ID
 * @returns {Promise<Object>} Empty response
 */
export async function deleteListing(id) {
  return apiFetch(`${LISTINGS}/${id}`, {
    method: 'DELETE',
    includeAuth: true,
  });
}

/**
 * Search listings by title or description
 * @param {string} query - Search query
 * @param {Object} params - Additional query parameters
 * @returns {Promise<Object>} Search results with meta
 */
export async function searchListings(query, params = {}) {
  const searchParams = new URLSearchParams({ q: query, ...params });
  return apiFetch(`${LISTINGS}/search?${searchParams.toString()}`);
}

/**
 * Place a bid on a listing
 * @param {string} id - Listing ID
 * @param {number} amount - Bid amount in credits
 * @returns {Promise<Object>} Updated listing data
 */
export async function placeBid(id, amount) {
  return apiFetch(`${LISTINGS}/${id}/bids`, {
    method: 'POST',
    includeAuth: true,
    body: JSON.stringify({ amount }),
  });
}

// ============================================
// PROFILES ENDPOINTS
// ============================================

/**
 * Get all profiles
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Profiles array with meta
 */
export async function getProfiles(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `${PROFILES}?${query}` : PROFILES;
  return apiFetch(endpoint, { includeAuth: true });
}

/**
 * Get single profile by name
 * @param {string} name - Profile name (username)
 * @param {Object} params - Query parameters (_listings, _wins)
 * @returns {Promise<Object>} Profile data
 */
export async function getProfile(name, params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query
    ? `${PROFILES}/${name}?${query}`
    : `${PROFILES}/${name}`;
  return apiFetch(endpoint, { includeAuth: true });
}

/**
 * Update profile (bio, avatar, banner)
 * @param {string} name - Profile name
 * @param {Object} profileData - { bio, avatar: {url, alt}, banner: {url, alt} }
 * @returns {Promise<Object>} Updated profile data
 */
export async function updateProfile(name, profileData) {
  return apiFetch(`${PROFILES}/${name}`, {
    method: 'PUT',
    includeAuth: true,
    body: JSON.stringify(profileData),
  });
}

/**
 * Get all listings by a profile
 * @param {string} name - Profile name
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Listings array with meta
 */
export async function getProfileListings(name, params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query
    ? `${PROFILES}/${name}/listings?${query}`
    : `${PROFILES}/${name}/listings`;
  return apiFetch(endpoint, { includeAuth: true });
}

/**
 * Get all bids by a profile
 * @param {string} name - Profile name
 * @param {Object} params - Query parameters (_listings flag)
 * @returns {Promise<Object>} Bids array with meta
 */
export async function getProfileBids(name, params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query
    ? `${PROFILES}/${name}/bids?${query}`
    : `${PROFILES}/${name}/bids`;
  return apiFetch(endpoint, { includeAuth: true });
}

/**
 * Get all wins by a profile
 * @param {string} name - Profile name
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Listings (wins) array with meta
 */
export async function getProfileWins(name, params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query
    ? `${PROFILES}/${name}/wins?${query}`
    : `${PROFILES}/${name}/wins`;
  return apiFetch(endpoint, { includeAuth: true });
}

/**
 * Search profiles by name or bio
 * @param {string} query - Search query
 * @param {Object} params - Additional query parameters
 * @returns {Promise<Object>} Search results with meta
 */
export async function searchProfiles(query, params = {}) {
  const searchParams = new URLSearchParams({ q: query, ...params });
  return apiFetch(`${PROFILES}/search?${searchParams.toString()}`, {
    includeAuth: true,
  });
}