/**
 * Single Listing View
 * #43 — Build Single Listing page layout
 *
 * Scope: fetch listing, show loading/error/content states,
 * render two-column desktop layout with placeholder sections.
 */

import { getListing } from '../api/apiClient.js';

export class ListingView {
  constructor(params) {
    this.params = params;
    this.listingId = params.id;
  }

  // ─────────────────────────────────────────────
  // RENDER — Static shell, populated in init()
  // ─────────────────────────────────────────────

  async render() {
    return `
      <div class="page-container">

        <!-- Back link -->
        <a href="/" data-link
          class="inline-flex items-center gap-2 text-text-secondary hover:text-primary-500 mb-6 text-sm transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to listings
        </a>

        <!-- Loading state -->
        <div id="listing-loading" class="flex flex-col items-center justify-center py-24 gap-4">
          <div class="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          <p class="text-text-secondary text-sm">Loading listing...</p>
        </div>

        <!-- Error / 404 state -->
        <div id="listing-error" class="hidden text-center py-24">
          <p class="text-5xl mb-4">😕</p>
          <h2 class="text-xl font-bold text-text-primary mb-2">Listing not found</h2>
          <p class="text-text-secondary mb-6">
            This listing may have been removed or the link is invalid.
          </p>
          <a href="/" data-link class="btn-primary">Browse listings</a>
        </div>

        <!-- Main content (hidden until data loaded) -->
        <div id="listing-content" class="hidden">

          <!-- Two-column grid: image left, details right -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

            <!-- Left: Image placeholder (Gallery implemented in #44) -->
            <div>
              <div id="gallery-placeholder"
                class="bg-surface rounded-xl aspect-square flex items-center justify-center">
                <span class="text-text-secondary text-sm">Loading image...</span>
              </div>
            </div>

            <!-- Right: Details placeholder (Description/Tags in #45) -->
            <div class="space-y-5">

              <!-- Status + seller row -->
              <div class="flex flex-wrap items-center gap-2">
                <span id="listing-status-badge" class="badge-success">Active</span>
                <span class="text-text-secondary text-sm">
                  Listed by
                  <a id="listing-seller-link" href="#" data-link
                    class="text-primary-500 hover:underline font-medium">
                    @...
                  </a>
                </span>
              </div>

              <!-- Title -->
              <h1 id="listing-title"
                class="text-2xl sm:text-3xl font-bold text-text-primary leading-tight">
                Loading...
              </h1>

              <!-- Bid card placeholder (Countdown in #46, Form in #47) -->
              <div class="card">
                <div class="card-body">
                  <p class="text-text-secondary text-sm">Bid section — coming in #46 &amp; #47</p>
                </div>
              </div>

            </div>
          </div>

          <!-- Bid history placeholder (implemented in #47) -->
          <section class="mt-10 sm:mt-14">
            <h2 class="text-lg sm:text-xl font-bold text-text-primary mb-4">Bid History</h2>
            <div class="card">
              <div id="bid-history" class="p-8 text-center">
                <p class="text-text-secondary">Bid history — coming in #47</p>
              </div>
            </div>
          </section>

        </div><!-- /#listing-content -->
      </div>
    `;
  }

  // ─────────────────────────────────────────────
  // INIT — Fetch listing + populate basic fields
  // ─────────────────────────────────────────────

  async init() {
    try {
      const response = await getListing(this.listingId, true, true);
      const listing = response.data;

      this._showContent();
      this._renderBasicInfo(listing);
    } catch (err) {
      console.error('ListingView: failed to load listing', err);
      this._showError();
    }
  }

  // ─────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────

  /**
   * Populate title, seller link, and status badge from API data.
   * Full details (description, tags) are added in #45.
   * @param {Object} listing
   */
  _renderBasicInfo(listing) {
    const { title, seller, endsAt } = listing;

    // Title
    document.getElementById('listing-title').textContent = title;

    // Seller link
    const sellerLink = document.getElementById('listing-seller-link');
    if (seller) {
      sellerLink.textContent = `@${seller.name}`;
      sellerLink.href = `/profile/${seller.name}`;
    }

    // Status badge: Active or Ended
    const isActive = new Date(endsAt) > new Date();
    const badge = document.getElementById('listing-status-badge');
    badge.textContent = isActive ? 'Active' : 'Ended';
    badge.className = isActive ? 'badge-success' : 'badge-error';
  }

  /** Show main content, hide loading spinner */
  _showContent() {
    document.getElementById('listing-loading').classList.add('hidden');
    document.getElementById('listing-content').classList.remove('hidden');
  }

  /** Show 404 error state, hide loading spinner */
  _showError() {
    document.getElementById('listing-loading').classList.add('hidden');
    document.getElementById('listing-error').classList.remove('hidden');
  }
}