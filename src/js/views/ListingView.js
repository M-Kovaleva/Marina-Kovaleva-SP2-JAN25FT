/**
 * Single Listing View
 * #43 — Build Single Listing page layout     ✅ done
 * #45 — Display listing details              ✅ done
 * #46 — Countdown timer                      ✅ done
 * #47a — Bid history component               ✅ done
 * #47b — Bid form component                  ✅ this commit
 *
 * Added in #47b:
 *  - Four mutually exclusive form states:
 *      ended / guest / own listing / bid form
 *  - Minimum bid validation (must exceed current highest)
 *  - Loading state on submit, inline error on failure
 *  - On success: refresh bid summary + history without page reload
 *  - Countdown → auto-switches to ended state when timer hits zero
 */

import { getListing, placeBid } from '../api/apiClient.js';
import { getUser, isLoggedIn, getUserCredits, updateUser } from '../auth/storage.js';

export class ListingView {
  constructor(params) {
    this.params    = params;
    this.listingId = params.id;
    this._countdownInterval = null;
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

              <!-- Bid card -->
              <div class="card">
                <div class="card-body space-y-5">

                  <!-- Current bid + countdown (#46) -->
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

                  <!-- ── #47b: Four bid form states ── -->

                  <!-- State A: Auction ended -->
                  <div id="state-ended" class="hidden text-center py-2">
                    <p class="text-red-700 text-sm font-medium">This auction has ended.</p>
                  </div>

                  <!-- State B: Guest -->
                  <div id="state-guest" class="hidden space-y-3 text-center py-2">
                    <p class="text-text-secondary text-sm">Sign in to place a bid</p>
                    <a href="/login" data-link class="btn-primary block">Sign in to bid</a>
                  </div>

                  <!-- State C: Own listing -->
                  <div id="state-own" class="hidden text-center py-2">
                    <p class="text-text-secondary text-sm">
                      You cannot bid on your own listing.
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
                      <p class="text-error text-sm font-medium"></p>
                    </div>

                    <button type="submit" id="bid-submit" class="btn-primary w-full py-3">
                      Place Bid
                    </button>
                  </form>

                </div>
              </div>

            </div>
          </div>

          <!-- Bid History (#47a) -->
          <section class="mt-10 sm:mt-14">
            <h2 class="text-lg sm:text-xl font-bold text-text-primary mb-4">Bid History</h2>
            <div class="card overflow-hidden">
              <div id="bid-history" class="divide-y divide-border max-h-[432px] overflow-y-auto">
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
      const listing  = response.data;

      this._showContent();
      this._renderBasicInfo(listing);
      this._renderDetails(listing);
      this._renderBidSummary(listing);
      this._startCountdown(listing.endsAt);
      this._renderBidForm(listing);         // #47b
      this._renderBidHistory(listing.bids);
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
      sellerLink.href        = `/profile/${seller.name}`;
    }

    const isActive = new Date(endsAt) > new Date();
    const badge    = document.getElementById('listing-status-badge');
    badge.textContent = isActive ? 'Active' : 'Ended';
    badge.className   = isActive ? 'badge-success' : 'badge-error';
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
      const img     = document.createElement('img');
      img.src       = avatarUrl;
      img.alt       = seller.name;
      img.className = 'w-full h-full object-cover';
      document.getElementById('seller-avatar').appendChild(img);
    }

    const profileLink       = document.getElementById('seller-profile-link');
    profileLink.textContent = `@${seller.name}`;
    profileLink.href        = `/profile/${seller.name}`;

    document.getElementById('listing-created-date').textContent =
      this._formatDate(created);
  }

  // ─────────────────────────────────────────────
  // #46 — Bid summary + Countdown
  // ─────────────────────────────────────────────

  _renderBidSummary(listing) {
    const bids    = listing.bids ?? [];
    const highest = bids.length ? Math.max(...bids.map((b) => b.amount)) : 0;

    document.getElementById('listing-current-bid').textContent =
      `${highest.toLocaleString()} credits`;
    document.getElementById('listing-bid-count').textContent =
      `${bids.length} ${bids.length === 1 ? 'bid' : 'bids'}`;
  }

  _startCountdown(endsAt) {
    const countdownEl = document.getElementById('countdown');
    const endsDateEl  = document.getElementById('listing-ends-date');
    const statusBadge = document.getElementById('listing-status-badge');
    const endDate     = new Date(endsAt);

    endsDateEl.textContent = endDate.toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const tick = () => {
      const diff = endDate - Date.now();

      if (diff <= 0) {
        countdownEl.textContent = 'Auction ended';
        countdownEl.className   =
          'text-xl sm:text-2xl font-semibold tabular-nums text-red-700';
        statusBadge.textContent = 'Ended';
        statusBadge.className   = 'badge-error';
        clearInterval(this._countdownInterval);
        this._countdownInterval = null;
        // Switch bid form to ended state live
        this._showState('state-ended');
        return;
      }

      const days    = Math.floor(diff / 86_400_000);
      const hours   = Math.floor((diff % 86_400_000) / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000)  / 60_000);
      const seconds = Math.floor((diff % 60_000)     / 1_000);

      if (diff < 86_400_000) {
        countdownEl.textContent =
          `${String(hours).padStart(2, '0')}:` +
          `${String(minutes).padStart(2, '0')}:` +
          `${String(seconds).padStart(2, '0')}`;
        countdownEl.className =
          'text-xl sm:text-2xl font-semibold tabular-nums text-amber-700';
        return;
      }

      countdownEl.textContent =
        `${days}d ${hours}h ${String(minutes).padStart(2, '0')}m ` +
        `${String(seconds).padStart(2, '0')}s`;
      countdownEl.className =
        'text-xl sm:text-2xl font-semibold tabular-nums text-green-700';
    };

    tick();
    this._countdownInterval = setInterval(tick, 1000);
  }

  destroy() {
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = null;
    }
  }

  // ─────────────────────────────────────────────
  // #47b — Bid form
  // ─────────────────────────────────────────────

  /**
   * Decide which of four states to show — exactly one at a time.
   * Order matters: ended → guest → own → form.
   * @param {Object} listing
   */
  _renderBidForm(listing) {
    // State A: ended
    if (new Date(listing.endsAt) <= new Date()) {
      this._showState('state-ended');
      return;
    }

    // State B: guest
    if (!isLoggedIn()) {
      this._showState('state-guest');
      return;
    }

    // State C: own listing
    if (listing.seller?.name === getUser()?.name) {
      this._showState('state-own');
      return;
    }

    // State D: bid form
    this._showState('bid-form');
    this._setupBidForm(listing);
  }

  /**
   * Set min value, hint text, and attach submit handler.
   * @param {Object} listing
   */
  _setupBidForm(listing) {
    const bids        = listing.bids ?? [];
    const highest     = bids.length ? Math.max(...bids.map((b) => b.amount)) : 0;
    const minBid      = highest + 1;
    const userCredits = getUserCredits() ?? 0;

    const input       = document.getElementById('bid-amount');
    input.min         = minBid;
    input.max         = userCredits;
    input.placeholder = `Min: ${minBid}`;

    document.getElementById('bid-hint').textContent =
      `Minimum: ${minBid} cr · Your balance: ${userCredits.toLocaleString()} cr`;

    document.getElementById('bid-form').addEventListener('submit', (e) =>
      this._handleBidSubmit(e, listing.id, minBid, userCredits)
    );
  }

  /**
   * Handle form submission.
   *
   * Success flow:
   *   1. Show loading on button
   *   2. Call placeBid API
   *   3. After 1s: re-fetch listing, refresh summary + history + form hint
   *
   * Error flow:
   *   Show inline error, re-enable button.
   *
   * @param {Event}  e
   * @param {string} listingId
   * @param {number} minBid     - minimum valid amount at time of setup
   */
  async _handleBidSubmit(e, listingId, minBid, userCredits) {
    e.preventDefault();

    const input     = document.getElementById('bid-amount');
    const submitBtn = document.getElementById('bid-submit');
    const amount    = Number(input.value);

    // Client-side validation
    if (!amount || amount < minBid) {
      this._showBidError(`Bid must be at least ${minBid} credits.`);
      return;
    }
    if (amount > userCredits) {
      this._showBidError(
        `You only have ${userCredits.toLocaleString()} credits available.`
      );
      return;
    }

    // Loading state
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Placing bid…';
    this._hideBidError();

    try {
      await placeBid(listingId, amount);

      // Success feedback
      submitBtn.textContent = '✓ Bid placed!';

      // Re-fetch and refresh after short delay
      setTimeout(async () => {
        const response = await getListing(listingId, true, true);
        const updated  = response.data;

        this._renderBidSummary(updated);
        this._renderBidHistory(updated.bids);
        this._refreshBidHint(updated.bids, userCredits - amount);

        // Deduct bid from local user credits and update nav badge
        const newCredits = userCredits - amount;
        updateUser({ credits: newCredits });
        this._updateCreditsDisplay(newCredits);

        input.value           = '';
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Place Bid';
      }, 1000);
    } catch (err) {
      this._showBidError(err.message || 'Could not place bid. Try again.');
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Place Bid';
    }
  }

  /**
   * Update min value and hint text after a successful bid.
   * @param {Array} bids - updated bids array from API
   */
  /**
   * Update min value, max value, and hint text after a successful bid.
   * @param {Array}  bids        - updated bids from API
   * @param {number} newCredits  - user's remaining credits after deduction
   */
  _refreshBidHint(bids, newCredits) {
    const highest = bids.length ? Math.max(...bids.map((b) => b.amount)) : 0;
    const newMin  = highest + 1;

    const input       = document.getElementById('bid-amount');
    input.min         = newMin;
    input.max         = newCredits;
    input.placeholder = `Min: ${newMin}`;

    document.getElementById('bid-hint').textContent =
      `Minimum: ${newMin} cr · Your balance: ${newCredits.toLocaleString()} cr`;
  }

  /**
   * Update the credits badge in the navbar (desktop + mobile).
   * Reads the same element IDs used by Nav.js.
   * @param {number} credits
   */
  _updateCreditsDisplay(credits) {
    const formatted = credits.toLocaleString();

    const desktopAmount = document.getElementById('credits-amount');
    const mobileAmount  = document.getElementById('credits-amount-mobile');
    const desktopBadge  = document.getElementById('credits-badge');
    const mobileBadge   = document.getElementById('credits-badge-mobile');

    if (desktopAmount) desktopAmount.textContent = formatted;
    if (mobileAmount)  mobileAmount.textContent  = formatted;
    if (desktopBadge)  desktopBadge.style.display = 'flex';
    if (mobileBadge)   mobileBadge.style.display  = 'flex';
  }

  // ─────────────────────────────────────────────
  // #47a — Bid history
  // ─────────────────────────────────────────────

  _renderBidHistory(bids) {
    const container   = document.getElementById('bid-history');
    const currentUser = getUser();

    if (!bids?.length) {
      container.innerHTML = `
        <div class="p-8 text-center">
          <p class="text-text-secondary">No bids yet. Be the first!</p>
        </div>`;
      return;
    }

    const sorted = [...bids].sort((a, b) => b.amount - a.amount);

    container.innerHTML = sorted
      .map((bid, i) => {
        const isHighest = i === 0;
        const isOwn     = currentUser?.name && bid.bidder?.name === currentUser.name;

        const avatarHtml = bid.bidder?.avatar?.url
          ? `<img
               src="${this._escHtml(bid.bidder.avatar.url)}"
               alt="${this._escHtml(bid.bidder.name ?? '')}"
               class="w-full h-full object-cover"
             />`
          : '';

        return `
          <div class="flex items-center gap-4 px-5 py-4
                      ${isHighest ? 'bg-primary-50' : ''}
                      ${isOwn && !isHighest ? 'bg-warning/5' : ''}">

            <div class="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-primary-100">
              ${avatarHtml}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <a href="/profile/${this._escHtml(bid.bidder?.name ?? '')}"
                   data-link
                   class="font-semibold text-sm text-text-primary
                          hover:text-primary-500 transition-colors truncate">
                  @${this._escHtml(bid.bidder?.name ?? 'Unknown')}
                </a>
                ${isHighest ? '<span class="badge-success">Highest bid</span>' : ''}
                ${isOwn     ? '<span class="badge-warning">You</span>'         : ''}
              </div>
              <p class="text-xs text-text-secondary mt-0.5">
                ${this._timeAgo(bid.created)}
              </p>
            </div>

            <p class="font-bold text-sm flex-shrink-0
                      ${isHighest ? 'text-primary-600' : 'text-text-primary'}">
              ${bid.amount.toLocaleString()}
              <span class="font-normal text-text-secondary text-xs">credits</span>
            </p>

          </div>`;
      })
      .join('');
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

  /** Show one bid-form state, hide the other three */
  _showState(id) {
    ['state-ended', 'state-guest', 'state-own', 'bid-form'].forEach((s) =>
      document.getElementById(s)?.classList.add('hidden')
    );
    document.getElementById(id)?.classList.remove('hidden');
  }

  _showBidError(message) {
    const el = document.getElementById('bid-error');
    el.classList.remove('hidden');
    el.querySelector('p').textContent = message;
  }

  _hideBidError() {
    document.getElementById('bid-error')?.classList.add('hidden');
  }

  _formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  _timeAgo(dateStr) {
    const diff    = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours   = Math.floor(diff / 3_600_000);
    const days    = Math.floor(diff / 86_400_000);

    if (minutes < 1)  return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours   < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
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