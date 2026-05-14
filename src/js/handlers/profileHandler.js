/**
 * Profile Handler
 *
 * Orchestrator for the profile page:
 *   - fetches profile data
 *   - renders header (banner, avatar, name, bio, stats, edit button)
 *   - initializes tabs (Listings / Bids / Wins)
 *   - lazy-loads tab content on first click
 *   - wires the Edit Profile modal (delegated to profileEditHandler)
 *
 * Bids and Wins tabs are owner-only. Non-owners only see Listings.
 *
 * Must be called after ProfileView's HTML is in the DOM.
 */

import {
  getProfile,
  getProfileListings,
  getProfileBids,
  getProfileWins,
} from '../api/apiClient.js';
import { createListingCards } from '../components/ListingCard.js';
import { getListingStatus } from '../utils/listing.js';
import { renderAvatarInto } from '../utils/avatar.js';
import { getUser, updateUser } from '../auth/storage.js';
import { updateNavAuth } from '../components/Nav.js';
import {
  escHtml,
  formatDate,
  imagePlaceholderHtml,
  formatCredits,
} from '../utils/format.js';
import {
  initProfileEdit,
  openEditModal,
  cleanupProfileEdit,
} from './profileEditHandler.js';

// ─────────────────────────────────────────────
// Module state
// ─────────────────────────────────────────────

let profileName = null;
let isOwner = false;
let bidsLoaded = false;
let winsLoaded = false;

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Entry point. Fetches the profile and renders the page.
 *
 * @param {string|null} name - profile name from the URL, or null
 *   (handled as "not found")
 */
export async function initProfile(name) {
  resetState();
  profileName = name;

  if (!profileName) {
    showError();
    return;
  }

  isOwner = getUser()?.name === profileName;

  try {
    const response = await getProfile(profileName, {
      _listings: true,
      _wins: true,
    });
    const profile = response.data;

    showContent();
    renderHeader(profile);
    initTabs();

    // Edit modal is owner-only
    if (isOwner) {
      initProfileEdit(profileName, {
        onUpdate: updateHeaderAfterEdit,
      });
    }

    loadListings();
  } catch {
    showError();
  }
}

export function cleanupProfile() {
  cleanupProfileEdit();
  resetState();
}

function resetState() {
  profileName = null;
  isOwner = false;
  bidsLoaded = false;
  winsLoaded = false;
}

// ─────────────────────────────────────────────
// Page-level states
// ─────────────────────────────────────────────

function showContent() {
  document.getElementById('profile-loading').classList.add('hidden');
  document.getElementById('profile-content').classList.remove('hidden');
}

function showError() {
  document.getElementById('profile-loading').classList.add('hidden');
  document.getElementById('profile-error').classList.remove('hidden');
}

// ─────────────────────────────────────────────
// Header (banner, avatar, name, bio, stats, edit btn)
// ─────────────────────────────────────────────

function renderHeader(profile) {
  renderBanner(profile.banner);
  renderAvatar(profile.avatar);
  renderNameAndBio(profile.name, profile.bio);
  renderStats(profile);
  renderEditButton();
}

/**
 * Apply a banner image to a banner container element.
 * Removes gradient classes when image loads; restores them on error or
 * when no URL is provided so the gradient always shows as fallback.
 */
function applyBannerEl(bannerEl, banner) {
  bannerEl.innerHTML = '';

  if (!banner?.url?.trim()) {
    bannerEl.classList.add('bg-gradient-to-r', 'from-primary-500', 'to-primary-600');
    return;
  }

  const img = document.createElement('img');
  img.alt = banner.alt || '';
  img.className = 'w-full h-full object-cover';
  img.onerror = () => {
    img.remove();
    bannerEl.classList.add('bg-gradient-to-r', 'from-primary-500', 'to-primary-600');
  };

  bannerEl.classList.remove('bg-gradient-to-r', 'from-primary-500', 'to-primary-600');
  bannerEl.appendChild(img);
  img.src = banner.url; // set src last so onerror is wired before load starts
}

function renderBanner(banner) {
  applyBannerEl(document.getElementById('profile-banner'), banner);
}

function renderAvatar(avatar) {
  renderAvatarInto(document.getElementById('profile-avatar'), {
    url: avatar?.url,
    alt: avatar?.alt || '',
  });
}

function renderNameAndBio(name, bio) {
  document.getElementById('profile-name').textContent = `@${name}`;

  const bioEl = document.getElementById('profile-bio');
  if (bio?.trim()) {
    bioEl.textContent = bio;
    bioEl.classList.remove('hidden');
  }
}

/**
 * Listings count is public, credits and wins are owner-only.
 * Also syncs server credits → localStorage → navbar for own profile.
 */
function renderStats(profile) {
  document.getElementById('profile-listings-count').textContent =
    profile._count?.listings ?? 0;

  if (!isOwner) return;

  document.getElementById('stat-credits').classList.remove('hidden');
  document.getElementById('profile-credits').textContent = formatCredits(
    profile.credits
  );
  document.getElementById('stat-wins').classList.remove('hidden');
  document.getElementById('profile-wins-count').textContent =
    profile._count?.wins ?? 0;

  // Server-authoritative credits → storage → navbar
  updateUser({ credits: profile.credits });
  updateNavAuth();
}

function renderEditButton() {
  if (!isOwner) return;

  const wrap = document.getElementById('edit-profile-wrap');
  const btn = document.getElementById('edit-profile-btn');
  if (!wrap || !btn) return;

  wrap.classList.remove('hidden');
  wrap.style.display = '';
  btn.addEventListener('click', openEditModal);
}

// ─────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────

function initTabs() {
  // Hide Bids/Wins tabs for non-owners — they're private
  if (!isOwner) {
    document
      .querySelector('[data-tab="bids"]')
      ?.closest('button')
      ?.classList.add('hidden');
    document
      .querySelector('[data-tab="wins"]')
      ?.closest('button')
      ?.classList.add('hidden');

    // Listings empty-state copy: non-owner can't "create their first listing"
    document
      .getElementById('profile-listings-empty-body')
      ?.classList.add('hidden');
    document
      .getElementById('profile-listings-empty-cta-wrap')
      ?.classList.add('hidden');
  }

  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn, tabs));
  });
}

function switchTab(activeBtn, allTabs) {
  const target = activeBtn.dataset.tab;

  // Update active style on buttons
  allTabs.forEach((b) => {
    b.classList.toggle('tab-active', b.dataset.tab === target);
  });

  // Show/hide panels
  ['listings', 'bids', 'wins'].forEach((panel) => {
    document
      .getElementById(`tab-${panel}`)
      ?.classList.toggle('hidden', panel !== target);
  });

  // Lazy-load on first click
  if (target === 'wins' && !winsLoaded) {
    loadWins();
    winsLoaded = true;
  }
  if (target === 'bids' && !bidsLoaded) {
    loadBids();
    bidsLoaded = true;
  }
}

// ─────────────────────────────────────────────
// Tab content: Listings
// ─────────────────────────────────────────────

async function loadListings() {
  const loadingEl = document.getElementById('profile-listings-loading');
  const gridEl = document.getElementById('profile-listings-grid');
  const emptyEl = document.getElementById('profile-listings-empty');

  try {
    const response = await getProfileListings(profileName, {
      _bids: true,
      sort: 'created',
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
// Tab content: Bids
// ─────────────────────────────────────────────

async function loadBids() {
  const loadingEl = document.getElementById('profile-bids-loading');
  const listEl = document.getElementById('profile-bids-list');
  const emptyEl = document.getElementById('profile-bids-empty');

  try {
    const response = await getProfileBids(profileName, { _listings: true });
    const bids = response.data ?? [];

    loadingEl.classList.add('hidden');

    if (!bids.length) {
      emptyEl.classList.remove('hidden');
      return;
    }

    const sorted = [...bids].sort((a, b) => b.amount - a.amount);
    listEl.innerHTML = sorted.map(bidRow).join('');
    listEl.classList.remove('hidden');
  } catch {
    loadingEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
  }
}

function bidRow(bid) {
  const listing = bid.listing;
  const imageUrl = listing?.media?.[0]?.url ?? '';
  const title = listing?.title ?? 'Unknown listing';
  const listingId = listing?.id ?? '';
  const status = listing?.endsAt
    ? getListingStatus(listing.endsAt)
    : { label: 'Unknown', cssClass: 'badge-error' };

  return `
    <a href="/listing/${escHtml(listingId)}" data-link
      class="group flex items-center gap-4 p-4 card">

      <!-- Thumbnail -->
      <div class="w-16 h-16 rounded-lg overflow-hidden bg-surface flex-shrink-0">
        ${
          imageUrl
            ? `<img src="${escHtml(imageUrl)}" alt="${escHtml(title)}"
                   class="w-full h-full object-cover"/>`
            : imagePlaceholderHtml()
        }
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-text-primary truncate text-sm group-hover:text-primary-600 transition-colors">${escHtml(title)}</p>
        <p class="text-xs text-text-secondary mt-0.5">
          Ends ${listing?.endsAt ? formatDate(listing.endsAt) : '—'}
        </p>
      </div>

      <!-- Bid amount and status -->
      <div class="text-right flex-shrink-0">
        <p class="font-bold text-primary-500 text-sm">
          ${formatCredits(bid.amount)}
          <span class="text-xs font-normal text-text-secondary">cr</span>
        </p>
        <span class="${status.cssClass} text-xs mt-1 inline-block">
          ${status.label}
        </span>
      </div>
    </a>`;
}

// ─────────────────────────────────────────────
// Tab content: Wins
// ─────────────────────────────────────────────

async function loadWins() {
  const loadingEl = document.getElementById('profile-wins-loading');
  const gridEl = document.getElementById('profile-wins-grid');
  const emptyEl = document.getElementById('profile-wins-empty');

  try {
    const response = await getProfileWins(profileName, {
      _bids: true,
      sort: 'created',
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
// Refresh header after a successful Edit Profile save
// ─────────────────────────────────────────────

/**
 * Callback passed to profileEditHandler.initProfileEdit.
 * Avatar and banner are always present (server enforces a URL).
 * Bio toggles based on whether it's empty.
 */
function updateHeaderAfterEdit(updated) {
  // Bio
  const bioEl = document.getElementById('profile-bio');
  if (updated.bio?.trim()) {
    bioEl.textContent = updated.bio;
    bioEl.classList.remove('hidden');
  } else {
    bioEl.classList.add('hidden');
  }

  // Avatar
  renderAvatarInto(document.getElementById('profile-avatar'), {
    url: updated.avatar?.url,
    alt: updated.avatar?.alt || '',
  });

  // Banner
  applyBannerEl(document.getElementById('profile-banner'), updated.banner);
}