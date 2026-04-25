/**
 * User Sync
 * 
 * The /auth/login and /auth/register responses don't include `credits`.
 * To get the full picture (credits, _count) we need a separate call to
 * /auction/profiles/:name. This helper does that and merges the result
 * into local storage so the navbar and any view reading from storage
 * have a single source of truth.
 *
 * Call it:
 *   - after successful login
 *   - after successful register (auto-login)
 *   - on ProfileView load if it's the user's own profile
 *   - after a successful bid (credits change server-side)
 */

import { getProfile } from '../api/apiClient.js';
import { updateUser } from './storage.js';

/**
 * Fetch the authenticated user's profile and merge into local storage.
 *
 * @param {string} name - Profile name (username)
 * @returns {Promise<Object>} The fetched profile object
 * @throws Re-throws API errors. Callers should decide how to handle.
 */
export async function syncUserFromProfile(name) {
  const response = await getProfile(name);
  const profile  = response.data;

  updateUser({
    credits: profile.credits,
    bio:     profile.bio,
    avatar:  profile.avatar,
    banner:  profile.banner,
  });

  return profile;
}