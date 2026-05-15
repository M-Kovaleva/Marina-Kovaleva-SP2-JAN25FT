/* Create / Edit listing view */

import { initListingForm, cleanupListingForm } from '../handlers/listingFormHandler.js';

export class CreateListingView {
  constructor(params) {
    this.params = params;
    this.listingId = params.id || null;
    this.isEditMode = !!this.listingId;
  }

  async render() {
    return listingFormTemplate(this.isEditMode);
  }

  async init() {
    await initListingForm(this.listingId, this.isEditMode);
  }

  destroy() {
    cleanupListingForm();
  }
}

function listingFormTemplate(isEditMode) {
  return `
    <div class="page-container max-w-2xl">

      <!-- Cancel — edit mode goes back to the listing, create mode goes back -->
      <button type="button" id="cancel-btn"
        class="inline-flex items-center gap-2 text-text-secondary hover:text-primary-500
               mb-6 text-sm sm:text-base transition-colors cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 19l-7-7 7-7"/>
        </svg>
        Cancel
      </button>

      <!-- Form card -->
      <div class="card">
        <div class="card-body">
          <h1 class="text-xl sm:text-2xl font-bold text-text-primary mb-2">
            ${isEditMode ? 'Edit listing' : 'Create listing'}
          </h1>
          <p class="text-text-secondary mb-6 sm:mb-8 text-sm sm:text-base">
            ${isEditMode ? 'Update your listing details' : 'Add a new item for auction'}
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

            <!-- End Date: editable in create mode, read-only in edit mode -->
            ${isEditMode ? endDateReadonlyField() : endDateInputField()}

            <!-- Media URLs — rows are inserted by JS (see listingFormHandler) -->
            <div>
              <p class="label" id="media-label">Images</p>
              <div id="media-container" class="space-y-3"></div>
              <button type="button" id="add-media-btn"
                class="btn-secondary text-sm mt-3">
                + Add image
              </button>
              <p class="hint mt-2">Up to 8 images</p>
            </div>

            <!-- Submit -->
            <div class="pt-4">
              <div id="listing-error"
                class="hidden mb-4 p-4 bg-error/10 border border-error/20 rounded-lg">
                <p class="alert-error"></p>
              </div>
              <button type="submit" id="submit-btn" class="btn-primary w-full py-3">
                ${isEditMode ? 'Save changes' : 'Create listing'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  `;
}

function endDateInputField() {
  return `
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
    </div>`;
}

function endDateReadonlyField() {
  return `
    <div>
      <label class="label">End Date</label>
      <div id="endsAt-readonly"
        class="input bg-surface text-text-secondary cursor-not-allowed">
        —
      </div>
      <p class="hint">Auction end date cannot be changed after creation.</p>
    </div>`;
}
