/**
 * Create/Edit Listing View
 * #48 — Create Listing form + API     ✅ done
 * Ticket B — Edit mode                ✅ done
 */

import { navigateTo } from '../router/router.js';
import { createListing, getListing, updateListing } from '../api/apiClient.js';

export class CreateListingView {
  constructor(params) {
    this.params = params;
    this.listingId = params.id || null;
    this.isEditMode = !!this.listingId;
  }

  async render() {
    return `
      <div class="page-container max-w-2xl">
        <!-- Back Link -->
        <a href="/" data-link class="inline-flex items-center gap-2 text-text-secondary hover:text-primary-500 mb-6 text-sm sm:text-base transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Cancel
        </a>
        
        <!-- Form Card -->
        <div class="card">
          <div class="card-body">
            <h1 class="text-xl sm:text-2xl font-bold text-text-primary mb-2">
              ${this.isEditMode ? 'Edit Listing' : 'Create Listing'}
            </h1>
            <p class="text-text-secondary mb-6 sm:mb-8 text-sm sm:text-base">
              ${this.isEditMode ? 'Update your listing details' : 'Add a new item for auction'}
            </p>
            
            <form id="listing-form" class="space-y-5 sm:space-y-6">
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
                ? `<!-- endsAt cannot be changed after creation (Noroff API limitation) -->
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
                    <button type="button" class="btn-secondary px-3" id="add-media-btn" aria-label="Add another image">
                      +
                    </button>
                  </div>
                </div>
                <p class="hint mt-2">Add up to 8 image URLs</p>
              </div>
              
              <!-- Tags -->
              <div>
                <label for="tags" class="label">Tags</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  placeholder="electronics, vintage, rare"
                  class="input"
                />
                <p class="hint">Comma-separated tags to help buyers find your item</p>
              </div>
              
              <!-- Submit Button -->
              <div class="pt-4">
                <!-- Error Message — shown above submit button -->
                <div id="listing-error" class="hidden mb-4 p-4 bg-error/10 border border-error/20 rounded-lg">
                  <p class="text-error text-sm font-medium"></p>
                </div>
                <button type="submit" id="submit-btn" class="btn-primary w-full py-3">
                  ${this.isEditMode ? 'Update Listing' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    // Auth guard handled by the router — no need to check here.

    // Edit mode: load existing data and prefill form

    // Edit mode: load existing data and prefill form
    if (this.isEditMode) {
      await this._prefillForm();
    }

    // Set minimum date to now — only needed in create mode
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

    this._initAddMediaBtn();

    const form = document.getElementById('listing-form');
    if (form) {
      form.addEventListener('submit', (e) => this._handleSubmit(e));
    }
  }

  // ─────────────────────────────────────────────
  // Form submit handler
  // ─────────────────────────────────────────────

  async _handleSubmit(e) {
    e.preventDefault();
    this._hideError();

    const title       = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    // endsAt input only exists in create mode — in edit mode the field is read-only
    const endsAtInput = document.getElementById('endsAt');
    const endsAtRaw   = endsAtInput ? endsAtInput.value : null;
    const tagsRaw     = document.getElementById('tags').value;

    // Validation
    if (!title) {
      this._showError('Title is required.');
      document.getElementById('title').focus();
      return;
    }

    // endsAt: required for create only (API does not allow changing it after creation)
    if (!this.isEditMode) {
      if (!endsAtRaw) {
        this._showError('End date is required.');
        endsAtInput.focus();
        return;
      }
      const endsAtDate = new Date(endsAtRaw);
      if (endsAtDate <= new Date()) {
        this._showError('End date must be in the future.');
        endsAtInput.focus();
        return;
      }
    }

    // Build payload
    const payload = { title };
    if (!this.isEditMode && endsAtRaw) {
      payload.endsAt = new Date(endsAtRaw).toISOString();
    }

    if (description) payload.description = description;

    const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
    if (tags.length) payload.tags = tags;

    const mediaInputs = document.querySelectorAll('input[name="media[]"]');
    const media = Array.from(mediaInputs)
      .map((input) => input.value.trim())
      .filter(Boolean)
      .map((url) => ({ url, alt: '' }));
    if (media.length) payload.media = media;

    this._setLoading(true);

    try {
      if (this.isEditMode) {
        await updateListing(this.listingId, payload);
        navigateTo(`/listing/${this.listingId}`);
      } else {
        const response = await createListing(payload);
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
  // Ticket B — Prefill form in edit mode
  // ─────────────────────────────────────────────

  async _prefillForm() {
    try {
      const response = await getListing(this.listingId, false, false);
      const listing  = response.data;

      document.getElementById('title').value = listing.title ?? '';
      document.getElementById('description').value = listing.description ?? '';

      // End date — shown as read-only text (cannot be changed via API)
      if (listing.endsAt) {
        const readonlyEl = document.getElementById('endsAt-readonly');
        if (readonlyEl) {
          readonlyEl.textContent = new Date(listing.endsAt).toLocaleString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          });
        }
      }

      if (listing.tags?.length) {
        document.getElementById('tags').value = listing.tags.join(', ');
      }

      if (listing.media?.length) {
        const container = document.getElementById('media-container');
        container.innerHTML = '';

        listing.media.forEach((item, i) => {
          const row = document.createElement('div');
          row.className = 'flex gap-2';
          const isFirst = i === 0;
          row.innerHTML = `
            <input
              type="url"
              name="media[]"
              value="${this._escHtml(item.url)}"
              placeholder="https://example.com/image.jpg"
              class="input"
            />
            ${isFirst
              ? `<button type="button" class="btn-secondary px-3" id="add-media-btn"
                   aria-label="Add another image">+</button>`
              : `<button type="button"
                   class="btn-ghost px-3 text-error hover:bg-error/10"
                   aria-label="Remove image">×</button>`
            }
          `;
          container.appendChild(row);
          if (!isFirst) {
            row.querySelector('button').addEventListener('click', () => row.remove());
          }
        });
      }
    } catch (err) {
      this._showError('Could not load listing data. Please try again.');
    }
    // Note: _initAddMediaBtn() is called in init() after _prefillForm() completes
  }

  _initAddMediaBtn() {
    const addMediaBtn    = document.getElementById('add-media-btn');
    const mediaContainer = document.getElementById('media-container');
    if (!addMediaBtn || !mediaContainer) return;

    addMediaBtn.addEventListener('click', () => {
      const inputs = mediaContainer.querySelectorAll('input[name="media[]"]');
      if (inputs.length >= 8) return;
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
      row.querySelector('button').addEventListener('click', () => row.remove());
    });
  }

  _setLoading(isLoading) {
    const btn    = document.getElementById('submit-btn');
    const inputs = document.querySelectorAll('#listing-form input, #listing-form textarea');
    btn.disabled    = isLoading;
    btn.textContent = isLoading
      ? (this.isEditMode ? 'Saving…' : 'Creating…')
      : (this.isEditMode ? 'Update Listing' : 'Create Listing');
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