/**
 * Floating success toast.
 * Appears at top-right of viewport, auto-dismisses after 2.5s.
 * Styling lives in input.css under .toast / .toast-success classes.
 *
 * Usage:
 *   showSuccessToast('Listing deleted.');
 */
export function showSuccessToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);////////////////////set 500
  }, 2500);///////////////////////////set 2500
}