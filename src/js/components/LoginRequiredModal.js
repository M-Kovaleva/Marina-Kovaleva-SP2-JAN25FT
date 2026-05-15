/* Login required modal */

import { navigateTo } from '../router/router.js';

let modalEl = null;
let escHandler = null;

function template() {
  return `
    <div id="login-required-modal" class="hidden fixed inset-0 z-50 overflow-y-auto">

      <!-- Backdrop -->
      <div id="login-required-backdrop" class="fixed inset-0 bg-black/50"></div>

      <!-- Centering wrapper -->
      <div class="relative flex min-h-full items-center justify-center p-4" >

        <!-- Card -->
        <div class="relative bg-white rounded-xl w-full max-w-sm p-6 space-y-5 my-4" role="dialog" aria-modal="true" aria-labelledby="login-required-title">

          <!-- Close button -->
          <button id="login-required-close"
            class="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors  cursor-pointer"
            aria-label="Close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Content -->
          <div class="text-center space-y-2 pt-2">
            <h2 id="login-required-title" class="text-xl font-bold text-text-primary">Login required</h2>
            <p class="text-text-secondary text-sm">
              Sign in or create an account to continue.
            </p>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
            <button id="login-required-signin" class="btn-primary w-full py-3">
              Sign in
            </button>
            <button id="login-required-register" class="btn-secondary w-full py-3">
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function mountLoginRequiredModal() {
  if (modalEl) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = template().trim();
  modalEl = wrapper.firstElementChild;
  document.body.appendChild(modalEl);

  // Backdrop click closes the modal
  document
    .getElementById('login-required-backdrop')
    .addEventListener('click', hideLoginRequiredModal);

  // X button closes the modal
  document.getElementById('login-required-close').addEventListener('click', hideLoginRequiredModal);

  // Sign in -> navigate to /login
  document.getElementById('login-required-signin').addEventListener('click', () => {
    hideLoginRequiredModal();
    navigateTo('/login');
  });

  // Register -> navigate to /register
  document.getElementById('login-required-register').addEventListener('click', () => {
    hideLoginRequiredModal();
    navigateTo('/register');
  });
}

export function showLoginRequiredModal() {
  if (!modalEl) mountLoginRequiredModal();

  modalEl.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');

  // Close on Escape
  escHandler = (e) => {
    if (e.key === 'Escape') hideLoginRequiredModal();
  };
  document.addEventListener('keydown', escHandler);
}

export function hideLoginRequiredModal() {
  if (!modalEl) return;

  modalEl.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');

  if (escHandler) {
    document.removeEventListener('keydown', escHandler);
    escHandler = null;
  }
}
