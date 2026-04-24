/**
 * Home View — Listings feed
 */

import { initListingsHandler, cleanupListingsHandler } from '../handlers/listingsHandler.js';
import { isLoggedIn } from '../auth/storage.js';

export class HomeView {
  constructor(params) {
    this.params = params;
  }

  async render() {
    return `
      <!-- Hero Section -->
      <section class="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-12 sm:py-16 lg:py-20">
        <div class="max-w-6xl mx-auto px-4 text-center">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Student Auction Platform
          </h1>
          <p class="text-primary-100 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Buy and sell with your fellow Noroff students. Start bidding or create your own listing today.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#listings" class="btn-secondary bg-white text-primary-600 hover:bg-primary-50 px-6 py-3 text-base font-semibold">
              Browse Listings
            </a>
            <a href="/listing/create" data-link
              id="hero-create-btn"
              class="btn-primary bg-primary-800 hover:bg-primary-900 border-primary-800 px-6 py-3 text-base font-semibold">
              + Create Listing
            </a>
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
    // Guest: hero button redirects to login; logged-in: goes to create
    const heroBtn = document.getElementById('hero-create-btn');
    if (heroBtn && !isLoggedIn()) {
      heroBtn.href = '/login';
    }

    await initListingsHandler();
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