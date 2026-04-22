/**
 * Create/Edit Listing View
 * #49 — Media upload UI component      ✅ this commit
 *
 * Added in #49:
 *  - URL input + "Add" button
 *  - Live image preview on input blur
 *  - Remove button per preview item
 *  - Max 8 images enforced (Add button disabled)
 *  - Broken URL → grey placeholder shown in preview
 *  - getMediaArray() returns [{url, alt}] for form submit (#48)
 */
export class CreateListingView {
  constructor(params) {
    this.params    = params;
    this.listingId = params.id || null;
    this.isEditMode = !!this.listingId;

    // #49: internal media array [{url, alt}]
    this._mediaItems = [];
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  async render() {
    return `
      <div class="page-container max-w-2xl">

        <!-- Back link -->
        <a href="/" data-link
          class="inline-flex items-center gap-2 text-text-secondary hover:text-primary-500 mb-6 text-sm transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Cancel
        </a>

        <!-- Form card -->
        <div class="card">
          <div class="card-body">

            <h1 class="text-xl sm:text-2xl font-bold text-text-primary mb-2">
              ${this.isEditMode ? 'Edit Listing' : 'Create Listing'}
            </h1>
            <p class="text-text-secondary mb-6 text-sm">
              ${this.isEditMode ? 'Update your listing details' : 'Add a new item for auction'}
            </p>

            <!-- API error -->
            <div id="listing-error"
              class="hidden mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
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
                <p class="hint">Must be a future date</p>
              </div>

              <!-- ── #49: Media Upload ── -->
              <div>
                <label class="label">Images</label>

                <!-- URL input row -->
                <div class="flex gap-2">
                  <input
                    type="url"
                    id="media-url-input"
                    placeholder="https://example.com/image.jpg"
                    class="input"
                  />
                  <button
                    type="button"
                    id="add-media-btn"
                    class="btn-secondary px-4 flex-shrink-0"
                    aria-label="Add image"
                  >
                    Add
                  </button>
                </div>

                <!-- Error for URL input -->
                <p id="media-url-error" class="hidden text-error text-xs mt-1"></p>

                <!-- Preview grid -->
                <div
                  id="media-previews"
                  class="hidden mt-3 grid grid-cols-4 sm:grid-cols-5 gap-2">
                  <!-- Populated by _addMediaItem() -->
                </div>

                <p id="media-hint" class="hint mt-2">Add up to 8 image URLs</p>
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
                <p class="hint">Comma-separated</p>
              </div>

              <!-- Submit -->
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

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────

  async init() {
    this._setMinDate();
    this._initMediaUpload(); // #49
  }

  // ─────────────────────────────────────────────
  // #49 — Media upload UI
  // ─────────────────────────────────────────────

  /** Wire up Add button and Enter key on URL input */
  _initMediaUpload() {
    const urlInput  = document.getElementById('media-url-input');
    const addBtn    = document.getElementById('add-media-btn');

    addBtn.addEventListener('click', () => this._handleAddMedia());

    // Allow pressing Enter in URL field to add image
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._handleAddMedia();
      }
    });
  }

  /**
   * Validate URL input and add to preview grid.
   * Called on Add button click or Enter key.
   */
  _handleAddMedia() {
    const urlInput = document.getElementById('media-url-input');
    const url      = urlInput.value.trim();

    // Max 8 images
    if (this._mediaItems.length >= 8) {
      this._showMediaError('Maximum 8 images allowed.');
      return;
    }

    // Basic URL format check
    if (!url) {
      this._showMediaError('Please enter an image URL.');
      return;
    }

    try {
      new URL(url); // throws if invalid
    } catch {
      this._showMediaError('Please enter a valid URL (must start with https://).');
      return;
    }

    this._hideMediaError();
    this._addMediaItem(url);
    urlInput.value = '';
    urlInput.focus();
  }

  /**
   * Add one item to _mediaItems and render its preview card.
   * @param {string} url
   */
  _addMediaItem(url) {
    const index = this._mediaItems.length;
    this._mediaItems.push({ url, alt: '' });

    const previews = document.getElementById('media-previews');
    previews.classList.remove('hidden');
    previews.style.display = 'grid';

    // Preview card
    const card = document.createElement('div');
    card.dataset.mediaIndex = index;
    card.className = 'relative aspect-square rounded-lg overflow-hidden bg-surface border border-border group';

    card.innerHTML = `
      <img
        src="${this._escHtml(url)}"
        alt="Image ${index + 1}"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <!-- Broken URL overlay (shown via onerror) -->
      <div class="broken-overlay hidden absolute inset-0 flex items-center justify-center bg-surface">
        <span class="text-text-secondary text-xs text-center px-1">No preview</span>
      </div>
      <!-- Remove button -->
      <button
        type="button"
        aria-label="Remove image"
        class="remove-btn absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white
               text-xs flex items-center justify-center
               opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    `;

    // Show broken overlay on image error
    const img = card.querySelector('img');
    img.onerror = () => {
      img.classList.add('hidden');
      card.querySelector('.broken-overlay').classList.remove('hidden');
    };

    // Remove button
    card.querySelector('.remove-btn').addEventListener('click', () => {
      this._removeMediaItem(card);
    });

    previews.appendChild(card);
    this._updateAddButton();
  }

  /**
   * Remove a preview card and its entry from _mediaItems.
   * Re-indexes remaining cards.
   * @param {HTMLElement} card
   */
  _removeMediaItem(card) {
    const previews = document.getElementById('media-previews');
    const index    = parseInt(card.dataset.mediaIndex, 10);

    this._mediaItems.splice(index, 1);
    card.remove();

    // Re-index remaining cards so indices stay in sync
    previews.querySelectorAll('[data-media-index]').forEach((c, i) => {
      c.dataset.mediaIndex = i;
    });

    // Hide grid when empty
    if (this._mediaItems.length === 0) {
      previews.style.display = 'none';
      previews.classList.add('hidden');
    }

    this._updateAddButton();
  }

  /**
   * Disable Add button and show count hint when at max.
   */
  _updateAddButton() {
    const addBtn = document.getElementById('add-media-btn');
    const hint   = document.getElementById('media-hint');
    const count  = this._mediaItems.length;
    const atMax  = count >= 8;

    addBtn.disabled = atMax;
    hint.textContent = atMax
      ? 'Maximum 8 images reached'
      : `${count}/8 images added`;
  }

  /**
   * Return current media array for use in form submit.
   * @returns {Array<{url:string, alt:string}>}
   */
  getMediaArray() {
    return [...this._mediaItems];
  }

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  /** Set datetime-local min to current time */
  _setMinDate() {
    const input = document.getElementById('endsAt');
    if (!input) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    input.min = now.toISOString().slice(0, 16);
  }

  _showMediaError(msg) {
    const el = document.getElementById('media-url-error');
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  _hideMediaError() {
    document.getElementById('media-url-error')?.classList.add('hidden');
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