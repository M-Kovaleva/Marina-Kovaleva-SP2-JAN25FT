/**
 * Single Listing View
 * #43 — Build Single Listing page layout     ✅ done
 * #45 — Display listing details              ✅ done
 * #46 — Countdown timer                      ✅ this commit
 *
 * Added in #46:
 *  - Bid card with current bid info + live countdown
 *  - Three visual states: Active / Ending soon (<24h) / Ended
 *  - Interval cleanup via destroy() called by router on navigation
 */

import { getListing } from '../api/apiClient.js';

export class ListingView {
  constructor(params) {
    this.params = params;
    this.listingId = params.id;
    this._countdownInterval = null; // #46: store ref for cleanup
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

        <!-- Main content -->
        <div id="listing-content" class="hidden">

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

            <!-- Left: Image placeholder (Gallery in #44) -->
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

              <!-- Description (#45) -->
              <div id="listing-description-block">
                <h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Description
                </h2>
                <p id="listing-description"
                  class="text-text-primary leading-relaxed whitespace-pre-line">
                </p>
              </div>

              <!-- Tags (#45) -->
              <div id="listing-tags-block" class="hidden">
                <h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Tags
                </h2>
                <div id="listing-tags" class="flex flex-wrap gap-2"></div>
              </div>

              <!-- Seller card (#45) -->
              <div class="flex items-center gap-3 p-4 bg-surface rounded-xl">
                <div id="seller-avatar"
                  class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                </div>
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

              <!-- ── #46: Bid card with countdown ── -->
              <div class="card">
                <div class="card-body space-y-5">

                  <!-- Current bid + countdown row -->
                  <div class="flex flex-col sm:flex-row sm:justify-between gap-4">

                    <!-- Current bid -->
                    <div>
                      <p class="text-xs text-text-secondary mb-1">Current bid</p>
                      <p id="listing-current-bid"
                        class="text-2xl sm:text-3xl font-bold text-primary-500">
                        0 credits
                      </p>
                      <p id="listing-bid-count"
                        class="text-xs text-text-secondary mt-1">
                        0 bids
                      </p>
                    </div>

                    <!-- Countdown -->
                    <div class="sm:text-right">
                      <p class="text-xs text-text-secondary mb-1">Ends in</p>
                      <p id="countdown"
                        class="text-xl sm:text-2xl font-semibold tabular-nums text-green-700">
                      </p>
                      <p id="listing-ends-date"
                        class="text-xs text-text-secondary mt-1">
                      </p>
                    </div>

                  </div>

                  <!-- Bid form placeholder (implemented in #47) -->
                  <p class="text-text-secondary text-sm">Bid form — coming in #47</p>

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
      this._renderBasicInfo(listing);  // #43
      this._renderDetails(listing);    // #45
      this._renderBidSummary(listing); // #46: current bid + bid count
      this._startCountdown(listing.endsAt); // #46: live timer
    } catch (err) {
      console.error('ListingView: failed to load listing', err);
      this._showError();
    }
  }

  // ─────────────────────────────────────────────
  // #43 — Basic info
  // ─────────────────────────────────────────────

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

  _renderDetails(listing) {
    const { description, tags, seller, created } = listing;
    this._renderDescription(description);
    this._renderTags(tags);
    this._renderSellerCard(seller, created);
  }

  _renderDescription(description) {
    const block = document.getElementById('listing-description-block');
    const el    = document.getElementById('listing-description');
    if (description?.trim()) {
      el.textContent = description;
    } else {
      block.classList.add('hidden');
    }
  }

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

  _renderSellerCard(seller, created) {
    if (!seller) return;

    const avatarUrl = seller.avatar?.url?.trim();
    if (avatarUrl) {
      const img = document.createElement('img');
      img.src = avatarUrl;
      img.alt = seller.name;
      img.className = 'w-full h-full object-cover';
      document.getElementById('seller-avatar').appendChild(img);
    }

    const profileLink = document.getElementById('seller-profile-link');
    profileLink.textContent = `@${seller.name}`;
    profileLink.href = `/profile/${seller.name}`;

    document.getElementById('listing-created-date').textContent =
      this._formatDate(created);
  }

  // ─────────────────────────────────────────────
  // #46 — Bid summary + Countdown timer
  // ─────────────────────────────────────────────

  /**
   * Populate current highest bid and total bid count.
   * @param {Object} listing
   */
  _renderBidSummary(listing) {
    const bids = listing.bids ?? [];
    const highest = bids.length
      ? Math.max(...bids.map((b) => b.amount))
      : 0;

    document.getElementById('listing-current-bid').textContent =
      `${highest.toLocaleString()} credits`;
    document.getElementById('listing-bid-count').textContent =
      `${bids.length} ${bids.length === 1 ? 'bid' : 'bids'}`;
  }

  /**
   * Start a live countdown that ticks every second.
   *
   * Visual states:
   *   > 24 h  →  "2d 14h 30m"          text-text-primary  (normal)
   *   < 24 h  →  "HH:MM:SS"            text-warning       (ending soon)
   *   ended   →  "Auction ended"        text-error         (stopped)
   *
   * Call destroy() to clear the interval when navigating away.
   * @param {string} endsAt - ISO date string from API
   */
  _startCountdown(endsAt) {
    const countdownEl  = document.getElementById('countdown');
    const endsDateEl   = document.getElementById('listing-ends-date');
    const statusBadge  = document.getElementById('listing-status-badge');
    const endDate      = new Date(endsAt);

    // Show the absolute end date/time once
    endsDateEl.textContent = endDate.toLocaleString('en-GB', {
      day:    'numeric',
      month:  'short',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    });

    const tick = () => {
      const diff = endDate - Date.now();

      // ── Ended ──
      if (diff <= 0) {
        countdownEl.textContent  = 'Auction ended';
        countdownEl.className    = 'text-xl sm:text-2xl font-semibold tabular-nums text-red-700';
        statusBadge.textContent  = 'Ended';
        statusBadge.className    = 'badge-error';
        clearInterval(this._countdownInterval);
        this._countdownInterval  = null;
        return;
      }

      const days    = Math.floor(diff / 86_400_000);
      const hours   = Math.floor((diff % 86_400_000) / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000)  / 60_000);
      const seconds = Math.floor((diff % 60_000)     / 1_000);

      // ── Ending soon: < 24 h ──
      if (diff < 86_400_000) {
        countdownEl.textContent =
          `${String(hours).padStart(2, '0')}:` +
          `${String(minutes).padStart(2, '0')}:` +
          `${String(seconds).padStart(2, '0')}`;
        countdownEl.className =
          'text-xl sm:text-2xl font-semibold tabular-nums text-amber-700';
        return;
      }

      // ── Active: > 24 h ──
      countdownEl.textContent =
        `${days}d ${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
      countdownEl.className =
        'text-xl sm:text-2xl font-semibold tabular-nums text-green-700';
    };

    tick(); // run immediately so there's no 1s blank
    this._countdownInterval = setInterval(tick, 1000);
  }

  /**
   * Clear the countdown interval.
   * Must be called by the router when navigating away from this view.
   */
  destroy() {
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = null;
    }
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

  _formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
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