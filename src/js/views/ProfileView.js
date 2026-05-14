/**
 * Profile View — user profile page.
 *
 * Thin: owns the HTML template and the lifecycle hooks only.
 * All data loading and DOM mutation lives in handlers:
 *   - profileHandler     — fetch, header, tabs, tab content
 *   - profileEditHandler — Edit Profile modal (own-profile only)
 */

import { initProfile, cleanupProfile } from '../handlers/profileHandler.js';
import { getUser } from '../auth/storage.js';
import { spinnerHtml } from '../utils/format.js';

export class ProfileView {
  constructor(params) {
    this.params = params;
    this.profileName = params.name || getUser()?.name || null;
  }

  async render() {
    return profileTemplate();
  }

  async init() {
    await initProfile(this.profileName);
  }

  destroy() {
    cleanupProfile();
  }
}

// ─────────────────────────────────────────────
// Template (pure HTML, no DOM access, no state)
// ─────────────────────────────────────────────

function profileTemplate() {
  return `
    <div class="page-container">

      <!-- Loading state -->
      <div id="profile-loading" class="flex flex-col items-center justify-center py-24 gap-4">
        ${spinnerHtml('w-10 h-10')}
        <p class="text-text-secondary text-sm">Loading profile...</p>
      </div>

      <!-- Error / 404 state -->
      <div id="profile-error" class="page-state-centered hidden">
        <div class="text-center max-w-md">
          <h2 class="text-xl font-bold text-text-primary mb-2">Profile not found</h2>
          <p class="text-text-secondary mb-6">
            This profile may not exist or the link is invalid.
          </p>
          <a href="/" data-link class="btn-primary">Go home</a>
        </div>
      </div>

      <!-- Main content -->
      <div id="profile-content" class="hidden">

        <!-- Profile header card -->
        <div class="card overflow-hidden mb-6 sm:mb-8">

          <!-- Banner -->
          <div id="profile-banner"
            class="h-24 sm:h-32 lg:h-40 bg-linear-to-r from-primary-500 to-primary-600 overflow-hidden">
          </div>

          <!-- Avatar and info -->
          <div class="relative px-4 sm:px-6 pb-6">
            <!-- Avatar — overlaps banner -->
            <div id="profile-avatar"
              class="absolute -top-12 sm:-top-14 left-4 sm:left-6
                    w-20 h-20 sm:w-24 sm:h-24
                    rounded-full overflow-hidden
                    border-4 border-white bg-gray-200 shadow-md">
            </div>

            <!-- Spacer — reserves vertical space for the avatar's bottom half -->
            <div class="h-10 sm:h-12"></div>

            <!-- Name + bio -->
            <div class="mb-4 min-w-0">
              <h1 id="profile-name"
                class="text-xl sm:text-2xl font-bold text-text-primary truncate">
              </h1>
              <p id="profile-bio"
                class="hidden text-text-secondary text-sm sm:text-base mt-1">
              </p>
            </div>

            <!-- Edit Profile button — owner only, toggled by handler -->
            <div id="edit-profile-wrap" class="hidden mb-4">
              <button id="edit-profile-btn" type="button"
                class="btn-secondary text-sm">
                Edit Profile
              </button>
            </div>

            <!-- Stats row -->
            <div class="flex flex-wrap gap-4 sm:gap-8">

              <!-- Credits — owner only -->
              <div id="stat-credits" class="hidden text-center sm:text-left">
                <p id="profile-credits"
                  class="text-xl sm:text-2xl font-bold text-primary-500">
                  —
                </p>
                <p class="text-xs sm:text-sm text-text-secondary">Credits</p>
              </div>

              <!-- Listings count -->
              <div class="text-center sm:text-left">
                <p id="profile-listings-count"
                  class="text-xl sm:text-2xl font-bold text-text-primary">
                  —
                </p>
                <p class="text-xs sm:text-sm text-text-secondary">Listings</p>
              </div>

              <!-- Wins — owner only -->
              <div id="stat-wins" class="hidden text-center sm:text-left">
                <p id="profile-wins-count"
                  class="text-xl sm:text-2xl font-bold text-text-primary">
                  —
                </p>
                <p class="text-xs sm:text-sm text-text-secondary">Wins</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab navigation -->
        <div class="border-b border-border mb-6">
          <nav class="flex gap-1 overflow-x-auto">
            <button data-tab="listings" class="tab-btn tab-active">
              Listings
            </button>
            <button data-tab="bids" class="tab-btn">
              Bids
            </button>
            <button data-tab="wins" class="tab-btn">
              Wins
            </button>
          </nav>
        </div>

        <!-- Listings tab -->
        <div id="tab-listings">
          <div id="profile-listings-loading" class="flex justify-center py-12">
            ${spinnerHtml('w-8 h-8')}
          </div>

          <div id="profile-listings-grid"
            class="listing-cards-grid hidden">
          </div>

          <div id="profile-listings-empty" class="hidden text-center py-16">
            <h3 id="profile-listings-empty-title" class="text-lg font-semibold text-text-primary mb-2">No listings yet</h3>
            <p id="profile-listings-empty-body" class="text-text-secondary mb-6 text-sm">Create your first listing to start selling</p>
            <div id="profile-listings-empty-cta-wrap">
              <a href="/listing/create" data-link class="btn-primary">+ New listing</a>
            </div>
          </div>
        </div>

        <!-- Bids tab -->
        <div id="tab-bids" class="hidden">
          <div id="profile-bids-loading" class="flex justify-center py-12">
            ${spinnerHtml('w-8 h-8')}
          </div>

          <div id="profile-bids-list" class="hidden space-y-3"></div>

          <div id="profile-bids-empty" class="hidden text-center py-16">
            <h3 class="text-lg font-semibold text-text-primary mb-2">No bids placed yet</h3>
            <p class="text-text-secondary text-sm">
              Explore listings and place your first bid
            </p>
            <a href="/" data-link class="btn-primary mt-6 inline-block">Explore listings</a>
          </div>
        </div>

        <!-- Wins tab -->
        <div id="tab-wins" class="hidden">
          <div id="profile-wins-loading" class="flex justify-center py-12">
            ${spinnerHtml('w-8 h-8')}
          </div>

          <div id="profile-wins-grid"
            class="listing-cards-grid hidden">
          </div>

          <div id="profile-wins-empty" class="hidden text-center py-16">
            <h3 class="text-lg font-semibold text-text-primary mb-2">No wins yet</h3>
            <p class="text-text-secondary text-sm">
              Place bids on active listings to win auctions
            </p>
            <a href="/" data-link class="btn-primary mt-6 inline-block">Explore listings</a>
          </div>
        </div>

        <!-- Edit Profile modal -->
        <div id="edit-profile-modal" class="hidden fixed inset-0 z-50 overflow-y-auto">

          <!-- Backdrop -->
          <div id="edit-profile-backdrop" class="fixed inset-0 bg-black/50"></div>

          <!-- Centering wrapper -->
          <div class="relative flex min-h-full items-center justify-center p-4">

            <!-- Modal card -->
            <div class="relative bg-white rounded-xl w-full max-w-md p-6 space-y-5 my-4">

              <div class="flex items-center justify-between">
                <h2 class="text-lg font-bold text-text-primary">Edit Profile</h2>
                <button id="edit-profile-close"
                  class="text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Close">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <!-- Inline error -->
              <div id="edit-profile-error"
                class="hidden p-3 bg-error/10 border border-error/20 rounded-lg">
                <p class="alert-error"></p>
              </div>

              <!-- Form -->
              <form id="edit-profile-form" class="space-y-4" novalidate>
                <div>
                  <label for="edit-bio" class="label">Bio</label>
                  <textarea
                    id="edit-bio"
                    name="bio"
                    rows="3"
                    maxlength="160"
                    placeholder="Tell others about yourself..."
                    class="input resize-none">
                  </textarea>
                  <p class="hint">Maximum 160 characters</p>
                </div>

                <div>
                  <label for="edit-avatar" class="label">Avatar URL</label>
                  <input
                    type="url"
                    id="edit-avatar"
                    name="avatar"
                    placeholder="https://example.com/avatar.jpg"
                    class="input"
                  />
                </div>

                <div>
                  <label for="edit-banner" class="label">Banner URL</label>
                  <input
                    type="url"
                    id="edit-banner"
                    name="banner"
                    placeholder="https://example.com/banner.jpg"
                    class="input"
                  />
                </div>

                <button type="submit" id="edit-profile-submit"
                  class="btn-primary w-full py-3">
                  Save changes
                </button>
              </form>

            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}