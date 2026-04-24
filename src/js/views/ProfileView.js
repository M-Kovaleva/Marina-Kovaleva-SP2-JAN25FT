/**
 * Profile View
 * #P1 — Profile header         ✅ done
 * #P2 — Listings tab        ✅ done
 * #P4 — Wins tab               ✅ this commit
 *
 * Added in #P2:
 * - Tabs: Listings / Bids / Wins
 * - Listings tab active by default
 * - Fetch GET /auction/profiles/:name/listings
 * - Render using createListingCards()
 * - Empty state with Create Listing button
 * - Tabs for Bids and Wins are placeholders (implemented in #P3–#P4)
 */

import { getProfile, getProfileListings, getProfileWins } from '../api/apiClient.js';
import { createListingCards } from '../components/ListingCard.js';
import { isLoggedIn, getUser } from '../auth/storage.js';
import { navigateTo } from '../router/router.js';

export class ProfileView {
  constructor(params) {
    this.params       = params;
    // /profile      → show own profile (name from localStorage)
    // /profile/:name → show that user's profile
    this.profileName  = params.name || getUser()?.name || null;
  }

  // ─────────────────────────────────────────────
  // RENDER — static shell
  // ─────────────────────────────────────────────

  async render() {
    return `
      <div class="page-container">

        <!-- Loading state -->
        <div id="profile-loading" class="flex flex-col items-center justify-center py-24 gap-4">
          <div class="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          <p class="text-text-secondary text-sm">Loading profile...</p>
        </div>

        <!-- Error / 404 state -->
        <div id="profile-error" class="hidden text-center py-24">
          <p class="text-5xl mb-4">😕</p>
          <h2 class="text-xl font-bold text-text-primary mb-2">Profile not found</h2>
          <p class="text-text-secondary mb-6">
            This profile may not exist or the link is invalid.
          </p>
          <a href="/" data-link class="btn-primary">Go home</a>
        </div>

        <!-- Main content -->
        <div id="profile-content" class="hidden">

          <!-- ── #P1: Profile Header Card ── -->
          <div class="card overflow-hidden mb-6 sm:mb-8">

            <!-- Banner -->
            <div id="profile-banner"
              class="h-24 sm:h-32 lg:h-40 bg-gradient-to-r from-primary-500 to-primary-600 overflow-hidden">
              <!-- Banner image injected by JS if available -->
            </div>

            <!-- Avatar + Info -->
            <div class="px-4 sm:px-6 pb-6">
              <div class="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12 mb-4">

                <!-- Avatar -->
                <div id="profile-avatar"
                  class="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden
                         border-4 border-white bg-primary-100 shadow-md flex-shrink-0">
                  <!-- Avatar image injected by JS if available -->
                </div>

                <!-- Name + bio -->
                <div class="sm:mb-2 flex-1 min-w-0">
                  <h1 id="profile-name"
                    class="text-xl sm:text-2xl font-bold text-text-primary truncate">
                  </h1>
                  <p id="profile-bio"
                    class="hidden text-text-secondary text-sm sm:text-base mt-1">
                  </p>
                </div>

                <!-- Edit button (desktop) — own profile only, injected by JS -->
                <div id="edit-btn-desktop" class="hidden sm:block sm:ml-auto sm:mb-2"></div>

              </div>

              <!-- Stats row -->
              <div class="flex flex-wrap gap-4 sm:gap-8">
                <!-- Credits — own profile only, shown by JS -->
                <div id="stat-credits" class="hidden text-center sm:text-left">
                  <p id="profile-credits"
                    class="text-xl sm:text-2xl font-bold text-primary-500">
                    —
                  </p>
                  <p class="text-xs sm:text-sm text-text-secondary">Credits</p>
                </div>

                <div class="text-center sm:text-left">
                  <p id="profile-listings-count"
                    class="text-xl sm:text-2xl font-bold text-text-primary">
                    —
                  </p>
                  <p class="text-xs sm:text-sm text-text-secondary">Listings</p>
                </div>

                <div class="text-center sm:text-left">
                  <p id="profile-wins-count"
                    class="text-xl sm:text-2xl font-bold text-text-primary">
                    —
                  </p>
                  <p class="text-xs sm:text-sm text-text-secondary">Wins</p>
                </div>
              </div>

              <!-- Edit button (mobile) — own profile only, injected by JS -->
              <div id="edit-btn-mobile" class="hidden sm:hidden mt-4"></div>

            </div>
          </div>

          <!-- ── #P2: Tabs + Content ── -->

          <!-- Tab navigation -->
          <div class="border-b border-border mb-6">
            <nav class="flex gap-1 overflow-x-auto">
              <button
                data-tab="listings"
                class="tab-btn tab-active pb-3 px-4 text-sm sm:text-base font-medium
                       whitespace-nowrap border-b-2 border-primary-500 text-primary-500">
                Listings
              </button>
              <button
                data-tab="bids"
                class="tab-btn pb-3 px-4 text-sm sm:text-base font-medium
                       whitespace-nowrap border-b-2 border-transparent
                       text-text-secondary hover:text-text-primary transition-colors">
                Bids
              </button>
              <button
                data-tab="wins"
                class="tab-btn pb-3 px-4 text-sm sm:text-base font-medium
                       whitespace-nowrap border-b-2 border-transparent
                       text-text-secondary hover:text-text-primary transition-colors">
                Wins
              </button>
            </nav>
          </div>

          <!-- Tab content panels -->

          <!-- Listings panel (default visible) -->
          <div id="tab-listings">
            <!-- Loading -->
            <div id="profile-listings-loading" class="flex justify-center py-12">
              <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
            <!-- Grid populated by JS -->
            <div id="profile-listings-grid"
              class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            </div>
            <!-- Empty state -->
            <div id="profile-listings-empty" class="hidden text-center py-16">
              <div class="text-5xl mb-4">📦</div>
              <h3 class="text-lg font-semibold text-text-primary mb-2">No listings yet</h3>
              <p class="text-text-secondary mb-6 text-sm">Create your first listing to start selling</p>
              <a href="/listing/create" data-link class="btn-primary">+ Create Listing</a>
            </div>
          </div>

          <!-- Bids panel (hidden by default) -->
          <div id="tab-bids" class="hidden">
            <div class="text-center py-16">
              <p class="text-text-secondary text-sm">Bids — coming in #P3</p>
            </div>
          </div>

          <!-- Wins panel (hidden by default) -->
          <div id="tab-wins" class="hidden">
            <!-- Loading -->
            <div id="profile-wins-loading" class="flex justify-center py-12">
              <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
            <!-- Grid populated by JS -->
            <div id="profile-wins-grid"
              class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            </div>
            <!-- Empty state -->
            <div id="profile-wins-empty" class="hidden text-center py-16">
              <div class="text-5xl mb-4">🏆</div>
              <h3 class="text-lg font-semibold text-text-primary mb-2">No wins yet</h3>
              <p class="text-text-secondary text-sm">
                Place bids on active listings to win auctions
              </p>
            </div>
          </div>

        </div><!-- /#profile-content -->
      </div>
    `;
  }

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────

  async init() {
    // Protected route
    if (!isLoggedIn()) {
      navigateTo('/login');
      return;
    }

    // Resolve profile name
    if (!this.profileName) {
      this._showError();
      return;
    }

    try {
      const response = await getProfile(this.profileName, {
        _listings: true,
        _wins: true,
      });
      const profile = response.data;

      this._showContent();
      this._renderHeader(profile);
      this._initTabs(profile.name); // #P2: wire up tab switching (owner-aware)
      this._loadListings();         // #P2: load first tab content
    } catch {
      this._showError();
    }
  }

  // ─────────────────────────────────────────────
  // #P1 — Header
  // ─────────────────────────────────────────────

  /**
   * Populate all header sections from API data.
   * @param {Object} profile
   */
  _renderHeader(profile) {
    this._renderBanner(profile.banner);
    this._renderAvatar(profile.avatar);
    this._renderNameAndBio(profile.name, profile.bio);
    this._renderStats(profile);
    this._renderEditButton(profile.name);
  }

  /**
   * Banner: show image if URL provided, keep gradient fallback otherwise.
   * @param {{ url: string, alt: string }|undefined} banner
   */
  _renderBanner(banner) {
    const bannerEl = document.getElementById('profile-banner');
    if (!banner?.url?.trim()) return; // gradient fallback stays

    const img = document.createElement('img');
    img.src       = banner.url;
    img.alt       = banner.alt || '';
    img.className = 'w-full h-full object-cover';
    img.onerror   = () => img.remove(); // broken URL → gradient shows
    bannerEl.innerHTML = '';
    bannerEl.classList.remove(
      'bg-gradient-to-r', 'from-primary-500', 'to-primary-600'
    );
    bannerEl.appendChild(img);
  }

  /**
   * Avatar: show image if URL provided, keep placeholder circle otherwise.
   * @param {{ url: string, alt: string }|undefined} avatar
   */
  _renderAvatar(avatar) {
    const avatarEl = document.getElementById('profile-avatar');
    if (!avatar?.url?.trim()) return; // placeholder circle stays

    const img = document.createElement('img');
    img.src       = avatar.url;
    img.alt       = avatar.alt || '';
    img.className = 'w-full h-full object-cover';
    img.onerror   = () => img.remove(); // broken URL → circle shows
    avatarEl.innerHTML = '';
    avatarEl.appendChild(img);
  }

  /**
   * Name and bio.
   * Bio section is hidden when empty.
   * @param {string} name
   * @param {string|undefined} bio
   */
  _renderNameAndBio(name, bio) {
    document.getElementById('profile-name').textContent = `@${name}`;

    const bioEl = document.getElementById('profile-bio');
    if (bio?.trim()) {
      bioEl.textContent = bio;
      bioEl.classList.remove('hidden');
    }
  }

  /**
   * Stats: Credits (own profile only), Listings count, Wins count.
   * @param {Object} profile
   */
  _renderStats(profile) {
    const currentUser = getUser();
    const isOwnProfile = currentUser?.name === profile.name;

    // Credits — own profile only
    if (isOwnProfile) {
      document.getElementById('stat-credits').classList.remove('hidden');
      document.getElementById('profile-credits').textContent =
        (profile.credits ?? 0).toLocaleString();
    }

    // Listings and Wins counts from _count
    document.getElementById('profile-listings-count').textContent =
      profile._count?.listings ?? 0;
    document.getElementById('profile-wins-count').textContent =
      profile._count?.wins ?? 0;
  }

  /**
   * Edit Profile button — injected only for own profile.
   * Wires up a click handler (Edit form implemented in #P5).
   * @param {string} profileName
   */
  _renderEditButton(profileName) {
    const currentUser = getUser();
    if (currentUser?.name !== profileName) return;

    const btnHtml = `
      <button
        id="edit-profile-btn"
        class="btn-secondary text-sm">
        Edit Profile
      </button>`;

    // Desktop slot
    const desktopSlot = document.getElementById('edit-btn-desktop');
    desktopSlot.innerHTML = btnHtml;
    desktopSlot.classList.remove('hidden');

    // Mobile slot — different button ID to avoid duplicate
    const mobileBtnHtml = `
      <button
        id="edit-profile-btn-mobile"
        class="btn-secondary w-full text-sm">
        Edit Profile
      </button>`;
    const mobileSlot = document.getElementById('edit-btn-mobile');
    mobileSlot.innerHTML = mobileBtnHtml;
    mobileSlot.classList.remove('hidden');
    mobileSlot.classList.add('sm:hidden');

    // Placeholder handler — will be replaced in #P5
    const handleEdit = () => {
      // TODO #P5: open edit profile form
      alert('Edit Profile — coming in #P5');
    };

    document.getElementById('edit-profile-btn')
      ?.addEventListener('click', handleEdit);
    document.getElementById('edit-profile-btn-mobile')
      ?.addEventListener('click', handleEdit);
  }

  // ─────────────────────────────────────────────
  // #P2 — Listings tab
  // ─────────────────────────────────────────────

  /**
   * Wire up tab button clicks.
   * Hides Bids and Wins tabs for non-owners (they can only see Listings).
   * @param {string} profileName
   */
  _initTabs(profileName) {
    const currentUser = getUser();
    const isOwner     = currentUser?.name === profileName;

    // Non-owners: hide Bids and Wins tabs entirely
    if (!isOwner) {
      document.querySelector('[data-tab="bids"]')?.closest('button')
        ?.classList.add('hidden');
      document.querySelector('[data-tab="wins"]')?.closest('button')
        ?.classList.add('hidden');
    }

    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        // Update button styles
        tabs.forEach((b) => {
          const isActive = b.dataset.tab === target;
          b.classList.toggle('border-primary-500', isActive);
          b.classList.toggle('text-primary-500', isActive);
          b.classList.toggle('border-transparent', !isActive);
          b.classList.toggle('text-text-secondary', !isActive);
        });

        // Show/hide panels
        ['listings', 'bids', 'wins'].forEach((panel) => {
          document.getElementById(`tab-${panel}`)?.classList.toggle(
            'hidden', panel !== target
          );
        });

        // Lazy-load tab content on first click
        if (target === 'wins' && !this._winsLoaded) {
          this._loadWins();
          this._winsLoaded = true;
        }
      });
    });
  }

  /**
   * Fetch and render Listings.
   * Uses createListingCards() for consistent card appearance.
   */
  async _loadListings() {
    const loadingEl = document.getElementById('profile-listings-loading');
    const gridEl    = document.getElementById('profile-listings-grid');
    const emptyEl   = document.getElementById('profile-listings-empty');

    try {
      const response = await getProfileListings(this.profileName, {
        _bids:   true,
        sort:    'created',
        sortOrder: 'desc',
      });
      const listings = response.data ?? [];

      loadingEl.classList.add('hidden');

      if (!listings.length) {
        emptyEl.classList.remove('hidden');
        return;
      }

      gridEl.innerHTML = createListingCards(listings);
      gridEl.classList.remove('hidden');
      gridEl.style.display = 'grid';
    } catch {
      loadingEl.classList.add('hidden');
      emptyEl.classList.remove('hidden');
    }
  }

  // ─────────────────────────────────────────────
  // #P4 — Wins tab
  // ─────────────────────────────────────────────

  /**
   * Fetch and render Wins.
   * Called lazily on first click of Wins tab.
   */
  async _loadWins() {
    const loadingEl = document.getElementById('profile-wins-loading');
    const gridEl    = document.getElementById('profile-wins-grid');
    const emptyEl   = document.getElementById('profile-wins-empty');

    try {
      const response = await getProfileWins(this.profileName, {
        _bids:    true,
        sort:     'created',
        sortOrder: 'desc',
      });
      const wins = response.data ?? [];

      loadingEl.classList.add('hidden');

      if (!wins.length) {
        emptyEl.classList.remove('hidden');
        return;
      }

      gridEl.innerHTML = createListingCards(wins);
      gridEl.classList.remove('hidden');
      gridEl.style.display = 'grid';
    } catch {
      loadingEl.classList.add('hidden');
      emptyEl.classList.remove('hidden');
    }
  }

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  _showContent() {
    document.getElementById('profile-loading').classList.add('hidden');
    document.getElementById('profile-content').classList.remove('hidden');
  }

  _showError() {
    document.getElementById('profile-loading').classList.add('hidden');
    document.getElementById('profile-error').classList.remove('hidden');
  }
}