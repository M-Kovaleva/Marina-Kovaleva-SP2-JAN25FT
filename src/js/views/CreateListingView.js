/* Create/Edit Listing view */

import { navigateTo } from '../router/router.js';
import { createListing, getListing, updateListing } from '../api/apiClient.js';
import { showSuccessToast } from '../utils/toast.js';
import { validateListingForm, showValidationErrors, clearFormErrors } from '../utils/validation.js';

export class CreateListingView {
  constructor(params) {
    this.params = params;
    this.listingId = params.id || null;
    this.isEditMode = !!this.listingId;
  }

   // Render
  async render() {
    return `
      <div class="page-container max-w-2xl">
      
        <!-- Cancel — Edit mode goes to the listing, Create mode goes back -->
        <button type="button" id="cancel-btn"
          class="inline-flex items-center gap-2 text-text-secondary hover:text-primary-500
                 mb-6 text-sm sm:text-base transition-colors cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Cancel
        </button>
        
        <!-- Form card -->
        <div class="card">
          <div class="card-body">
            <h1 class="text-xl sm:text-2xl font-bold text-text-primary mb-2">
              ${this.isEditMode ? 'Edit listing' : 'Create listing'}
            </h1>
            <p class="text-text-secondary mb-6 sm:mb-8 text-sm sm:text-base">
              ${this.isEditMode ? 'Update your listing details' : 'Add a new item for auction'}
            </p>
            
            <form id="listing-form" class="space-y-5 sm:space-y-6" novalidate>
              <!-- Title -->
              <div>
                <label for="title" class="label">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  maxlength="280"
                  placeholder="What are you selling?"
                  class="input"
                />
                <p class="hint">Maximum 280 characters</p>
              </div>
              
              <!-- Description -->
              <div>
                <label for="description" class="label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  maxlength="280"
                  placeholder="Describe your item in detail..."
                  class="input resize-none"
                ></textarea>
                <p class="hint">Maximum 280 characters</p>
              </div>
              
              <!-- End Date -->
              ${this.isEditMode
                ? `
                   <div>
                     <label class="label">End Date</label>
                     <div id="endsAt-readonly"
                       class="input bg-surface text-text-secondary cursor-not-allowed">
                       —
                     </div>
                     <p class="hint">Auction end date cannot be changed after creation.</p>
                   </div>`
                : `<div>
                     <label for="endsAt" class="label">End Date *</label>
                     <input
                       type="datetime-local"
                       id="endsAt"
                       name="endsAt"
                       required
                       class="input"
                     />
                     <p class="hint">When should the auction end?</p>
                   </div>`
              }
              
              <!-- Media URLs -->
              <div>
                <label class="label">Images</label>
                <div id="media-container" class="space-y-3">
                  <div class="flex gap-2">
                    <input
                      type="url"
                      name="media[]"
                      placeholder="https://example.com/image.jpg"
                      class="input"
                    />
                    <button type="button"
                      class="btn-ghost px-3 text-error hover:bg-error/10"
                      aria-label="Remove image">×</button>
                  </div>
                </div>
                <button type="button" id="add-media-btn"
                  class="btn-secondary text-sm mt-3">
                  + Add image
                </button>
                <p class="hint mt-2">Up to 8 images</p>
              </div>
              
              <!-- Submit Button -->
              <div class="pt-4">
                <!-- Error Message — shown above submit button -->
                <div id="listing-error" class="hidden mb-4 p-4 bg-error/10 border border-error/20 rounded-lg">
                  <p class="alert-error"></p>
                </div>
                <button type="submit" id="submit-btn" class="btn-primary w-full py-3">
                  ${this.isEditMode ? 'Save changes' : 'Create listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    // Auth checking handles by router. Edit mode: load existing data and prefill form
    if (this.isEditMode) {
      await this._prefillForm();
    }
    if (!this.isEditMode) {
      const endsAtInput = document.getElementById('endsAt');
      if (endsAtInput) {
        const now = new Date();
        const twoDigits = (n) => String(n).padStart(2, '0');
        endsAtInput.min =
          `${now.getFullYear()}-${twoDigits(now.getMonth() + 1)}-${twoDigits(now.getDate())}` +
          `T${twoDigits(now.getHours())}:${twoDigits(now.getMinutes())}`;
      }
    }

    // Cancel button — return to the listing in edit mode, otherwise go back
    document.getElementById('cancel-btn')?.addEventListener('click', () => {
      if (this.isEditMode && this.listingId) {
        navigateTo(`/listing/${this.listingId}`);
      } else if (history.length > 1) {
        history.back();
      } else {
        navigateTo('/');
      }
    });

    this._initAddMediaBtn();

    const form = document.getElementById('listing-form');
    if (form) {
      form.addEventListener('submit', (e) => this._handleSubmit(e));
    }
  }
  // Form submit handler
  async _handleSubmit(e) {
      e.preventDefault();

      const form        = document.getElementById('listing-form');
      const titleInput  = document.getElementById('title');
      const descInput   = document.getElementById('description');
      const endsAtInput = document.getElementById('endsAt');  // null in edit mode

      // Clear previous errors
      clearFormErrors(form);
      this._hideError();

      // Collect media URLs (dynamic inputs)
      const mediaInputs = document.querySelectorAll('input[name="media[]"]');
      const media = Array.from(mediaInputs)
        .map((input) => input.value.trim())
        .filter(Boolean)
        .map((url) => ({ url, alt: '' }));

      // Build data object for validation
      const data = {
        title:       titleInput.value.trim(),
        description: descInput.value.trim(),
        // In edit mode endsAt input doesn't exist → pass null to skip validation
        endsAt:      endsAtInput ? endsAtInput.value : null,
        media,
      };

      // Client-side validation
      const { isValid, errors } = validateListingForm(data);

      if (!isValid) {
        // Field-specific errors — inline under inputs.
        // Media error goes to top block (multiple inputs share it).
        const fieldErrors = { ...errors };
        delete fieldErrors.media;

        showValidationErrors(form, fieldErrors);

        if (errors.media) {
          this._showError(errors.media);
        }

        // Focus first errored field for keyboard users
        const firstField = Object.keys(errors)[0];
        const firstInput = form.querySelector(`[name="${firstField}"]`);
        if (firstInput) firstInput.focus();

        return;
      }

      // Build payload
      const payload = { title: data.title };
      if (!this.isEditMode && data.endsAt) {
        payload.endsAt = new Date(data.endsAt).toISOString();
      }
      if (data.description) payload.description = data.description;

      if (this.isEditMode) {
        // Edit mode: always send media (possibly empty) so the server
        // knows to clear it. Without this, removed-down-to-zero media
        // would silently keep the old images.
        payload.media = data.media;
      } else if (data.media.length) {
        // Create mode: only include if non-empty
        payload.media = data.media;
      }

      this._setLoading(true);

      try {
        if (this.isEditMode) {
          await updateListing(this.listingId, payload);
          showSuccessToast('Listing updated.');
          navigateTo(`/listing/${this.listingId}`);
        } else {
          const response = await createListing(payload);
          showSuccessToast('Listing created.');
          navigateTo(`/listing/${response.data.id}`);
        }
      } catch (err) {
        this._showError(
          err.message ||
          (this.isEditMode ? 'Could not update listing.' : 'Could not create listing.')
        );
        this._setLoading(false);
      }
    }

  // ─────────────────────────────────────────────
  // Prefill form in edit mode
  // ─────────────────────────────────────────────
  async _prefillForm() {
    try {
      const response = await getListing(this.listingId, false, false);
      const listing  = response.data;

      document.getElementById('title').value = listing.title ?? '';
      document.getElementById('description').value = listing.description ?? '';

      // End date — shown as read-only
      if (listing.endsAt) {
        const readonlyEl = document.getElementById('endsAt-readonly');
        if (readonlyEl) {
          readonlyEl.textContent = new Date(listing.endsAt).toLocaleString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          });
        }
      }

      if (listing.media?.length) {
        const container = document.getElementById('media-container');
        container.innerHTML = '';

        listing.media.forEach((item) => {
          const row = document.createElement('div');
          row.className = 'flex gap-2';
          row.innerHTML = `
            <input
              type="url"
              name="media[]"
              value="${this._escHtml(item.url)}"
              placeholder="https://example.com/image.jpg"
              class="input"
            />
            <button type="button"
              class="btn-ghost px-3 text-error hover:bg-error/10"
              aria-label="Remove image">×</button>
          `;
          container.appendChild(row);
          row.querySelector('button').addEventListener('click', () => row.remove());
        });
      }
    } catch (err) {
      this._showError('Could not load listing data. Please try again.');
    }
  }

  // ─────────────────────────────────────────────
  // Add image button with 8-item limit
  // ─────────────────────────────────────────────
  _initAddMediaBtn() {
    const addMediaBtn    = document.getElementById('add-media-btn');
    const mediaContainer = document.getElementById('media-container');
    if (!addMediaBtn || !mediaContainer) return;

    // Re-evaluate Add button disabled state based on current row count
    const updateAddBtnState = () => {
      const count = mediaContainer.querySelectorAll('input[name="media[]"]').length;
      addMediaBtn.disabled = count >= 8;
    };

    // Attach Remove handler that also updates Add button state
    const wireRemove = (row) => {
      row.querySelector('button[aria-label="Remove image"]')
        ?.addEventListener('click', () => {
          row.remove();
          updateAddBtnState();
        });
    };

    // Wire up remove buttons on existing rows (initial + prefilled)
    mediaContainer.querySelectorAll('div.flex').forEach(wireRemove);
    updateAddBtnState();

    addMediaBtn.addEventListener('click', () => {
      if (addMediaBtn.disabled) return;

      const row = document.createElement('div');
      row.className = 'flex gap-2';
      row.innerHTML = `
        <input
          type="url"
          name="media[]"
          placeholder="https://example.com/image.jpg"
          class="input"
        />
        <button type="button"
          class="btn-ghost px-3 text-error hover:bg-error/10"
          aria-label="Remove image">×</button>
      `;
      mediaContainer.appendChild(row);
      wireRemove(row);
      updateAddBtnState();
    });
  }


  _setLoading(isLoading) {
    const btn    = document.getElementById('submit-btn');
    const inputs = document.querySelectorAll('#listing-form input, #listing-form textarea');
    btn.disabled    = isLoading;
    btn.textContent = isLoading
      ? (this.isEditMode ? 'Saving…' : 'Creating…')
      : (this.isEditMode ? 'Save changes' : 'Create listing');
    inputs.forEach((el) => (el.disabled = isLoading));
  }

  _showError(message) {
    const el = document.getElementById('listing-error');
    el.classList.remove('hidden');
    el.querySelector('p').textContent = message;
  }

  _hideError() {
    document.getElementById('listing-error')?.classList.add('hidden');
  }

  _escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}