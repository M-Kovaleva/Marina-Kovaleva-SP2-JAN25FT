/**
 * Listings Handler
 * Handles fetching, displaying, filtering, and pagination of listings
 */

import { getListings, searchListings } from '../api/apiClient.js';
import {
  createListingCard,
  createListingCards,
  createSkeletonCards,
} from '../components/ListingCard.js';

// ============================================
// STATE
// ============================================

let currentPage = 1;
let currentSearch = '';
let currentTag = '';
let currentSort = 'created';
let currentSortOrder = 'desc';
let activeOnly = true;
let totalPages = 1;
let totalCount = 0;
let isLoading = false;
let allListingsLoaded = false;

const ITEMS_PER_PAGE = 12;

// ============================================
// DOM ELEMENTS
// ============================================

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
    searchInfo: document.getElementById('search-info'),
    resultsCount: document.getElementById('results-count'),
    searchQuery: document.getElementById('search-query'),
    clearFilters: document.getElementById('clear-filters'),
    categoryFilter: document.getElementById('category-filter'),
    sortSelect: document.getElementById('sort-select'),
    activeFilter: document.getElementById('active-filter'),
    retryBtn: document.getElementById('retry-btn'),
    resetFilters: document.getElementById('reset-filters'),
    loadMoreContainer: document.getElementById('load-more-container'),
  };
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

/**
 * Show loading state (initial load)
 */
function showLoading() {
  const { grid, emptyState, errorState } = getElements();

  // Show loading spinner in grid
  grid.innerHTML = `
    <div class="col-span-full">
      <div class="flex flex-col items-center justify-center py-12 sm:py-16">
        <div class="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
        <p class="text-text-secondary text-sm sm:text-base">Loading listings...</p>
      </div>
    </div>
  `;

  if (emptyState) emptyState.classList.add('hidden');
  if (errorState) errorState.classList.add('hidden');
  hideLoadMore();
}

/**
 * Show loading more indicator (for infinity scroll)
 */
function showLoadingMore() {
  const loadMoreContainer = document.getElementById('load-more-container');
  if (loadMoreContainer) {
    loadMoreContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-8">
        <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-2"></div>
        <p class="text-text-secondary text-sm">Loading more...</p>
      </div>
    `;
  }
}

/**
 * Hide load more container
 */
function hideLoadMore() {
  const loadMoreContainer = document.getElementById('load-more-container');
  if (loadMoreContainer) {
    loadMoreContainer.innerHTML = '';
  }
}

/**
 * Show end of listings message
 */
function showEndOfListings() {
  const loadMoreContainer = document.getElementById('load-more-container');
  if (loadMoreContainer && totalCount > 0) {
    loadMoreContainer.innerHTML = `
      <div class="text-center py-8 text-text-secondary">
        <p class="text-sm">You've reached the end! 🎉</p>
        <p class="text-xs mt-1">${totalCount} listings total</p>
      </div>
    `;
  }
}

/**
 * Show error state
 * @param {string} message - Error message
 */
function showError(message) {
  const { grid, emptyState, errorState, errorMessage } = getElements();

  grid.innerHTML = '';
  
  if (emptyState) emptyState.classList.add('hidden');
  if (errorState) {
    errorState.classList.remove('hidden');
    if (errorMessage) {
      errorMessage.textContent = message || 'We couldn\'t load the listings. Please try again.';
    }
  }
  hideLoadMore();
}

/**
 * Show empty state
 */
function showEmpty() {
  const { grid, emptyState, errorState } = getElements();

  grid.innerHTML = '';
  
  if (errorState) errorState.classList.add('hidden');
  if (emptyState) emptyState.classList.remove('hidden');
  hideLoadMore();
}

/**
 * Show listings (replace all)
 * @param {Array} listings - Array of listing objects
 */
function showListings(listings) {
  const { grid, emptyState, errorState } = getElements();

  if (emptyState) emptyState.classList.add('hidden');
  if (errorState) errorState.classList.add('hidden');

  grid.innerHTML = createListingCards(listings);
}

/**
 * Append listings (for infinity scroll)
 * @param {Array} listings - Array of listing objects
 */
function appendListings(listings) {
  const { grid } = getElements();
  grid.insertAdjacentHTML('beforeend', createListingCards(listings));
}

// ============================================
// INFINITY SCROLL
// ============================================

/**
 * Update total count display
 * @param {Object} meta - API meta object
 */
function updateTotalCount(meta) {
  const { showingCount, totalListings } = getElements();

  if (!meta) return;

  totalPages = meta.pageCount || 1;
  totalCount = meta.totalCount || 0;

  const showing = document.querySelectorAll('#listings-grid > article').length;
  
  if (showingCount) showingCount.textContent = showing;
  if (totalListings) totalListings.textContent = totalCount;
}

/**
 * Load more listings (next page)
 */
async function loadMore() {
  if (isLoading || allListingsLoaded) return;

  currentPage++;
  isLoading = true;
  showLoadingMore();

  try {
    let data, meta;

    if (currentSearch) {
      const response = await searchListings(currentSearch, buildQueryParams());
      data = response.data;
      meta = response.meta;
    } else {
      const response = await getListings(buildQueryParams());
      data = response.data;
      meta = response.meta;
    }

    if (data && data.length > 0) {
      appendListings(data);
      updateTotalCount(meta);
    }

    // Check if we've loaded all pages
    if (meta?.isLastPage || data.length === 0) {
      allListingsLoaded = true;
      showEndOfListings();
    } else {
      hideLoadMore();
    }
  } catch (error) {
    console.error('Failed to load more listings:', error);
    currentPage--; // Revert page increment
    hideLoadMore();
  } finally {
    isLoading = false;
  }
}

/**
 * Initialize infinity scroll with scroll event
 */
function initInfinityScroll() {
  // Use scroll event - more reliable than IntersectionObserver for dynamic content
  window.addEventListener('scroll', handleScroll);
  console.log('Infinity scroll initialized (scroll event)');
}

/**
 * Handle scroll event for infinity scroll
 */
function handleScroll() {
  if (isLoading || allListingsLoaded) return;
  
  const scrollPosition = window.innerHeight + window.scrollY;
  const threshold = document.body.offsetHeight - 500; // Load 500px before bottom
  
  if (scrollPosition >= threshold) {
    console.log('Infinity scroll: loading more...');
    loadMore();
  }
}

/**
 * Reset infinity scroll state
 */
function resetInfinityScroll() {
  currentPage = 1;
  allListingsLoaded = false;
  isLoading = false;
}

/**
 * Update URL with current filters
 */
function updateURL() {
  const params = new URLSearchParams();
  
  if (currentPage > 1) params.set('page', currentPage);
  if (currentSearch) params.set('q', currentSearch);
  if (currentTag) params.set('tag', currentTag);
  if (currentSort !== 'created' || currentSortOrder !== 'desc') {
    params.set('sort', `${currentSort}-${currentSortOrder}`);
  }
  if (!activeOnly) params.set('active', 'false');
  
  const queryString = params.toString();
  const newURL = queryString ? `/?${queryString}` : '/';
  
  history.replaceState(null, '', newURL);
}

/**
 * Read filters from URL
 */
function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  
  currentPage = parseInt(params.get('page')) || 1;
  currentSearch = params.get('q') || '';
  currentTag = params.get('tag') || '';
  activeOnly = params.get('active') !== 'false';
  
  const sort = params.get('sort');
  if (sort) {
    const [sortField, sortOrder] = sort.split('-');
    currentSort = sortField || 'created';
    currentSortOrder = sortOrder || 'desc';
  }
  
  // Update UI to match URL params
  const { searchInput, categoryFilter, sortSelect, activeFilter } = getElements();
  
  if (searchInput && currentSearch) {
    searchInput.value = currentSearch;
    const clearSearch = document.getElementById('clear-search');
    if (clearSearch) clearSearch.classList.remove('hidden');
  }
  
  if (categoryFilter && currentTag) {
    categoryFilter.value = currentTag;
  }
  
  if (sortSelect && sort) {
    sortSelect.value = sort;
  }
  
  if (activeFilter) {
    activeFilter.checked = activeOnly;
  }
}

// ============================================
// SEARCH
// ============================================

/**
 * Update search info UI
 * @param {string} query - Search query
 * @param {number} count - Results count
 */
function updateSearchInfo(query, count) {
  const { searchInfo, resultsCount, searchQuery, clearSearch } = getElements();

  if (query) {
    if (searchInfo) searchInfo.classList.remove('hidden');
    if (resultsCount) resultsCount.textContent = count;
    if (searchQuery) searchQuery.textContent = query;
    if (clearSearch) clearSearch.classList.remove('hidden');
  } else {
    if (searchInfo) searchInfo.classList.add('hidden');
    if (clearSearch) clearSearch.classList.add('hidden');
  }
}

/**
 * Handle search
 * @param {string} query - Search query
 */
async function handleSearch(query) {
  currentSearch = query.trim();
  currentPage = 1;
  updateURL();
  await loadListings();
}

/**
 * Clear search and filters
 */
async function clearAllFilters() {
  const { searchInput, categoryFilter, sortSelect, activeFilter } = getElements();

  currentSearch = '';
  currentTag = '';
  currentSort = 'created';
  currentSortOrder = 'desc';
  activeOnly = true;
  currentPage = 1;

  if (searchInput) searchInput.value = '';
  if (categoryFilter) categoryFilter.value = '';
  if (sortSelect) sortSelect.value = 'created-desc';
  if (activeFilter) activeFilter.checked = true;

  updateSearchInfo('', 0);
  updateURL();
  await loadListings();
}

// ============================================
// LOAD LISTINGS
// ============================================

/**
 * Build query parameters
 * @returns {Object} Query params object
 */
function buildQueryParams() {
  const params = {
    limit: ITEMS_PER_PAGE,
    page: currentPage,
    _bids: true,
    _seller: true,
  };

  if (activeOnly) {
    params._active = true;
  }

  if (currentTag) {
    params._tag = currentTag;
  }

  if (currentSort) {
    params.sort = currentSort;
    params.sortOrder = currentSortOrder;
  }

  return params;
}

/**
 * Load listings from API (initial load or filter change)
 */
async function loadListings() {
  // Reset infinity scroll state
  resetInfinityScroll();
  
  showLoading();
  console.log('Loading listings...', { page: currentPage, search: currentSearch });

  try {
    let data, meta;

    if (currentSearch) {
      // Search endpoint
      const response = await searchListings(currentSearch, buildQueryParams());
      data = response.data;
      meta = response.meta;
    } else {
      // Regular listings endpoint
      const response = await getListings(buildQueryParams());
      data = response.data;
      meta = response.meta;
    }

    console.log('Listings loaded:', { count: data?.length, meta });

    // Update search info
    updateSearchInfo(currentSearch, meta?.totalCount || data.length);

    // Check for empty results
    if (!data || data.length === 0) {
      showEmpty();
      return;
    }

    // Show listings
    showListings(data);
    updateTotalCount(meta);

    // Check if all loaded on first page
    if (meta?.isLastPage) {
      allListingsLoaded = true;
      console.log('All listings loaded on first page');
      if (meta.totalCount > ITEMS_PER_PAGE) {
        showEndOfListings();
      }
    }
  } catch (error) {
    console.error('Failed to load listings:', error);
    showError(error.message);
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Initialize event listeners
 */
function initEventListeners() {
  const {
    searchInput,
    clearSearch,
    clearFilters,
    categoryFilter,
    sortSelect,
    activeFilter,
    prevBtn,
    nextBtn,
    retryBtn,
    resetFilters,
  } = getElements();

  // Search on Enter
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSearch(searchInput.value);
      }
    });

    // Show/hide clear button
    searchInput.addEventListener('input', () => {
      if (clearSearch) {
        clearSearch.classList.toggle('hidden', !searchInput.value);
      }
    });
  }

  // Clear search button
  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      clearSearch.classList.add('hidden');
      handleSearch('');
    });
  }

  // Clear all filters
  if (clearFilters) {
    clearFilters.addEventListener('click', clearAllFilters);
  }

  // Reset filters (in empty state)
  if (resetFilters) {
    resetFilters.addEventListener('click', clearAllFilters);
  }

  // Category filter
  if (categoryFilter) {
    categoryFilter.addEventListener('change', async () => {
      currentTag = categoryFilter.value;
      currentPage = 1;
      updateURL();
      await loadListings();
    });
  }

  // Sort select
  if (sortSelect) {
    sortSelect.addEventListener('change', async () => {
      const [sort, order] = sortSelect.value.split('-');
      currentSort = sort;
      currentSortOrder = order;
      currentPage = 1;
      updateURL();
      await loadListings();
    });
  }

  // Active only filter
  if (activeFilter) {
    activeFilter.addEventListener('change', async () => {
      activeOnly = activeFilter.checked;
      currentPage = 1;
      updateURL();
      await loadListings();
    });
  }

  // Load More button (fallback for infinity scroll)
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', loadMore);
  }

  // Retry button
  if (retryBtn) {
    retryBtn.addEventListener('click', loadListings);
  }
}

// ============================================
// INIT
// ============================================

/**
 * Initialize listings handler
 * Call this in HomeView.init()
 */
export async function initListingsHandler() {
  // Read filters from URL first
  readURLParams();
  
  // Initialize event listeners
  initEventListeners();
  
  // Load listings
  await loadListings();
  
  // Initialize infinity scroll
  initInfinityScroll();
}

// Export for external use
export { loadListings, clearAllFilters };