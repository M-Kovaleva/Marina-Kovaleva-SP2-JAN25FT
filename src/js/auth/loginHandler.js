/**
 * Login Handler
 * Handles login form submission
 */

import { login } from '../api/apiClient.js';
import { saveAuth } from './storage.js';
import { syncUserFromProfile } from './userSync.js';
import {
  validateLoginForm,
  showInputError,
  clearFormErrors,
} from '../utils/validation.js';
import { updateNavAuth } from '../components/Nav.js';
import { navigateTo } from '../router/router.js';

/**
 * Initialize login form handler
 * Call this in LoginView.init()
 */
export function initLoginHandler() {
  const form = document.getElementById('login-form');
  const errorContainer = document.getElementById('login-error');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearFormErrors(form);
    hideError(errorContainer);

    // Get form data
    const formData = new FormData(form);
    const data = {
      email: formData.get('email').trim(),
      password: formData.get('password'),
    };

    // Validate
    const { isValid, errors } = validateLoginForm(data);

    if (!isValid) {
      showValidationErrors(form, errors);
      return;
    }

    // Disable form while submitting
    setFormLoading(form, true);

    try {
      // 1. Authenticate — get token + basic profile (no credits in response)
      const response = await login(data);
      saveAuth(response.data.accessToken, response.data);

      // 2. Sync full profile so localStorage has credits + _count
      //    (login endpoint doesn't return them — Noroff API quirk)
      try {
        await syncUserFromProfile(response.data.name);
      } catch (syncErr) {
        // Non-fatal: user is logged in, but credits may show 0 until next sync.
        // Most likely cause: missing or invalid VITE_API_KEY.
        console.warn('Profile sync failed after login:', syncErr.message);
      }

      // 3. Update navbar with fresh data, then redirect
      updateNavAuth();
      navigateTo('/');
    } catch (error) {
      showError(errorContainer, error.message);
    } finally {
      setFormLoading(form, false);
    }
  });
}

/**
 * Show validation errors on form fields
 * @param {HTMLFormElement} form
 * @param {Object} errors
 */
function showValidationErrors(form, errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const input = form.querySelector(`[name="${field}"]`);
    if (input) {
      showInputError(input, message);
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
    button.textContent = 'Signing in...';
    inputs.forEach((input) => (input.disabled = true));
  } else {
    button.disabled = false;
    button.textContent = 'Sign In';
    inputs.forEach((input) => (input.disabled = false));
  }
}