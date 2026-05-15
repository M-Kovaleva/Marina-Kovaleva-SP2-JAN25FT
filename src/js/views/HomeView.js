/* Home view — Listings feed with hero section */

import { initHero } from '../handlers/heroHandler.js';
import { initListingsHandler, cleanupListingsHandler } from '../handlers/listingsHandler.js';

export class HomeView {
  constructor(params) {
    this.params = params;
  }

  async render() {
    return `
      ${heroTemplate()}
      ${listingsTemplate()}
    `;
  }

  async init() {
    initHero();
    await initListingsHandler();
  }

  destroy() {
    cleanupListingsHandler();
  }
}

function heroTemplate() {
  return `
    <section id="hero" class="bg-linear-to-br from-primary-500 to-primary-700 text-white py-12 sm:py-16 lg:py-20">
      <div class="max-w-6xl mx-auto px-4">

        <!-- Loading skeleton -->
        <div id="hero-loading" class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
          <div class="space-y-4 order-2 md:order-1">
            <div class="h-4 w-24 bg-white/20 rounded"></div>
            <div class="h-10 w-3/4 bg-white/20 rounded"></div>
            <div class="h-4 w-full bg-white/15 rounded"></div>
            <div class="h-4 w-2/3 bg-white/15 rounded"></div>
          </div>
          <div class="aspect-4/3 bg-white/10 rounded-2xl order-1 md:order-2"></div>
        </div>

        <!-- Hot listing — populated by heroHandler -->
        <div id="hero-listing"
          class="hero-listing-grid hidden">

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
              class="text-white text-base sm:text-lg mb-6 line-clamp-2">
            </p>

            <div class="flex flex-col gap-2 text-sm mb-6">
              <div>
                <span class="text-white text-xs uppercase tracking-wider">Current bid</span>
                <p id="hero-bid" class="text-2xl sm:text-3xl font-bold"></p>
              </div>
              <div class="text-white">
                <span id="hero-bid-count" class="font-semibold"></span>
              </div>
              <div class="text-white">
                <span id="hero-ends"></span>
              </div>
            </div>

            <a id="hero-cta" href="#" data-link
              class="inline-block bg-white text-primary-600 hover:bg-primary-50
                     font-semibold text-sm px-3 py-2 rounded-lg transition-colors">
              View auction
            </a>
          </div>

          <!-- Image column -->
          <a id="hero-image-link" href="#" data-link
            class="aspect-4/3 rounded-2xl overflow-hidden bg-white/10 order-1 md:order-2
                   shadow-2xl">
            <img id="hero-image" src="" alt=""
              class="w-full h-full object-cover" />
          </a>
        </div>

        <!-- Fallback (no active listings with bids) -->
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
  `;
}

function listingsTemplate() {
  return `
    <div class="page-container" id="listings">

      <!-- Search & Filter Bar -->
      <div class="py-4 mb-6 sm:mb-8 -mt-6 relative z-10">
        <div class="flex flex-col lg:flex-row gap-4">

          <!-- Search input with icon button -->
          <div class="flex-1">
            <div class="relative">
              <input
                type="search"
                id="search-input"
                placeholder="Search listings..."
                class="input pl-10 text-center"
              />
              <button type="button" id="search-btn"
                class="absolute top-1/2 -translate-y-1/2 left-3 p-1
                       text-text-secondary hover:text-primary-500
                       transition-colors cursor-pointer"
                aria-label="Search">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Active-only filter -->
          <div class="flex items-center gap-3">
            <label for="active-filter" class="flex items-center gap-2 cursor-pointer py-2 whitespace-nowrap">
              <input
                type="checkbox"
                id="active-filter"
                checked
                class="w-4 h-4 accent-primary-500 rounded"
                aria-label="Search listings" 
              />
              <span class="text-sm text-text-secondary">Active only</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Search results header -->
      <div id="search-info" class="hidden mb-4" aria-live="polite" aria-atomic="true">
        <div class="flex items-center justify-between">
          <p class="text-text-secondary">
            <span id="results-count">0</span> results for "<span id="search-query" class="font-medium text-text-primary"></span>"
          </p>
          <button id="clear-filters" class="text-primary-500 hover:text-primary-600 text-sm font-medium">
            Clear all filters
          </button>
        </div>
      </div>

      <!-- Listings grid -->
      <div id="listings-grid" class="listing-cards-grid">
      </div>

      <!-- Empty state -->
      <div id="empty-state" class="hidden">
        <div class="text-center py-12 sm:py-16">
          <h3 class="text-xl sm:text-2xl font-semibold text-text-primary mb-2">No listings found</h3>
          <p class="text-text-secondary mb-6 max-w-md mx-auto">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <button id="reset-filters" class="btn-primary">Clear all filters</button>
        </div>
      </div>

      <!-- Error state -->
      <div id="error-state" class="hidden">
        <div class="text-center py-12 sm:py-16">
          <h3 class="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Something went wrong</h3>
          <p id="error-message" class="text-text-secondary mb-6 max-w-md mx-auto">
            We couldn't load the listings. Please try again.
          </p>
          <button id="retry-btn" class="btn-primary">Try again</button>
        </div>
      </div>

      <!-- Infinity-scroll sentinel -->
      <div id="load-more-container" class="mt-4"></div>

      <!-- Showing-count footer -->
      <p id="total-count" class="text-center text-text-secondary text-sm mt-4">
        Showing <span id="showing-count">0</span> of <span id="total-listings">0</span> listings
      </p>
    </div>
  `;
}
