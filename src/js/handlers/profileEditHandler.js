/**
 * Profile Edit Handler
 *
 * Owns the Edit Profile modal:
 *   - opens / closes
 *   - prefills inputs with current user data
 *   - client-side validates bio / avatar URL / banner URL
 *   - PUTs to /auction/profiles/<name>
 *   - notifies caller via onUpdate so the page header can refresh
 *
 * Modal DOM is rendered as part of ProfileView's template — this
 * handler only wires events. Must be initialized AFTER the template
 * is in the DOM.
 *
 * Listener policy:
 *   All modal listeners (backdrop, close, submit) are attached once
 *   in initProfileEdit() and live for the lifetime of the view.
 *   openEditModal() / closeEditModal() only toggle visibility.
 *   This avoids the original `{ once: true }` bug where a failed
 *   submit would silently remove the submit handler.
 */

import { updateProfile } from '../api/apiClient.js';
import { getUser, updateUser } from '../auth/storage.js';
import { showSuccessToast } from '../utils/toast.js';
import {
  validateProfileForm,
  showValidationErrors,
  clearFormErrors,
} from '../utils/validation.js';

// Same placeholder image for both avatar and banner — server rejects
// null / empty string, so we always send a valid URL when the user
// clears the field.
const PLACEHOLDER_AVATAR =
  'https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=500&w=1500';
const PLACEHOLDER_BANNER =
  'https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=500&w=1500';

// ─────────────────────────────────────────────
// Module state
// ─────────────────────────────────────────────

let profileName = null;
let onUpdateCallback = null;

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Wire up the modal. Call once, after profile content is rendered.
 *
 * @param {string} name - profile name (target of PUT request)
 * @param {Object} [options]
 * @param {Function} [options.onUpdate] - called with updated profile
 *   data after successful save; used to refresh page header UI.
 */
export function initProfileEdit(name, { onUpdate } = {}) {
  profileName = name;
  onUpdateCallback = onUpdate ?? null;

  document
    .getElementById('edit-profile-backdrop')
    ?.addEventListener('click', closeEditModal);

  document
    .getElementById('edit-profile-close')
    ?.addEventListener('click', closeEditModal);

  document
    .getElementById('edit-profile-form')
    ?.addEventListener('submit', handleSubmit);
}

/**
 * Open the modal, prefill inputs from current user data,
 * clear any stale errors.
 */
export function openEditModal() {
  const user = getUser();
  const modal = document.getElementById('edit-profile-modal');
  const form = document.getElementById('edit-profile-form');
  if (!modal || !form) return;

  document.getElementById('edit-bio').value = user?.bio ?? '';
  document.getElementById('edit-avatar').value = user?.avatar?.url ?? '';
  document.getElementById('edit-banner').value = user?.banner?.url ?? '';

  clearFormErrors(form);
  document.getElementById('edit-profile-error').classList.add('hidden');

  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
}

export function cleanupProfileEdit() {
  profileName = null;
  onUpdateCallback = null;
}

// ─────────────────────────────────────────────
// Close
// ─────────────────────────────────────────────

function closeEditModal() {
  document.getElementById('edit-profile-modal')?.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

// ─────────────────────────────────────────────
// Submit
// ─────────────────────────────────────────────

async function handleSubmit(e) {
  e.preventDefault();

  const form = document.getElementById('edit-profile-form');
  const bioInput = document.getElementById('edit-bio');
  const avatarInput = document.getElementById('edit-avatar');
  const bannerInput = document.getElementById('edit-banner');
  const submitBtn = document.getElementById('edit-profile-submit');
  const errorEl = document.getElementById('edit-profile-error');

  clearFormErrors(form);
  errorEl.classList.add('hidden');

  const data = {
    bio: bioInput.value.trim(),
    avatarUrl: avatarInput.value.trim(),
    bannerUrl: bannerInput.value.trim(),
  };

  const { isValid, errors } = validateProfileForm(data);
  if (!isValid) {
    showValidationErrors(form, errors);
    return;
  }

  // Always send all 3 fields so server can clear them.
  // Empty bio = ''. Empty avatar/banner = placeholder URL (server
  // requires a valid URL object — null and empty string both rejected).
  const payload = {
    bio: data.bio || '',
    avatar: { url: data.avatarUrl || PLACEHOLDER_AVATAR, alt: '' },
    banner: { url: data.bannerUrl || PLACEHOLDER_BANNER, alt: '' },
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving…';

  try {
    const response = await updateProfile(profileName, payload);
    const updated = response.data;

    // Sync localStorage so navbar / next page renders are correct
    updateUser({
      bio: updated.bio,
      avatar: updated.avatar,
      banner: updated.banner,
    });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Save changes';

    onUpdateCallback?.(updated);
    closeEditModal();
    showSuccessToast('Profile updated.');
  } catch (err) {
    errorEl.classList.remove('hidden');
    errorEl.querySelector('p').textContent =
      err.message || 'Could not update profile. Please try again.';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save changes';
  }
}