/*  Listing Card Component */

import { imagePlaceholderHtml } from '../utils/format.js';

/**
 * Get the current highest bid from bids array
 * @param {Array} bids - array of bid objects
 * @returns {number} Highest bid amount or 0
 */

function getCurrentBid(bids) {
  if (!bids || bids.length === 0) return 0;
  return Math.max(...bids.map((bid) => bid.amount));
}

/**
 * Format time remaining until end date
 * @param {string} endsAt - ISO date string
 * @returns {string} - formatted time remaining
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
 * 
 * @param {string} endsAt - ISO date string
 * @returns {{ type: string, label: string, cssClass: string }}
 */
export function getListingStatus(endsAt) {
  const now = new Date();
  const end = new Date(endsAt);
  const diff = end - now;

  // Ended
  if (diff <= 0) {
    return { type: 'ended', label: 'Ended', cssClass: 'badge-error' };
  }

  // Ending soon ( < 24 hours)
  const hoursLeft = diff / (1000 * 60 * 60);
  if (hoursLeft < 24) {
    return { type: 'ending-soon', label: 'Ending Soon', cssClass: 'badge-warning' };
  }

  // Active ( > 24 hours)
  return { type: 'active', label: 'Active', cssClass: 'badge-success' };
}

/**
 * Truncate text to a max length
 * @param {string} text - text to truncate
 * @param {number} maxLength - max length
 * @returns {string} truncated text
 */
function truncateText(text, maxLength = 60) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Create a listing card HTML string
 * @param {Object} listing - listing data from API
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

  // Truncated description
  const shortDescription = truncateText(description);

  return `
    <article class="card shadow-sm group cursor-pointer hover:-translate-y-1 transition-transform duration-200 ${isEnded ? 'opacity-70 grayscale-[30%]' : ''}">
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
          ` : imagePlaceholderHtml()}
          
          <!-- Status badge -->
          <span class="absolute top-2 right-2 ${status.cssClass}">
            ${status.label}
          </span>
          
          <!-- Time left badge -->
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
          <p class="text-text-secondary text-sm line-clamp-1 mb-3 min-h-[20px]">
            ${shortDescription || ''}
          </p>
          
          <!-- Meta info -->
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
 * @param {Array} listings - array of listing objects
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
    <article class="card shadow-sm animate-pulse">
      <!-- Image skeleton -->
      <div class="aspect-[4/3] rounded-t-xl bg-gray-200"></div>
      
      <!-- Content skeleton -->
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
 * @param {number} count - number of skeleton cards
 * @returns {string} HTML string of skeleton cards
 */
export function createSkeletonCards(count = 6) {
  return Array(count).fill(createSkeletonCard()).join('');
}