/*  Listing form handler */

import { createListing, getListing, updateListing } from '../api/apiClient.js';
import { navigateTo } from '../router/router.js';
import { showSuccessToast } from '../utils/toast.js';
import { escHtml } from '../utils/format.js';
import { validateListingForm, showValidationErrors, clearFormErrors } from '../utils/validation.js';
import { showBlockError, hideBlockError } from '../utils/formState.js';

let listingId = null;
let isEditMode = false;

/**
 * Entry point. Wire all event handlers and optionally prefill the form
 * @param {string|null} id       - listing ID (null in create mode)
 * @param {boolean}     editMode - true when editing an existing listing
 */
export async function initListingForm(id, editMode) {
  listingId = id;
  isEditMode = editMode;

  initCancelButton();
  initMediaSection(); //wires Add button, container is empty in the template

  if (isEditMode) {
    // Prefill adds the media rows (with real URLs)
    await prefillForm();
  } else {
    // Create mode: set earliest selectable datetime + one empty media row
    setDateMinimum();
    addRow();
    updateAddBtnState();
  }

  initFormSubmit();
}

// Reset module state when leaving the page
export function cleanupListingForm() {
  listingId = null;
  isEditMode = false;
}

// Cancel button
function initCancelButton() {
  document.getElementById('cancel-btn')?.addEventListener('click', () => {
    if (isEditMode && listingId) {
      navigateTo(`/listing/${listingId}`);
    } else if (history.length > 1) {
      history.back();
    } else {
      navigateTo('/');
    }
  });
}

// Media section
function initMediaSection() {
  document.getElementById('add-media-btn')?.addEventListener('click', () => {
    const addBtn = document.getElementById('add-media-btn');
    if (!addBtn?.disabled) {
      addRow();
      updateAddBtnState();
    }
  });
}

/**
 * Single source of truth for a media URL row. Used in three situations: initial empty row (create mode),prefilled rows (edit mode), and dynamically added rows.
 * The Remove button is wired internally — callers don't need to do it
 * @param {string} [url=''] - pre-populate the URL input
 */
function addRow(url = '') {
  const container = document.getElementById('media-container');
  const row = document.createElement('div');
  row.className = 'flex gap-2';
  row.innerHTML = `
    <input
      type="url"
      name="media[]"
      ${url ? `value="${escHtml(url)}"` : ''}
      placeholder="https://example.com/image.jpg"
      aria-label="Image URL"
      class="input"
    />
    <button type="button"
      class="btn-ghost px-3 text-error hover:bg-error/10"
      aria-label="Remove image">×</button>
  `;
  container.appendChild(row);

  row.querySelector('[aria-label="Remove image"]').addEventListener('click', () => {
    row.remove();
    updateAddBtnState();
  });
}

// Disable "Add image" when the 8-image limit is reached
function updateAddBtnState() {
  const container = document.getElementById('media-container');
  const addBtn = document.getElementById('add-media-btn');
  if (!container || !addBtn) return;
  const count = container.querySelectorAll('input[name="media[]"]').length;
  addBtn.disabled = count >= 8;
}

// Prefill (edit mode)
async function prefillForm() {
  try {
    const response = await getListing(listingId, false, false);
    const listing = response.data;

    document.getElementById('title').value = listing.title ?? '';
    document.getElementById('description').value = listing.description ?? '';

    // End date is read-only in edit mode — show a formatted string
    if (listing.endsAt) {
      const readonlyEl = document.getElementById('endsAt-readonly');
      if (readonlyEl) {
        readonlyEl.textContent = new Date(listing.endsAt).toLocaleString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }

    // Populate media rows — always show at least one row so the user has somewhere to add an image even if the listing had none
    if (listing.media?.length) {
      listing.media.forEach((item) => addRow(item.url));
    } else {
      addRow();
    }
    updateAddBtnState();
  } catch {
    showBlockError('listing-error', 'Could not load listing data. Please try again.');
  }
}

// Date minimum (create mode)
//Prevent selecting dates in the past
function setDateMinimum() {
  const endsAtInput = document.getElementById('endsAt');
  if (!endsAtInput) return;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  endsAtInput.min =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// Form submit
function initFormSubmit() {
  document.getElementById('listing-form')?.addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
  e.preventDefault();

  const form = document.getElementById('listing-form');
  const endsAtInput = document.getElementById('endsAt'); // null in edit mode

  clearFormErrors(form);
  hideBlockError('listing-error');

  const media = collectMedia();
  const data = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    // Pass null in edit mode so validateListingForm skips the endsAt check
    endsAt: endsAtInput ? endsAtInput.value : null,
    media,
  };

  const { isValid, errors } = validateListingForm(data);
  if (!isValid) {
    // Field-level errors go inline under their inputs. Media error goes to the top-level block (multiple inputs share it)
    const fieldErrors = { ...errors };
    delete fieldErrors.media;
    showValidationErrors(form, fieldErrors);
    if (errors.media) showBlockError('listing-error', errors.media);

    // Focus the first errored field for keyboard users
    const firstField = Object.keys(errors)[0];
    form.querySelector(`[name="${firstField}"]`)?.focus();
    return;
  }

  setLoading(true);

  try {
    if (isEditMode) {
      await updateListing(listingId, buildPayload(data));
      showSuccessToast('Listing updated.');
      navigateTo(`/listing/${listingId}`);
    } else {
      const response = await createListing(buildPayload(data));
      showSuccessToast('Listing created.');
      navigateTo(`/listing/${response.data.id}`);
    }
  } catch (err) {
    showBlockError(
      'listing-error',
      err.message || (isEditMode ? 'Could not update listing.' : 'Could not create listing.')
    );
    setLoading(false);
  }
}

/**
 * Collect all media URL inputs into the format the API expects. Empty inputs are filtered out.
 * @returns {{ url: string, alt: string }[]}
 */
function collectMedia() {
  return Array.from(document.querySelectorAll('input[name="media[]"]'))
    .map((input) => input.value.trim())
    .filter(Boolean)
    .map((url) => ({ url, alt: '' }));
}

/**
 * Build the API payload from validated data. Edit mode always sends media (even an empty array) so the server
 * can clear removed images. Create mode omits media if there are none
 * @param {{ title, description, endsAt, media }} data
 * @returns {Object}
 */
function buildPayload(data) {
  const payload = { title: data.title };

  if (!isEditMode && data.endsAt) {
    payload.endsAt = new Date(data.endsAt).toISOString();
  }
  if (data.description) {
    payload.description = data.description;
  }
  if (isEditMode) {
    payload.media = data.media; // always send — empty array clears images
  } else if (data.media.length) {
    payload.media = data.media;
  }

  return payload;
}

// Loading / error UI helpers
function setLoading(loading) {
  const btn = document.getElementById('submit-btn');
  const inputs = document.querySelectorAll('#listing-form input, #listing-form textarea');

  btn.disabled = loading;
  btn.textContent = loading
    ? isEditMode
      ? 'Saving…'
      : 'Creating…'
    : isEditMode
      ? 'Save changes'
      : 'Create listing';

  inputs.forEach((el) => (el.disabled = loading));
}
