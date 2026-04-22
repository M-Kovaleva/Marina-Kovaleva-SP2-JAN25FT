/**
 * Single Listing View
 * #43 — Build Single Listing page layout     ✅ done
 * #45 — Display listing details              ✅ this commit
 *
 * Added in #45:
 *  - Description block (hidden when empty)
 *  - Tags as non-clickable badges
 *  - Seller card: photo (only if avatar exists) + name link + "listed on" date
 */

import { getListing } from '../api/apiClient.js';

export class ListingView {
  constructor(params) {
    this.params = params;
    this.listingId = params.id;
  }

  // ─────────────────────────────────────────────
  // RENDER
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

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

            <!-- Left: Image placeholder (Gallery implemented in #44) -->
            <div>
              <div id="gallery-placeholder"
                class="bg-surface rounded-xl aspect-square flex items-center justify-center">
                <span class="text-text-secondary text-sm">Loading image...</span>
              </div>
            </div>

            <!-- Right: Details column -->
            <div class="space-y-5">

              <!-- Status badge + seller name (#43) -->
              <div class="flex flex-wrap items-center gap-2">
                <span id="listing-status-badge" class="badge-success">Active</span>
                <span class="text-text-secondary text-sm">
                  Listed by
                  <a id="listing-seller-link" href="#" data-link
                    class="text-primary-500 hover:underline font-medium">
                  </a>
                </span>
              </div>

              <!-- Title (#43) -->
              <h1 id="listing-title"
                class="text-2xl sm:text-3xl font-bold text-text-primary leading-tight">
              </h1>

              <!-- ── #45: Description ── -->
              <div id="listing-description-block">
                <h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Description
                </h2>
                <p id="listing-description"
                  class="text-text-primary leading-relaxed whitespace-pre-line">
                </p>
              </div>

              <!-- ── #45: Tags ── -->
              <div id="listing-tags-block" class="hidden">
                <div id="listing-tags" class="flex flex-wrap gap-2"></div>
              </div>

              <!-- ── #45: Seller card ── -->
              <div class="flex items-center gap-3 bg-surface rounded-xl">
                <div id="seller-avatar" class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"></div>
                <div class="min-w-0">
                  <p class="text-xs text-text-secondary mb-0.5">Seller</p>
                  <a id="seller-profile-link" href="#" data-link
                    class="font-semibold text-text-primary hover:text-primary-500 transition-colors truncate block">
                  </a>
                </div>
                <div class="ml-auto text-right flex-shrink-0">
                  <p class="text-xs text-text-secondary mb-0.5">Listed on</p>
                  <p id="listing-created-date" class="text-xs font-medium text-text-primary"></p>
                </div>
              </div>

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
  // INIT
  // ─────────────────────────────────────────────

  async init() {
    try {
      const response = await getListing(this.listingId, true, true);
      const listing = response.data;

      this._showContent();
      this._renderBasicInfo(listing); // #43
      this._renderDetails(listing);   // #45
    } catch (err) {
      console.error('ListingView: failed to load listing', err);
      this._showError();
    }
  }

  // ─────────────────────────────────────────────
  // #43 — Basic info
  // ─────────────────────────────────────────────

  /**
   * Populate title, seller link, status badge.
   * @param {Object} listing
   */
  _renderBasicInfo(listing) {
    const { title, seller, endsAt } = listing;

    document.getElementById('listing-title').textContent = title;

    const sellerLink = document.getElementById('listing-seller-link');
    if (seller) {
      sellerLink.textContent = `@${seller.name}`;
      sellerLink.href = `/profile/${seller.name}`;
    }

    const isActive = new Date(endsAt) > new Date();
    const badge = document.getElementById('listing-status-badge');
    badge.textContent = isActive ? 'Active' : 'Ended';
    badge.className = isActive ? 'badge-success' : 'badge-error';
  }

  // ─────────────────────────────────────────────
  // #45 — Listing details
  // ─────────────────────────────────────────────

  /**
   * Populate description, tags, seller card.
   * @param {Object} listing
   */
  _renderDetails(listing) {
    const { description, tags, seller, created } = listing;

    this._renderDescription(description);
    this._renderTags(tags);
    this._renderSellerCard(seller, created);
  }

  /**
   * Show description, or hide the block when empty.
   * whitespace-pre-line preserves line breaks from the API.
   * @param {string|undefined} description
   */
  _renderDescription(description) {
    const block = document.getElementById('listing-description-block');
    const el    = document.getElementById('listing-description');

    if (description?.trim()) {
      el.textContent = description;
    } else {
      block.classList.add('hidden');
    }
  }

  /**
   * Render tags as non-clickable informational badges.
   * Hides the block when no tags present.
   * @param {string[]|undefined} tags
   */
  _renderTags(tags) {
    if (!tags?.length) return;

    document.getElementById('listing-tags-block').classList.remove('hidden');
    document.getElementById('listing-tags').innerHTML = tags
      .map(
        (tag) =>
          `<span class="px-3 py-1 bg-white border border-border
                        text-text-secondary text-sm rounded-full">
            ${this._escHtml(tag)}
          </span>`
      )
      .join('');
  }

  /**
   * Render seller card: avatar photo only if seller has one, name link, listed date.
   * No fallback image — avatar container stays empty when no photo available.
   * @param {Object|undefined} seller
   * @param {string} created - ISO date string
   */
  _renderSellerCard(seller, created) {
    if (!seller) return;

    // Avatar: show photo only when seller has a valid URL
    const avatarUrl = seller.avatar?.url?.trim();
    if (avatarUrl) {
      const img = document.createElement('img');
      img.src = avatarUrl;
      img.alt = seller.name;
      img.className = 'w-full h-full object-cover';
      document.getElementById('seller-avatar').appendChild(img);
    }

    // Seller name → profile link
    const profileLink = document.getElementById('seller-profile-link');
    profileLink.textContent = `@${seller.name}`;
    profileLink.href = `/profile/${seller.name}`;

    // Listed on date
    document.getElementById('listing-created-date').textContent =
      this._formatDate(created);
  }

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  _showContent() {
    document.getElementById('listing-loading').classList.add('hidden');
    document.getElementById('listing-content').classList.remove('hidden');
  }

  _showError() {
    document.getElementById('listing-loading').classList.add('hidden');
    document.getElementById('listing-error').classList.remove('hidden');
  }

  /**
   * Format ISO date as "15 Apr 2026"
   * @param {string} dateStr
   * @returns {string}
   */
  _formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  /**
   * Escape HTML special characters to prevent XSS.
   * @param {string} str
   * @returns {string}
   */
  _escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}