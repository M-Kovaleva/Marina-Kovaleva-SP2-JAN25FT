/* Listing Detail Handler */

import { getListing, deleteListing } from '../api/apiClient.js';
import { getUser } from '../auth/storage.js';
import { navigateTo } from '../router/router.js';
import { showSuccessToast } from '../utils/toast.js';
import { escHtml, formatDate, formatCredits, imagePlaceholderHtml } from '../utils/format.js';
import { timeAgo } from '../utils/time.js';
import { getListingStatus } from '../components/ListingCard.js';
import { initBidForm, setBidFormEnded, cleanupBidForm } from './bidFormHandler.js';

let countdownInterval = null;

/**
 * Entry point. Fetch listing, render everything, start the countdown
 * @param {string} listingId
 */
export async function initListingDetail(listingId) {
  resetState();

  try {
    const response = await getListing(listingId, true, true);
    const listing = response.data;

    showContent();
    renderBasicInfo(listing);
    renderGallery(listing.media);
    renderDescription(listing.description);
    renderSellerCard(listing.seller, listing.created);
    renderBidSummary(listing);
    renderBidHistory(listing.bids);
    renderOwnerActions(listing);

    initBidForm(listing, {
      onBidPlaced: (updated) => {
        renderBidSummary(updated);
        renderBidHistory(updated.bids);
      },
    });

    startCountdown(listing.endsAt);
  } catch (err) {
    console.error('ListingDetail: failed to load listing', err);
    showError();
  }
}

export function cleanupListingDetail() {
  resetState();
  cleanupBidForm();
}

function resetState() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

// Page-level loading / error states
function showContent() {
  document.getElementById('listing-loading').classList.add('hidden');
  document.getElementById('listing-content').classList.remove('hidden');
}

function showError() {
  document.getElementById('listing-loading').classList.add('hidden');
  document.getElementById('listing-error').classList.remove('hidden');
}

// Basic info: title + status badge
function renderBasicInfo(listing) {
  document.getElementById('listing-title').textContent = listing.title;

  const status = getListingStatus(listing.endsAt);
  const badge = document.getElementById('listing-status-badge');
  badge.textContent = status.label;
  badge.className = status.cssClass;
}

//  Gallery: main image + thumbnails
function renderGallery(media) {
  const mainImg = document.getElementById('gallery-main');
  const thumbsWrap = document.getElementById('gallery-thumbnails');

  // No images — placeholder, no thumbnails
  if (!media?.length) {
    mainImg.parentElement.innerHTML = imagePlaceholderHtml();
    return;
  }

  // Set main image with fade-in
  const loadMain = (url, alt) => {
    mainImg.classList.replace('opacity-100', 'opacity-0');
    mainImg.onload = () => mainImg.classList.replace('opacity-0', 'opacity-100');
    mainImg.onerror = () => {
      mainImg.parentElement.innerHTML = imagePlaceholderHtml();
    };
    mainImg.alt = alt || 'Listing image';
    mainImg.src = url;
  };

  loadMain(media[0].url, media[0].alt);

  // Single image — no thumbnail strip
  if (media.length < 2) return;

  thumbsWrap.classList.remove('hidden');
  thumbsWrap.style.display = 'grid';

  thumbsWrap.innerHTML = media
    .map(
      (item, i) => `
      <button
        data-index="${i}"
        class="aspect-square rounded-lg overflow-hidden border-2 transition-all duration-150 focus:outline-none
               ${i === 0 ? 'border-primary-500' : 'border-transparent hover:border-primary-500'}"
        aria-label="View image ${i + 1}"
      >
        <img
          src="${escHtml(item.url)}"
          alt="${escHtml(item.alt || '')}"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </button>`
    )
    .join('');

  // Click handler — swap main image + update active border
  thumbsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-index]');
    if (!btn) return;

    const idx = parseInt(btn.dataset.index, 10);
    loadMain(media[idx].url, media[idx].alt);

    thumbsWrap.querySelectorAll('[data-index]').forEach((b) => {
      b.classList.replace('border-primary-500', 'border-transparent');
      b.classList.add('hover:border-primary-500');
    });
    btn.classList.replace('border-transparent', 'border-primary-500');
    btn.classList.remove('hover:border-primary-300');
  });
}

// Description and seller card
function renderDescription(description) {
  const block = document.getElementById('listing-description-block');
  const el = document.getElementById('listing-description');
  if (description?.trim()) {
    el.textContent = description;
  } else {
    block.classList.add('hidden');
  }
}

function renderSellerCard(seller, created) {
  if (!seller) return;

  const avatarUrl = seller.avatar?.url?.trim();
  if (avatarUrl) {
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = seller.name;
    img.className = 'w-full h-full object-cover';
    document.getElementById('seller-avatar').appendChild(img);
  }

  const profileLink = document.getElementById('seller-profile-link');
  profileLink.textContent = `@${seller.name}`;
  profileLink.href = `/profile/${seller.name}`;

  document.getElementById('listing-created-date').textContent =
    formatDate(created);
}

// Bid summary: current bid + count
function renderBidSummary(listing) {
  const bids = listing.bids ?? [];
  const highest = bids.length ? Math.max(...bids.map((b) => b.amount)) : 0;

  document.getElementById('listing-current-bid').textContent =
    `${formatCredits(highest)} credits`;
  document.getElementById('listing-bid-count').textContent =
    `${bids.length} ${bids.length === 1 ? 'bid' : 'bids'}`;
}

// Live countdown
/**
 * Tick once per second. Format depends on remaining time:
 * >= 1 day - "Xd Xh Xm Xs" - green
 * <  1 day - "X:X:X" - orange
 * 0 - "Auction ended" - red, and: status badge "ended", bid form - ended state, owner actions - hidden 
 */
function startCountdown(endsAt) {
  const countdownEl = document.getElementById('countdown');
  const endsDateEl = document.getElementById('listing-ends-date');
  const statusBadge = document.getElementById('listing-status-badge');
  const endDate = new Date(endsAt);

  endsDateEl.textContent = endDate.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const tick = () => {
    const diff = endDate - Date.now();

    if (diff <= 0) {
      countdownEl.textContent = 'Auction ended';
      countdownEl.className =
        'text-xl sm:text-2xl font-semibold tabular-nums text-red-700';

      const status = getListingStatus(endsAt);
      statusBadge.textContent = status.label;
      statusBadge.className = status.cssClass;

      clearInterval(countdownInterval);
      countdownInterval = null;

      setBidFormEnded();
      hideOwnerActions();
      return;
    }

    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    const seconds = Math.floor((diff % 60_000) / 1_000);

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
  countdownInterval = setInterval(tick, 1000);
}

// Bid history
function renderBidHistory(bids) {
  const container = document.getElementById('bid-history');
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
      const isOwn =
        currentUser?.name && bid.bidder?.name === currentUser.name;

      const avatarHtml = bid.bidder?.avatar?.url
        ? `<img
             src="${escHtml(bid.bidder.avatar.url)}"
             alt="${escHtml(bid.bidder.name ?? '')}"
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
              <a href="/profile/${escHtml(bid.bidder?.name ?? '')}"
                 data-link
                 class="font-semibold text-sm text-text-primary
                        hover:text-primary-500 transition-colors truncate">
                @${escHtml(bid.bidder?.name ?? 'Unknown')}
              </a>
              ${isHighest ? '<span class="badge-success">Highest bid</span>' : ''}
              ${isOwn ? '<span class="badge-warning">You</span>' : ''}
            </div>
            <p class="text-xs text-text-secondary mt-0.5">
              ${timeAgo(bid.created)}
            </p>
          </div>

          <p class="font-bold text-sm flex-shrink-0
                    ${isHighest ? 'text-primary-600' : 'text-text-primary'}">
            ${formatCredits(bid.amount)}
            <span class="font-normal text-text-secondary text-xs">credits</span>
          </p>
        </div>`;
    })
    .join('');
}

// Owner actions: Edit / Delete
function renderOwnerActions(listing) {
  const currentUser = getUser();
  const isOwner =
    currentUser?.name && listing.seller?.name === currentUser.name;
  const isActive = new Date(listing.endsAt) > new Date();

  if (!isOwner || !isActive) return;

  const actions = document.getElementById('owner-actions');
  actions.classList.remove('hidden');
  actions.style.display = 'flex';

  document.getElementById('edit-listing-btn').href =
    `/listing/${listing.id}/edit`;
  document
    .getElementById('delete-listing-btn')
    .addEventListener('click', () => handleDelete(listing.id));
}

// hideOwnerActions - called by the countdown when auction ends live on the page
function hideOwnerActions() {
  const actions = document.getElementById('owner-actions');
  if (actions) {
    actions.classList.add('hidden');
    actions.style.display = '';
  }
}

async function handleDelete(listingId) {
  const confirmed = window.confirm(
    'Delete this listing? This cannot be undone.'
  );
  if (!confirmed) return;

  const btn = document.getElementById('delete-listing-btn');
  btn.disabled = true;
  btn.textContent = 'Deleting…';

  try {
    await deleteListing(listingId);
    showSuccessToast('Listing deleted.');
    navigateTo('/');
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Delete';
    alert(`Could not delete listing: ${err.message}`);
  }
}