/**
 * Floating success toast.
 * Appears at top-center of viewport, auto-dismisses after 2.5s.
 *
 * Usage:
 *   showSuccessToast('Listing deleted.');
 */
export function showSuccessToast(message) {
  const toast = document.createElement('div');
  toast.className =
    'fixed top-4 left-1/2 -translate-x-1/2 z-50 ' +
    'px-6 py-3 bg-green-600 text-white rounded-xl shadow-lg ' +
    'text-sm font-medium transition-opacity duration-500';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 2500);
}