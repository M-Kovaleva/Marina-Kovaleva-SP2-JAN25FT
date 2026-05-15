/**
 * Listing utilities
 * Display status of a listing from its end date
 * Returns one of three states:
 *   ended — auction is over
 *   ending-soon — less than 24 hours remaining
 *   active — more than 24 hours remaining
 * @param {string} endsAt - ISO date string
 * @returns {{ type: string, label: string, cssClass: string }}
 */
export function getListingStatus(endsAt) {
  const diff = new Date(endsAt) - new Date();

  if (diff <= 0) {
    return { type: 'ended', label: 'Ended', cssClass: 'badge-error' };
  }

  const hoursLeft = diff / (1000 * 60 * 60);
  if (hoursLeft < 24) {
    return { type: 'ending-soon', label: 'Ending Soon', cssClass: 'badge-warning' };
  }

  return { type: 'active', label: 'Active', cssClass: 'badge-success' };
}
