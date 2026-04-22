/**
 * Create/Edit Listing View
 */

import { isLoggedIn } from '../auth/storage.js';
import { navigateTo } from '../router/router.js';
import { createListing } from '../api/apiClient.js';

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
            
            <!-- Error Message (hidden by default) -->
            <div id="listing-error" class="hidden mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
              <p class="text-error text-sm font-medium"></p>
            </div>
            
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
                  placeholder="Describe your item in detail..."
                  class="input resize-none"
                ></textarea>
                <p class="hint">Help buyers understand what you're selling</p>
              </div>
              
              <!-- End Date -->
              <div>
                <label for="endsAt" class="label">End Date *</label>
                <input
                  type="datetime-local"
                  id="endsAt"
                  name="endsAt"
                  required
                  class="input"
                />
                <p class="hint">When should the auction end?</p>
              </div>
              
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
    // ── Protected route: guests cannot access this page ──
    if (!isLoggedIn()) {
      navigateTo('/login');
      return; // stop — do not wire up any handlers
    }

    // Set minimum date to now
    const endsAtInput = document.getElementById('endsAt');
    if (endsAtInput) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      endsAtInput.min = now.toISOString().slice(0, 16);
    }

    // Add media input functionality
    const addMediaBtn    = document.getElementById('add-media-btn');
    const mediaContainer = document.getElementById('media-container');
    
    if (addMediaBtn && mediaContainer) {
      addMediaBtn.addEventListener('click', () => {
        const inputs = mediaContainer.querySelectorAll('input[name="media[]"]');
        if (inputs.length < 8) {
          const newInput = document.createElement('div');
          newInput.className = 'flex gap-2';
          newInput.innerHTML = `
            <input
              type="url"
              name="media[]"
              placeholder="https://example.com/image.jpg"
              class="input"
            />
            <button type="button" class="btn-ghost px-3 text-error hover:bg-error/10" aria-label="Remove image">
              ×
            </button>
          `;
          mediaContainer.appendChild(newInput);
          newInput.querySelector('button').addEventListener('click', () => {
            newInput.remove();
          });
        }
      });
    }

    // Form submit
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
    const endsAtRaw   = document.getElementById('endsAt').value;
    const tagsRaw     = document.getElementById('tags').value;

    // Validation
    if (!title) {
      this._showError('Title is required.');
      document.getElementById('title').focus();
      return;
    }

    if (!endsAtRaw) {
      this._showError('End date is required.');
      document.getElementById('endsAt').focus();
      return;
    }

    const endsAt = new Date(endsAtRaw);
    if (endsAt <= new Date()) {
      this._showError('End date must be in the future.');
      document.getElementById('endsAt').focus();
      return;
    }

    // Build payload
    const payload = { title, endsAt: endsAt.toISOString() };

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
      const response = await createListing(payload);
      navigateTo(`/listing/${response.data.id}`);
    } catch (err) {
      this._showError(err.message || 'Could not create listing. Please try again.');
      this._setLoading(false);
    }
  }

  _setLoading(isLoading) {
    const btn    = document.getElementById('submit-btn');
    const inputs = document.querySelectorAll('#listing-form input, #listing-form textarea');
    btn.disabled    = isLoading;
    btn.textContent = isLoading ? 'Creating…' : 'Create Listing';
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
}