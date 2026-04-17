/**
 * Profile View
 */
export class ProfileView {
  constructor(params) {
    this.params = params;
    this.profileName = params.name || null;
  }

  async render() {
    return `
      <div class="page-container">
        <!-- Profile Header Card -->
        <div class="card overflow-hidden mb-6 sm:mb-8">
          <!-- Banner -->
          <div class="h-24 sm:h-32 lg:h-40 bg-gradient-to-r from-primary-500 to-primary-600"></div>
          
          <!-- Avatar & Info -->
          <div class="px-4 sm:px-6 pb-6">
            <div class="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12 mb-4">
              <!-- Avatar -->
              <div class="w-20 h-20 sm:w-24 sm:h-24 bg-surface border-4 border-white rounded-full flex items-center justify-center shadow-md">
                <span class="text-xl sm:text-2xl font-bold text-text-secondary">?</span>
              </div>
              
              <!-- Name & Username -->
              <div class="sm:mb-2">
                <h1 class="text-xl sm:text-2xl font-bold text-text-primary">
                  ${this.profileName || 'My Profile'}
                </h1>
                <p class="text-text-secondary text-sm sm:text-base">@username</p>
              </div>
              
              <!-- Edit Button (desktop) -->
              <div class="hidden sm:block sm:ml-auto">
                <button class="btn-secondary text-sm">
                  Edit Profile
                </button>
              </div>
            </div>
            
            <!-- Stats -->
            <div class="flex flex-wrap gap-4 sm:gap-6 lg:gap-8">
              <div class="text-center sm:text-left">
                <p class="text-xl sm:text-2xl font-bold text-primary-500">1000</p>
                <p class="text-xs sm:text-sm text-text-secondary">Credits</p>
              </div>
              <div class="text-center sm:text-left">
                <p class="text-xl sm:text-2xl font-bold text-text-primary">0</p>
                <p class="text-xs sm:text-sm text-text-secondary">Listings</p>
              </div>
              <div class="text-center sm:text-left">
                <p class="text-xl sm:text-2xl font-bold text-text-primary">0</p>
                <p class="text-xs sm:text-sm text-text-secondary">Wins</p>
              </div>
            </div>
            
            <!-- Edit Button (mobile) -->
            <div class="sm:hidden mt-4">
              <button class="btn-secondary w-full text-sm">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
        
        <!-- Tabs -->
        <div class="border-b border-border mb-6">
          <nav class="flex gap-4 sm:gap-6 overflow-x-auto">
            <button class="pb-3 text-primary-500 border-b-2 border-primary-500 font-semibold whitespace-nowrap text-sm sm:text-base">
              My Listings
            </button>
            <button class="pb-3 text-text-secondary hover:text-text-primary whitespace-nowrap text-sm sm:text-base transition-colors">
              My Bids
            </button>
            <button class="pb-3 text-text-secondary hover:text-text-primary whitespace-nowrap text-sm sm:text-base transition-colors">
              Wins
            </button>
          </nav>
        </div>
        
        <!-- Content Grid -->
        <div id="profile-content" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <!-- Empty State -->
          <div class="col-span-full text-center py-12 sm:py-16">
            <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center">
              <span class="text-2xl sm:text-3xl">📦</span>
            </div>
            <h3 class="text-lg font-semibold text-text-primary mb-2">No listings yet</h3>
            <p class="text-text-secondary mb-6 text-sm sm:text-base">Create your first listing to start selling</p>
            <a href="/listing/create" data-link class="btn-primary">
              + Create Listing
            </a>
          </div>
        </div>
      </div>
    `;
  }

  async init() {
    // Load profile from API later
  }
}