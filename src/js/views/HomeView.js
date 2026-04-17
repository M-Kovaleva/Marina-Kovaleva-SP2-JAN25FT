/**
 * Home View — Listings feed
 */
export class HomeView {
  constructor(params) {
    this.params = params;
  }

  async render() {
    return `
      <div class="page-container">
        <!-- Header -->
        <div class="mb-6 sm:mb-8">
          <h1 class="page-title">Explore Listings</h1>
          <p class="page-subtitle">Browse and bid on items from Noroff students</p>
        </div>
        
        <!-- Search & Filter Bar -->
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div class="flex-1">
            <div class="relative">
              <input
                type="search"
                id="search-input"
                placeholder="Search listings..."
                class="input pl-10"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
          
          <div class="flex gap-3">
            <select class="input w-full sm:w-auto" id="sort-select">
              <option value="newest">Newest First</option>
              <option value="ending">Ending Soon</option>
              <option value="popular">Most Bids</option>
            </select>
            
            <button class="btn-secondary px-3 sm:hidden" aria-label="Filter">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Listings Grid -->
        <div id="listings-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <!-- Loading State -->
          <div class="col-span-full">
            <div class="card p-6 sm:p-8">
              <div class="flex flex-col items-center justify-center py-8 sm:py-12">
                <div class="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                <p class="text-text-secondary text-sm sm:text-base">Loading listings...</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="flex justify-center items-center gap-2 mt-8 sm:mt-12">
          <button class="btn-secondary px-3 py-2 text-sm" disabled>
            ← Previous
          </button>
          <span class="px-4 py-2 text-text-secondary text-sm">Page 1 of 1</span>
          <button class="btn-secondary px-3 py-2 text-sm" disabled>
            Next →
          </button>
        </div>
      </div>
    `;
  }

  async init() {
    // Load listings from API later
  }
}