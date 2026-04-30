/**
 * Listing Card Component
 * Reusable card for displaying listing previews
 */

/**
 * Get the current highest bid from bids array
 * @param {Array} bids - Array of bid objects
 * @returns {number} Highest bid amount or 0
 */
function getCurrentBid(bids) {
  if (!bids || bids.length === 0) return 0;
  return Math.max(...bids.map((bid) => bid.amount));
}

/**
 * Format time remaining until end date
 * @param {string} endsAt - ISO date string
 * @returns {string} Formatted time remaining
 */
function formatTimeLeft(endsAt) {
  const now = new Date();
  const end = new Date(endsAt);
  const diff = end - now;

  // Already ended
  if (diff <= 0) {
    return 'Ended';
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${seconds}s`;
}

/**
 * Get listing status based on end date
 * @param {string} endsAt - ISO date string
 * @returns {Object} Status object with type and label
 */
function getListingStatus(endsAt) {
  const now = new Date();
  const end = new Date(endsAt);
  const diff = end - now;

  // Ended
  if (diff <= 0) {
    return {
      type: 'ended',
      label: 'Ended',
      badgeClass: 'bg-gray-500/90 text-white',
    };
  }

  // Ending soon (less than 24 hours)
  const hoursLeft = diff / (1000 * 60 * 60);
  if (hoursLeft < 24) {
    return {
      type: 'ending-soon',
      label: 'Ending Soon',
      badgeClass: 'bg-warning/90 text-amber-900',
    };
  }

  // Active
  return {
    type: 'active',
    label: 'Active',
    badgeClass: 'bg-success/90 text-green-900',
  };
}

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = 80) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Create a listing card HTML string
 * @param {Object} listing - Listing data from API
 * @returns {string} HTML string for the card
 */
export function createListingCard(listing) {
  const {
    id,
    title = 'Untitled Listing',
    description = '',
    media = [],
    endsAt,
    _count = {},
    bids = [],
  } = listing;

  // Get image URL (first media or empty)
  const imageUrl = media?.[0]?.url || '';
  const imageAlt = media?.[0]?.alt || title;

  // Get bid info
  const currentBid = getCurrentBid(bids);
  const bidCount = _count.bids || bids.length || 0;

  // Get status and time left
  const status = getListingStatus(endsAt);
  const timeLeft = formatTimeLeft(endsAt);
  const isEnded = status.type === 'ended';

  // Truncate description
  const shortDescription = truncateText(description);

  return `
    <article class="card group cursor-pointer hover:-translate-y-1 transition-transform duration-200 ${isEnded ? 'opacity-70 grayscale-[30%]' : ''}">
      <a href="/listing/${id}" data-link class="block">
        <!-- Image Container -->
        <div class="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-200">
          ${imageUrl ? `
            <img
              src="${imageUrl}"
              alt="${imageAlt}"
              class="w-full h-full object-cover"
              loading="lazy"
              onerror="this.style.display='none'"
            />
          ` : `
            <div class="absolute inset-0 flex items-center justify-center text-gray-400">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          `}
          
          <!-- Status Badge -->
          <span class="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${status.badgeClass}">
            ${status.label}
          </span>
          
          <!-- Time Left Badge -->
          <span class="absolute bottom-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-black/70 text-white backdrop-blur-sm">
            ⏱ ${timeLeft}
          </span>
        </div>
        
        <!-- Content -->
        <div class="p-4">
          <!-- Title -->
          <h3 class="font-semibold text-text-primary truncate mb-1 group-hover:text-primary-500 transition-colors">
            ${title}
          </h3>
          
          <!-- Description -->
          ${shortDescription ? `
            <p class="text-text-secondary text-sm line-clamp-2 mb-3">
              ${shortDescription}
            </p>
          ` : ''}
          
          <!-- Meta Info -->
          <div class="flex justify-between items-end pt-3 border-t border-border">
            <div>
              <p class="text-xs text-text-secondary mb-0.5">Current bid</p>
              <p class="font-bold ${isEnded ? 'text-text-secondary' : 'text-primary-500'}">
                ${currentBid > 0 ? `${currentBid} 💰` : 'No bids yet'}
              </p>
            </div>
            <span class="text-xs text-text-secondary">
              ${bidCount} ${bidCount === 1 ? 'bid' : 'bids'}
            </span>
          </div>
        </div>
      </a>
    </article>
  `;
}

/**
 * Create multiple listing cards
 * @param {Array} listings - Array of listing objects
 * @returns {string} HTML string of all cards
 */
export function createListingCards(listings) {
  if (!listings || listings.length === 0) {
    return '';
  }
  return listings.map((listing) => createListingCard(listing)).join('');
}

/**
 * Create a skeleton loading card
 * @returns {string} HTML string for skeleton card
 */
export function createSkeletonCard() {
  return `
    <article class="card animate-pulse">
      <!-- Image Skeleton -->
      <div class="aspect-[4/3] rounded-t-xl bg-gray-200"></div>
      
      <!-- Content Skeleton -->
      <div class="p-4">
        <div class="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded mb-1 w-full"></div>
        <div class="h-4 bg-gray-200 rounded mb-3 w-2/3"></div>
        
        <div class="flex justify-between items-end pt-3 border-t border-border">
          <div>
            <div class="h-3 bg-gray-200 rounded mb-1 w-16"></div>
            <div class="h-5 bg-gray-200 rounded w-20"></div>
          </div>
          <div class="h-4 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Create multiple skeleton loading cards
 * @param {number} count - Number of skeleton cards
 * @returns {string} HTML string of skeleton cards
 */
export function createSkeletonCards(count = 6) {
  return Array(count).fill(createSkeletonCard()).join('');
}