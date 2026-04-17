/**
 * Single Listing View
 */
export class ListingView {
  constructor(params) {
    this.params = params;
    this.listingId = params.id;
  }

  async render() {
    return `
      <div class="page-container">
        <!-- Back Link -->
        <a href="/" data-link class="inline-flex items-center gap-2 text-text-secondary hover:text-primary-500 mb-6 text-sm sm:text-base transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to listings
        </a>
        
        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <!-- Image Gallery -->
          <div class="space-y-4">
            <!-- Main Image -->
            <div class="bg-surface rounded-xl aspect-square flex items-center justify-center overflow-hidden">
              <div id="main-image" class="w-full h-full flex items-center justify-center">
                <span class="text-text-secondary">Loading image...</span>
              </div>
            </div>
            
            <!-- Thumbnail Gallery -->
            <div id="thumbnails" class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
              <!-- Thumbnails will be added here -->
            </div>
          </div>
          
          <!-- Details -->
          <div class="space-y-6">
            <!-- Title & Seller -->
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="badge-success">Active</span>
                <span class="text-text-secondary text-sm">Listed by @seller</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-bold text-text-primary">
                Listing Title
              </h1>
            </div>
            
            <!-- Description -->
            <div>
              <h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-2">Description</h2>
              <p class="text-text-primary leading-relaxed">
                Listing description will appear here. This is where the seller describes 
                what they're selling, its condition, and any other relevant details.
              </p>
            </div>
            
            <!-- Tags -->
            <div>
              <h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-2">Tags</h2>
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-surface text-text-secondary text-sm rounded-full">electronics</span>
                <span class="px-3 py-1 bg-surface text-text-secondary text-sm rounded-full">vintage</span>
              </div>
            </div>
            
            <!-- Bid Section -->
            <div class="card">
              <div class="card-body">
                <!-- Current Bid & Timer -->
                <div class="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
                  <div>
                    <p class="text-sm text-text-secondary mb-1">Current bid</p>
                    <p class="text-2xl sm:text-3xl font-bold text-primary-500">0 credits</p>
                    <p class="text-xs text-text-secondary mt-1">0 bids</p>
                  </div>
                  <div class="sm:text-right">
                    <p class="text-sm text-text-secondary mb-1">Ends in</p>
                    <p id="countdown" class="text-xl sm:text-2xl font-semibold text-text-primary">--:--:--</p>
                    <p class="text-xs text-text-secondary mt-1">Jan 1, 2025 at 12:00</p>
                  </div>
                </div>
                
                <!-- Bid Form -->
                <form id="bid-form" class="space-y-4">
                  <div>
                    <label for="bid-amount" class="label">Your bid (credits)</label>
                    <input
                      type="number"
                      id="bid-amount"
                      name="amount"
                      min="1"
                      placeholder="Enter amount"
                      class="input"
                      required
                    />
                    <p class="hint">Minimum bid: 1 credit</p>
                  </div>
                  
                  <button type="submit" class="btn-primary w-full py-3">
                    Place Bid
                  </button>
                </form>
                
                <!-- Login prompt for guests -->
                <div id="login-prompt" class="hidden text-center py-4">
                  <p class="text-text-secondary mb-4">Sign in to place a bid</p>
                  <a href="/login" data-link class="btn-primary">
                    Sign In
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Bid History -->
        <div class="mt-8 sm:mt-12">
          <h2 class="text-lg sm:text-xl font-bold text-text-primary mb-4 sm:mb-6">Bid History</h2>
          
          <div class="card">
            <div class="divide-y divide-border" id="bid-history">
              <!-- Empty State -->
              <div class="p-6 sm:p-8 text-center">
                <p class="text-text-secondary">No bids yet. Be the first to bid!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    // Load listing from API later
  }
}