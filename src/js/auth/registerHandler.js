/**
 * Register Handler
 * Handles register form submission
 */

import { register, login } from '../api/apiClient.js';
import { saveAuth } from './storage.js';
import { syncUserFromProfile } from './userSync.js';
import { validateRegisterForm, clearFormErrors, showValidationErrors } from '../utils/validation.js';
import { updateNavAuth } from '../components/Nav.js';
import { showSuccessToast } from '../utils/toast.js';
import { navigateTo } from '../router/router.js';

/**
 * Initialize register form handler
 * Call this in RegisterView.init()
 */
export function initRegisterHandler() {
  const form = document.getElementById('register-form');
  const errorContainer = document.getElementById('register-error');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearFormErrors(form);
    hideError(errorContainer);

    // Get form data
    const formData = new FormData(form);
    const data = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      password: formData.get('password'),
    };

    // Validate
    const { isValid, errors } = validateRegisterForm(data);

    if (!isValid) {
      showValidationErrors(form, errors);
      return;
    }

    // Disable form while submitting
    setFormLoading(form, true);

    try {
      // 1. Create the account
      await register(data);

      // 2. Auto-login to get access token
      const loginResponse = await login({
        email: data.email,
        password: data.password,
      });
      saveAuth(loginResponse.data.accessToken, loginResponse.data);

      // Sync full profile (login response lacks credits — Noroff API quirk)
      try {
        await syncUserFromProfile(loginResponse.data.name);
      } catch (syncErr) {
        // Non-fatal: account created, user logged in, credits sync later.
        console.warn('Profile sync failed after register:', syncErr.message);
      }

      // Update navbar with fresh data
      updateNavAuth();

      // Show success and redirect
      showSuccessToast('Account created.');
      setTimeout(() => {
        navigateTo('/');
      }, 1500); // Change to 1500 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    } catch (error) {
      showError(errorContainer, error.message);
      setFormLoading(form, false);
    }
  });
}

/**
 * Show error message in error container
 * @param {HTMLElement} container
 * @param {string} message
 */
function showError(container, message) {
  if (!container) return;
  container.classList.remove('hidden');
  const p = container.querySelector('p');
  if (p) {
    p.textContent = message;
  }
}

/**
 * Hide error container
 * @param {HTMLElement} container
 */
function hideError(container) {
  if (!container) return;
  container.classList.add('hidden');
}

/**
 * Set form loading state
 * @param {HTMLFormElement} form
 * @param {boolean} isLoading
 */
function setFormLoading(form, isLoading) {
  const button = form.querySelector('button[type="submit"]');
  const inputs = form.querySelectorAll('input');

  if (isLoading) {
    button.disabled = true;
    button.textContent = 'Creating account...';
    inputs.forEach((input) => (input.disabled = true));
  } else {
    button.disabled = false;
    button.textContent = 'Create account';
    inputs.forEach((input) => (input.disabled = false));
  }
}