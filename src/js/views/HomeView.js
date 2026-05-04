/**
 * Home View — Listings feed
 */

import { initListingsHandler, cleanupListingsHandler } from '../handlers/listingsHandler.js';
import { getListings } from '../api/apiClient.js';

export class HomeView {
  constructor(params) {
    this.params = params;
  }

  async render() {
    return `
      <!-- Hero Section: hottest active listing or fallback -->
      <section id="hero" class="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-12 sm:py-16 lg:py-20">
        <div class="max-w-6xl mx-auto px-4">

          <!-- Loading skeleton -->
          <div id="hero-loading" class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
            <div class="space-y-4 order-2 md:order-1">
              <div class="h-4 w-24 bg-white/20 rounded"></div>
              <div class="h-10 w-3/4 bg-white/20 rounded"></div>
              <div class="h-4 w-full bg-white/15 rounded"></div>
              <div class="h-4 w-2/3 bg-white/15 rounded"></div>
            </div>
            <div class="aspect-[4/3] bg-white/10 rounded-2xl order-1 md:order-2"></div>
          </div>

          <!-- Hot listing — populated via JS -->
          <div id="hero-listing"
            class="hidden grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">

            <!-- Text column -->
            <div class="order-2 md:order-1">
              <span class="inline-block text-xs font-semibold uppercase tracking-wider
                           bg-white/20 px-3 py-1 rounded-full mb-4">
                🔥 Hottest auction
              </span>

              <h1 id="hero-title"
                class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                style="font-family: var(--font-heading);">
              </h1>

              <p id="hero-description"
                class="text-primary-100 text-base sm:text-lg mb-6 line-clamp-2">
              </p>

              <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mb-6">
                <div>
                  <span class="text-primary-200 text-xs uppercase tracking-wider">Current bid</span>
                  <p id="hero-bid" class="text-2xl sm:text-3xl font-bold"></p>
                </div>
                <div class="text-primary-100">
                  <span id="hero-bid-count" class="font-semibold"></span>
                  <span class="ml-3 text-primary-200" id="hero-ends"></span>
                </div>
              </div>

              <!-- CTA -->
              <a id="hero-cta" href="#" data-link
                class="inline-block bg-white text-primary-600 hover:bg-primary-50
                       font-semibold px-6 py-3 rounded-lg transition-colors">
                View auction
              </a>
            </div>

            <!-- Image column — clickable, links to listing -->
            <a id="hero-image-link" href="#" data-link
              class="aspect-[4/3] rounded-2xl overflow-hidden bg-white/10 order-1 md:order-2
                     shadow-2xl">
              <img id="hero-image" src="" alt=""
                class="w-full h-full object-cover" />
            </a>
          </div>

          <!-- Fallback (no active listings) -->
          <div id="hero-fallback" class="hidden text-center max-w-2xl mx-auto">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                style="font-family: var(--font-heading);">
              Student Auction Platform
            </h1>
            <p class="text-primary-100 text-lg sm:text-xl">
              Buy and sell with your fellow Noroff students.
              Start bidding or create your own listing today.
            </p>
          </div>

        </div>
      </section>

      <div class="page-container" id="listings">
        <!-- Search & Filter Bar -->
        <div class="bg-white rounded-xl shadow-sm border border-border p-4 mb-6 sm:mb-8 -mt-6 relative z-10">
          <div class="flex flex-col lg:flex-row gap-4">
            <!-- Search Input -->
            <div class="flex-1">
              <div class="relative">
                <input
                  type="search"
                  id="search-input"
                  placeholder="Search listings..."
                  class="input pl-10 pr-10"
                />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>
            
            <!-- Filters -->
            <div class="flex items-center gap-3">
              <!-- Active Only Toggle -->
              <label class="flex items-center gap-2 cursor-pointer px-3 py-2 bg-surface rounded-lg border border-border whitespace-nowrap">
                <input
                  type="checkbox"
                  id="active-filter"
                  checked
                  class="w-4 h-4 accent-primary-500 rounded"
                />
                <span class="text-sm text-text-secondary">Active only</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Search Results Info -->
        <div id="search-info" class="hidden mb-4">
          <div class="flex items-center justify-between">
            <p class="text-text-secondary">
              <span id="results-count">0</span> results for "<span id="search-query" class="font-medium text-text-primary"></span>"
            </p>
            <button id="clear-filters" class="text-primary-500 hover:text-primary-600 text-sm font-medium">
              Clear all filters
            </button>
          </div>
        </div>
        
        <!-- Listings Grid -->
        <div id="listings-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        </div>
        
        <!-- Empty State -->
        <div id="empty-state" class="hidden">
          <div class="text-center py-12 sm:py-16">
            <div class="text-5xl sm:text-6xl mb-4">🔍</div>
            <h3 class="text-xl sm:text-2xl font-semibold text-text-primary mb-2">No listings found</h3>
            <p class="text-text-secondary mb-6 max-w-md mx-auto">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button id="reset-filters" class="btn-primary">Clear all filters</button>
          </div>
        </div>
        
        <!-- Error State -->
        <div id="error-state" class="hidden">
          <div class="text-center py-12 sm:py-16">
            <div class="text-5xl sm:text-6xl mb-4">😕</div>
            <h3 class="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Something went wrong</h3>
            <p id="error-message" class="text-text-secondary mb-6 max-w-md mx-auto">
              We couldn't load the listings. Please try again.
            </p>
            <button id="retry-btn" class="btn-primary">Try again</button>
          </div>
        </div>
        
        <!-- Load More Container -->
        <div id="load-more-container" class="mt-4"></div>
        
        <!-- Total Count -->
        <p id="total-count" class="text-center text-text-secondary text-sm mt-4">
          Showing <span id="showing-count">0</span> of <span id="total-listings">0</span> listings
        </p>
      </div>
    `;
  }

  async init() {
    // Hero is independent of the feed — load it in parallel
    this._loadHero();

    await initListingsHandler();
  }

  /**
   * Find and render the hottest active listing for the hero section.
   * "Hottest" = active auction with the most bids.
   * Falls back to a generic welcome message if none exist.
   */
  async _loadHero() {
    const loadingEl  = document.getElementById('hero-loading');
    const listingEl  = document.getElementById('hero-listing');
    const fallbackEl = document.getElementById('hero-fallback');

    try {
      // Pull a generous batch of active listings, then pick the hottest
      const response = await getListings({
        _active: true,
        _bids:   true,
        limit:   100,
      });
      const all = response.data ?? [];

      // Pick the one with the most bids (server doesn't sort by this)
      const hot = all
        .filter((l) => l._count?.bids > 0)
        .sort((a, b) => (b._count?.bids ?? 0) - (a._count?.bids ?? 0))[0];

      loadingEl.classList.add('hidden');

      if (!hot) {
        fallbackEl.classList.remove('hidden');
        return;
      }

      this._renderHero(hot);
      listingEl.classList.remove('hidden');
      listingEl.style.display = 'grid'; // override .hidden when becoming visible
    } catch {
      loadingEl.classList.add('hidden');
      fallbackEl.classList.remove('hidden');
    }
  }

  /**
   * Populate hero DOM from a listing object.
   * @param {Object} listing
   */
  _renderHero(listing) {
    const href = `/listing/${listing.id}`;
    document.getElementById('hero-image-link').href = href;
    document.getElementById('hero-cta').href = href;

    document.getElementById('hero-title').textContent =
      listing.title || 'Untitled listing';

    const desc = document.getElementById('hero-description');
    if (listing.description?.trim()) {
      desc.textContent = listing.description;
    } else {
      desc.classList.add('hidden');
    }

    // Highest bid
    const bids = listing.bids ?? [];
    const top  = bids.length ? Math.max(...bids.map((b) => b.amount)) : 0;
    document.getElementById('hero-bid').textContent =
      `${top.toLocaleString()} cr`;

    // Bid count
    const count = listing._count?.bids ?? bids.length;
    document.getElementById('hero-bid-count').textContent =
      `${count} ${count === 1 ? 'bid' : 'bids'}`;

    // Time remaining (compact)
    document.getElementById('hero-ends').textContent =
      `Ends in ${this._formatTimeLeft(listing.endsAt)}`;

    // Image
    const img = document.getElementById('hero-image');
    const url = listing.media?.[0]?.url;
    if (url) {
      img.src = url;
      img.alt = listing.media[0].alt || listing.title || '';
    } else {
      // Hide image column when no media — let text expand
      document.getElementById('hero-image-link').classList.add('hidden');
    }
  }

  /**
   * Compact "time until" string for hero (e.g. "2d 3h", "5h 23m", "12m").
   * @param {string} endsAt - ISO date
   * @returns {string}
   */
  _formatTimeLeft(endsAt) {
    const diff = new Date(endsAt) - Date.now();
    if (diff <= 0) return 'soon';
    const days    = Math.floor(diff / 86_400_000);
    const hours   = Math.floor((diff % 86_400_000) / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000)  / 60_000);
    if (days > 0)  return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  /**
   * Called by router before navigating away.
   * Removes the scroll event listener from listingsHandler
   * so it doesn't fire on other pages that happen to have
   * an element with id="listings-grid".
   */
  destroy() {
    cleanupListingsHandler();
  }
}