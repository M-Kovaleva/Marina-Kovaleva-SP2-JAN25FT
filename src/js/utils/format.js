/* Shared formatting helpers */

/** Escape strings before injecting into innerHTML (XSS protection). */
export function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Format ISO date as "25 Apr 2026". */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/**
 * Returns HTML for an image placeholder shown when a listing has no media.
 * Used in listing cards, listing detail page, and profile bids list.
 * Stays consistent across the app.
 *
 * @returns {string} HTML markup
 */
export function imagePlaceholderHtml() {
  return `
    <div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
      <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    </div>
  `;
}

/**
 * Returns HTML for a circular loading spinner.
 *
 * The base classes (border style, rounded-full, animate-spin) are always
 * applied. Pass Tailwind size and spacing classes via extraClasses:
 *
 *   spinnerHtml('w-10 h-10')            — page-level loading
 *   spinnerHtml('w-8 h-8')              — section / tab loading
 *   spinnerHtml('w-12 h-12 mb-4')       — grid loading with margin
 *
 * @param {string} [extraClasses=''] - Tailwind size / spacing classes
 * @returns {string} HTML markup
 */
export function spinnerHtml(extraClasses = '') {
  return `<div class="border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin ${extraClasses}"></div>`;
}

/**
 * Currently shows the raw number without thousand separators
 * (e.g. 1000, not 1,000). Centralised so the format can be changed
 * project-wide by editing one place.
 *
 * @param {number|null|undefined} amount
 * @returns {string}
 */
export function formatCredits(amount) {
  return String(amount ?? 0);
}