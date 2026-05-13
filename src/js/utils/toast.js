/* Floating success toast */

export function showSuccessToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 250000);///////////////////////////set 2500!!!!!!
}