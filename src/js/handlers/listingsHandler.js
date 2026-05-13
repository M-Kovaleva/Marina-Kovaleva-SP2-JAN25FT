/* Listings Handler. Handles fetching, displaying, filtering, and infinity-scroll pagination of the listings grid on the home page */

import { getListings, searchListings } from '../api/apiClient.js';
import {
  createListingCards,
} from '../components/ListingCard.js';

let currentPage = 1;
let currentSearch = '';
let activeOnly = true;
let totalPages = 1;
let totalCount = 0;
let isLoading = false;
let allListingsLoaded = false;

// Cached DOM element references — set once in initListingsHandler
let els = null;

// RequestAnimationFrame throttle flag for the scroll handler. Ensures handleScroll runs at most once per animation frame (~16ms)
let scrollTicking = false;

const ITEMS_PER_PAGE = 12;

// DOM elements
function getElements() {
  return {
    grid: document.getElementById('listings-grid'),
    emptyState: document.getElementById('empty-state'),
    errorState: document.getElementById('error-state'),
    errorMessage: document.getElementById('error-message'),
    showingCount: document.getElementById('showing-count'),
    totalListings: document.getElementById('total-listings'),
    searchInput: document.getElementById('search-input'),
    clearSearch: document.getElementById('clear-search'),
    searchBtn: document.getElementById('search-btn'),
    searchInfo: document.getElementById('search-info'),
    resultsCount: document.getElementById('results-count'),
    searchQuery: document.getElementById('search-query'),
    clearFilters: document.getElementById('clear-filters'),
    activeFilter: document.getElementById('active-filter'),
    retryBtn: document.getElementById('retry-btn'),
    resetFilters: document.getElementById('reset-filters'),
    loadMoreContainer: document.getElementById('load-more-container'),
  };
}

// UI state management
function showLoading() {
  els.grid.innerHTML = `
    <div class="col-span-full">
      <div class="flex flex-col items-center justify-center py-12 sm:py-16">
        <div class="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary-200 border-t-primary-500
                    rounded-full animate-spin mb-4"></div>
        <p class="text-text-secondary text-sm sm:text-base">Loading listings...</p>
      </div>
    </div>
  `;
  els.emptyState?.classList.add('hidden');
  els.errorState?.classList.add('hidden');
  hideLoadMore();
}

function showLoadingMore() {
  if (!els.loadMoreContainer) return;
  els.loadMoreContainer.innerHTML = `
    <div class="flex flex-col items-center justify-center py-8">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-500
                  rounded-full animate-spin mb-2"></div>
      <p class="text-text-secondary text-sm">Loading more...</p>
    </div>
  `;
}

function hideLoadMore() {
  if (els?.loadMoreContainer) els.loadMoreContainer.innerHTML = '';
}

function showEndOfListings() {
  if (!els.loadMoreContainer || totalCount === 0) return;
  els.loadMoreContainer.innerHTML = `
    <div class="text-center py-8 text-text-secondary">
      <p class="text-sm">You've reached the end</p>
    </div>
  `;
}

function showError(message) {
  els.grid.innerHTML = '';
  els.emptyState?.classList.add('hidden');
  if (els.errorState) {
    els.errorState.classList.remove('hidden');
    if (els.errorMessage) {
      els.errorMessage.textContent =
        message || "We couldn't load the listings. Please try again.";
    }
  }
  hideLoadMore();
}

function showEmpty() {
  els.grid.innerHTML = '';
  els.errorState?.classList.add('hidden');
  els.emptyState?.classList.remove('hidden');
  hideLoadMore();
}

function showListings(listings) {
  els.emptyState?.classList.add('hidden');
  els.errorState?.classList.add('hidden');
  els.grid.innerHTML = createListingCards(listings);
}

function appendListings(listings) {
  if (!els.grid) return;
  els.grid.insertAdjacentHTML('beforeend', createListingCards(listings));
}

// Count display
function updateTotalCount(meta) {
  if (!meta) return;

  totalPages = meta.pageCount || 1;
  totalCount = meta.totalCount || 0;

  const showing = els.grid.querySelectorAll('article').length;
  if (els.showingCount) els.showingCount.textContent = showing;
  if (els.totalListings) els.totalListings.textContent = totalCount;
}

function updateSearchInfo(query, count) {
  if (query) {
    els.searchInfo?.classList.remove('hidden');
    if (els.resultsCount) els.resultsCount.textContent = count;
    if (els.searchQuery) els.searchQuery.textContent = query;
    els.clearSearch?.classList.remove('hidden');
  } else {
    els.searchInfo?.classList.add('hidden');
    els.clearSearch?.classList.add('hidden');
  }
}

// Data fetching
function buildQueryParams() {
  const params = {
    limit: ITEMS_PER_PAGE,
    page: currentPage,
    _bids: true,
    _seller: true,
    sort: 'created',
    sortOrder: 'desc',
  };
  if (activeOnly) params._active = true;
  return params;
}

// Client-side active filter — backup for search endpoint
function filterActiveListings(listings) {
  if (!activeOnly) return listings;
  const now = new Date();
  return listings.filter((l) => new Date(l.endsAt) > now);
}

/**
 * Single fetch call for the current page / search / filter state
 * Shared by loadListings and loadMore to avoid duplicating the search with regular branching logic
 *
 * @returns {Promise<{ data: Object[], meta: Object }>}
 */
async function fetchPage() {
  if (currentSearch) {
    const response = await searchListings(currentSearch, buildQueryParams());
    return {
      data: filterActiveListings(response.data ?? []),
      meta: response.meta,
    };
  }
  const response = await getListings(buildQueryParams());
  return {
    data: response.data ?? [],
    meta: response.meta,
  };
}

//Load or reload listings from page 1. Called on initial load and whenever filters change.
async function loadListings() {
  resetInfinityScroll();
  showLoading();

  try {
    const { data, meta } = await fetchPage();

    updateSearchInfo(currentSearch, meta?.totalCount ?? data.length);

    if (!data.length) {
      showEmpty();
      return;
    }

    showListings(data);
    updateTotalCount(meta);

    if (meta?.isLastPage) {
      allListingsLoaded = true;
      if (meta.totalCount > ITEMS_PER_PAGE) showEndOfListings();
    }
  } catch (err) {
    showError(err.message);
  }
}

//Load and append the next page (called by infinity scroll)
async function loadMore() {
  if (isLoading || allListingsLoaded) return;

  currentPage++;
  isLoading = true;
  showLoadingMore();

  try {
    const { data, meta } = await fetchPage();

    if (data.length) {
      appendListings(data);
      updateTotalCount(meta);
    }

    if (meta?.isLastPage || data.length === 0) {
      allListingsLoaded = true;
      showEndOfListings();
    } else {
      hideLoadMore();
    }
  } catch (err) {
    currentPage--; //revert so retry fetches the same page
    hideLoadMore();
  } finally {
    isLoading = false;
  }
}

// Infinity scroll
function initInfinityScroll() {
  window.removeEventListener('scroll', handleScroll);
  window.addEventListener('scroll', handleScroll, { passive: true });
}

// Scroll handler throttled via requestAnimationFrame
function handleScroll() {
  if (scrollTicking) return;
  scrollTicking = true;

  requestAnimationFrame(() => {
    scrollTicking = false;

    if (isLoading || allListingsLoaded || !els?.grid) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 500;
    if (scrollPosition >= threshold) loadMore();
  });
}

function resetInfinityScroll() {
  currentPage = 1;
  allListingsLoaded = false;
  isLoading = false;
}

// URL persistence
function updateURL() {
  const params = new URLSearchParams();
  if (currentPage > 1) params.set('page', currentPage);
  if (currentSearch) params.set('q', currentSearch);
  if (!activeOnly) params.set('active', 'false');

  const qs = params.toString();
  history.replaceState(null, '', qs ? `/?${qs}` : '/');
}

function readURLParams() {
  const params = new URLSearchParams(window.location.search);

  currentPage = parseInt(params.get('page')) || 1;
  currentSearch = params.get('q') || '';
  activeOnly = params.get('active') !== 'false';

  if (els.searchInput && currentSearch) {
    els.searchInput.value = currentSearch;
    els.clearSearch?.classList.remove('hidden');
  }
  if (els.activeFilter) els.activeFilter.checked = activeOnly;
}

// Search
async function handleSearch(query) {
  currentSearch = query.trim();
  currentPage = 1;
  updateURL();
  await loadListings();
}

export async function clearAllFilters() {
  currentSearch = '';
  activeOnly = true;
  currentPage = 1;

  if (els.searchInput) els.searchInput.value = '';
  if (els.activeFilter) els.activeFilter.checked = true;

  updateSearchInfo('', 0);
  updateURL();
  await loadListings();
}

// Event listeners
function initEventListeners() {
  const { searchInput, clearSearch, clearFilters, activeFilter, retryBtn, resetFilters } = els;

  if (searchInput) {
    // Trigger search on Enter
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch(searchInput.value);
      }
    });

    // Show/hide clear button while typing
    searchInput.addEventListener('input', () => {
      clearSearch?.classList.toggle('hidden', !searchInput.value);
    });
  }

  // Search icon button (useful on touch screens)
  els.searchBtn?.addEventListener('click', () => {
    handleSearch(searchInput?.value || '');
  });

  // Clear search × button
  clearSearch?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    clearSearch.classList.add('hidden');
    handleSearch('');
  });

  // "Clear all filters" link in search-info bar
  clearFilters?.addEventListener('click', clearAllFilters);

  // "Clear all filters" button in empty state
  resetFilters?.addEventListener('click', clearAllFilters);

  // Active-only toggle
  activeFilter?.addEventListener('change', async () => {
    activeOnly = activeFilter.checked;
    currentPage = 1;
    updateURL();
    await loadListings();
  });

  // Fallback "Load more" button (in case scroll isn't available)
  document.getElementById('load-more-btn')?.addEventListener('click', loadMore);

  // Retry button in error state
  retryBtn?.addEventListener('click', loadListings);
}

// Init / Cleanup
export async function initListingsHandler() {
  els = getElements(); // cache once — avoids repeated getElementById lookups
  readURLParams();
  initEventListeners();
  await loadListings();
  initInfinityScroll();
}

//Clean up when leaving the home page.
export function cleanupListingsHandler() {
  window.removeEventListener('scroll', handleScroll);

  // Full reset — not just infinity-scroll vars
  currentPage = 1;
  currentSearch = '';
  activeOnly = true;
  totalPages = 1;
  totalCount = 0;
  isLoading = false;
  allListingsLoaded = false;
  scrollTicking = false;
  els = null;
}

export { loadListings };