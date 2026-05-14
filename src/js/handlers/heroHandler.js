/* Hero handler */

import { getListings } from '../api/apiClient.js';
import { formatCredits } from '../utils/format.js';
import { formatTimeLeft } from '../utils/time.js';

const HERO_FETCH_LIMIT = 100;

export async function initHero() {
  const loadingEl = document.getElementById('hero-loading');
  const listingEl = document.getElementById('hero-listing');
  const fallbackEl = document.getElementById('hero-fallback');

  if (!loadingEl || !listingEl || !fallbackEl) return;

  try {
    const hot = await fetchHottestListing();
    loadingEl.classList.add('hidden');

    if (!hot) {
      fallbackEl.classList.remove('hidden');
      return;
    }

    renderHero(hot);
    showHeroListing(listingEl);
  } catch {
    loadingEl.classList.add('hidden');
    fallbackEl.classList.remove('hidden');
  }
}

/**
 * Fetch an active listings and pick the one with the most bids, returns undefined if no listing has any bids.
 * @returns {Promise<Object|undefined>}
 */
async function fetchHottestListing() {
  const response = await getListings({
    _active: true,
    _bids: true,
    limit: HERO_FETCH_LIMIT,
  });
  const all = response.data ?? [];

  return all
    .filter((l) => l._count?.bids > 0)
    .sort((a, b) => (b._count?.bids ?? 0) - (a._count?.bids ?? 0))[0];
}

//  Rendering
/**
 * Populate hero DOM nodes from a listing object
 * @param {Object} listing
 */
function renderHero(listing) {
  const href = `/listing/${listing.id}`;
  document.getElementById('hero-image-link').href = href;
  document.getElementById('hero-cta').href = href;

  document.getElementById('hero-title').textContent =
    listing.title || 'Untitled listing';

  renderDescription(listing.description);
  renderBidSummary(listing);
  renderEnds(listing.endsAt);
  renderImage(listing);
}

function renderDescription(description) {
  const el = document.getElementById('hero-description');
  if (description?.trim()) {
    el.textContent = description;
  } else {
    el.classList.add('hidden');
  }
}

function renderBidSummary(listing) {
  const bids = listing.bids ?? [];
  const top = bids.length ? Math.max(...bids.map((b) => b.amount)) : 0;
  const count = listing._count?.bids ?? bids.length;

  document.getElementById('hero-bid').textContent = `${formatCredits(top)} cr`;
  document.getElementById('hero-bid-count').textContent =
    `${count} ${count === 1 ? 'bid' : 'bids'}`;
}

function renderEnds(endsAt) {
  document.getElementById('hero-ends').textContent =
    `Ends in ${formatTimeLeft(endsAt)}`;
}

function renderImage(listing) {
  const url = listing.media?.[0]?.url;
  const link = document.getElementById('hero-image-link');

  // Hide image column when no media — let the text column expand
  if (!url) {
    link.classList.add('hidden');
    return;
  }

  const img = document.getElementById('hero-image');
  img.src = url;
  img.alt = listing.media[0].alt || listing.title || '';
}

// Show  the hero listing container
function showHeroListing(el) {
  el.classList.remove('hidden');
}