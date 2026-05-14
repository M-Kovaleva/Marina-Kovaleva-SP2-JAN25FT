/* Bid form handler */

import { placeBid, getListing } from '../api/apiClient.js';
import { getUser, isLoggedIn, getUserCredits } from '../auth/storage.js';
import { syncUserFromProfile } from '../auth/userSync.js';
import { updateNavAuth } from '../components/Nav.js';
import { showSuccessToast } from '../utils/toast.js';
import { formatCredits } from '../utils/format.js';
import { clearFormErrors, showInputError } from '../utils/validation.js';
import { showBlockError, hideBlockError } from '../utils/formState.js';

const STATE_IDS = [
  'state-ended',
  'state-guest',
  'state-own',
  'state-winning',
  'bid-form',
];

let listingId = null;
let submitAttached = false;
let onBidPlacedCallback = null;

/**
 * Initial render
 * @param {Object} listing
 * @param {Object} [options]
 * @param {Function} [options.onBidPlaced] - called with updated listing after a successful bid, so the caller can refresh summary / history
 */
export function initBidForm(listing, { onBidPlaced } = {}) {
  listingId = listing.id;
  submitAttached = false;
  onBidPlacedCallback = onBidPlaced ?? null;

  renderState(listing);
  attachSubmitHandler();
}

//Force-transition to the ended state - called by the countdown when the auction expires live on the open page
export function setBidFormEnded() {
  showState('state-ended');
}

//Reset module state when leaving the page
export function cleanupBidForm() {
  listingId = null;
  submitAttached = false;
  onBidPlacedCallback = null;
}

//States machine - decide which of the five states to show.Order matters: ended - guest - own - already winning - form
function renderState(listing) {
  if (new Date(listing.endsAt) <= new Date()) return showState('state-ended');
  if (!isLoggedIn()) return showState('state-guest');
  if (listing.seller?.name === getUser()?.name) return showState('state-own');
  if (isUserWinning(listing.bids)) return showState('state-winning');

  showState('bid-form');
  refreshBidHint(listing.bids ?? [], getUserCredits() ?? 0);

  // Clear stale errors carried over from a previous bid attempt
  const form = document.getElementById('bid-form');
  if (form) clearFormErrors(form);
}

function showState(id) {
  STATE_IDS.forEach((s) =>
    document.getElementById(s)?.classList.add('hidden')
  );
  document.getElementById(id)?.classList.remove('hidden');
}

// Returns true if the current user holds the highest bid. Empty bid history - false, no winner yet
function isUserWinning(bids) {
  if (!bids?.length) return false;

  const me = getUser()?.name;
  if (!me) return false;

  const highest = bids.reduce(
    (max, b) => (b.amount > max.amount ? b : max),
    bids[0]
  );
  return highest.bidder?.name === me;
}

// Form setup
function refreshBidHint(bids, newCredits) {
  const highest = bids.length ? Math.max(...bids.map((b) => b.amount)) : 0;
  const newMin = highest + 1;

  const input = document.getElementById('bid-amount');
  input.min = newMin;
  input.max = newCredits;
  input.placeholder = `Min: ${newMin}`;

  document.getElementById('bid-hint').textContent =
    `Minimum: ${newMin} cr · Your balance: ${formatCredits(newCredits)} cr`;
}

function attachSubmitHandler() {
  if (submitAttached) return;
  const form = document.getElementById('bid-form');
  if (!form) return;
  form.addEventListener('submit', handleSubmit);
  submitAttached = true;
}

// Submit
async function handleSubmit(e) {
  e.preventDefault();

  const form = document.getElementById('bid-form');
  const input = document.getElementById('bid-amount');
  const submitBtn = document.getElementById('bid-submit');

  clearFormErrors(form);
  hideBlockError('bid-error');

  const amount = Number(input.value);
  const minBid = Number(input.min) || 1;
  const userCredits = getUserCredits() ?? 0;

  // Field-level validation — inline under input
  if (!Number.isInteger(amount) || amount < minBid) {
    showInputError(
      input,
      `Bid must be a whole number, at least ${minBid} credits.`
    );
    return;
  }
  if (amount > userCredits) {
    showInputError(
      input,
      `You only have ${formatCredits(userCredits)} credits available.`
    );
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Placing bid…';

  try {
    await placeBid(listingId, amount);

    // Server is source of truth — refresh listing + user in parallel
    const [listingRes] = await Promise.all([
      getListing(listingId, true, true),
      syncUserFromProfile(getUser().name),
    ]);
    const updated = listingRes.data;

    input.value = '';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Place Bid';

    updateNavAuth();
    onBidPlacedCallback?.(updated);
    renderState(updated);
    showSuccessToast('Bid placed.');
  } catch (err) {
    showBlockError('bid-error', err.message || 'Could not place bid. Try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Place Bid';
  }
}
