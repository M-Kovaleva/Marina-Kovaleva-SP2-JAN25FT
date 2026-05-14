/**
 * Listing View — single listing page.
 *
 * Thin: owns the HTML template and the lifecycle hooks only.
 * All data loading and DOM mutation lives in handlers:
 *   - listingDetailHandler — orchestrator: gallery, info, seller, summary,
 *                            countdown, bid history, owner actions
 *   - bidFormHandler       — bid form state machine + place bid
 */

import {
  initListingDetail,
  cleanupListingDetail,
} from '../handlers/listingDetailHandler.js';
import { spinnerHtml } from '../utils/format.js';

export class ListingView {
  constructor(params) {
    this.params = params;
    this.listingId = params.id;
  }

  async render() {
    return listingDetailTemplate();
  }

  async init() {
    await initListingDetail(this.listingId);
  }

  destroy() {
    cleanupListingDetail();
  }
}

// ─────────────────────────────────────────────
// Template (pure HTML, no DOM access, no state)
// ─────────────────────────────────────────────

function listingDetailTemplate() {
  return `
    <div class="page-container">

      <!-- Loading state -->
      <div id="listing-loading" class="flex flex-col items-center justify-center py-24 gap-4">
        ${spinnerHtml('w-10 h-10')}
        <p class="text-text-secondary text-sm">Loading listing...</p>
      </div>

      <!-- Error / 404 state -->
      <div id="listing-error" class="hidden text-center py-24">
        <h2 class="text-xl font-bold text-text-primary mb-2">Listing not found</h2>
        <p class="text-text-secondary mb-6">
          This listing may have been removed or the link is invalid.
        </p>
        <a href="/" data-link class="btn-primary">Explore listings</a>
      </div>

      <!-- Main content -->
      <div id="listing-content" class="hidden">

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          <!-- Left: Image Gallery -->
          <div class="space-y-3">

            <!-- Main image -->
            <div class="rounded-xl overflow-hidden aspect-square bg-surface">
              <img
                id="gallery-main"
                src=""
                alt=""
                class="w-full h-full object-cover transition-opacity duration-200 opacity-0"
              />
            </div>

            <!-- Thumbnails — hidden when 0 or 1 image -->
            <div
              id="gallery-thumbnails"
              class="hidden grid-cols-5 gap-2">
            </div>

          </div>

          <!-- Right: Details column -->
          <div class="space-y-5">

            <!-- Status badge -->
            <div class="flex flex-wrap items-center gap-2">
              <span id="listing-status-badge" class="badge-success">Active</span>
            </div>

            <!-- Title + owner actions -->
            <div class="flex items-start justify-between gap-3 min-w-0">
              <h1 id="listing-title"
                class="text-2xl sm:text-3xl font-bold text-text-primary leading-tight break-words min-w-0">
              </h1>

              <!-- Owner-only actions, toggled by listingDetailHandler -->
              <div id="owner-actions" class="hidden flex-shrink-0 flex gap-2">
                <a id="edit-listing-btn" href="#" data-link
                  class="btn-secondary text-sm">
                  Edit
                </a>
                <button id="delete-listing-btn" type="button"
                  class="btn-danger text-sm">
                  Delete
                </button>
              </div>
            </div>

            <!-- Description -->
            <div id="listing-description-block">
              <h2 class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Description
              </h2>
              <p id="listing-description"
                class="text-text-primary leading-relaxed whitespace-pre-line break-words">
              </p>
            </div>

            <!-- Seller card -->
            <div class="flex items-center gap-3 py-4 bg-surface rounded-xl">
              <div id="seller-avatar"
                class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
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

            <!-- Bid card -->
            <div class="card">
              <div class="card-body space-y-5">

                <!-- Current bid + countdown -->
                <div class="flex flex-col sm:flex-row sm:justify-between gap-4">
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

                <!-- Bid form states (mutually exclusive) -->

                <!-- State A: Auction ended -->
                <div id="state-ended" class="hidden text-center py-2">
                  <p class="text-red-700 text-sm font-medium">This auction has ended.</p>
                </div>

                <!-- State B: Guest -->
                <div id="state-guest" class="hidden space-y-3 text-center py-2">
                  <p class="text-text-secondary text-sm">Sign in to place a bid</p>
                  <button type="button" data-action="login-required" class="btn-primary w-full py-3">
                    Place bid
                  </button>
                </div>

                <!-- State C: Own listing -->
                <div id="state-own" class="hidden text-center py-2">
                  <p class="text-text-secondary text-sm">
                    You cannot bid on your own listing.
                  </p>
                </div>

                <!-- State E: User already has the highest bid -->
                <div id="state-winning" class="hidden text-center py-2">
                  <p class="text-text-secondary text-xs">
                    You can place a new bid once someone outbids you.
                  </p>
                </div>

                <!-- State D: Bid form -->
                <form id="bid-form" class="hidden space-y-3" novalidate>
                  <div>
                    <label for="bid-amount" class="label">Your bid (credits)</label>
                    <input
                      type="number"
                      id="bid-amount"
                      name="amount"
                      min="1"
                      class="input"
                      required
                    />
                    <p id="bid-hint" class="hint"></p>
                  </div>

                  <!-- Inline error -->
                  <div id="bid-error" class="hidden p-3 bg-error/10 border border-error/20 rounded-lg">
                    <p class="alert-error"></p>
                  </div>

                  <button type="submit" id="bid-submit" class="btn-primary w-full py-3">
                    Place bid
                  </button>
                </form>

              </div>
            </div>

          </div>
        </div>

        <!-- Bid History -->
        <section class="mt-10 sm:mt-14">
          <h2 class="text-lg sm:text-xl font-bold text-text-primary mb-4">Bid History</h2>
          <div class="card overflow-hidden">
            <div id="bid-history" class="divide-y divide-border">
            </div>
          </div>
        </section>

      </div><!-- /#listing-content -->
    </div>
  `;
}