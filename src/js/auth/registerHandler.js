/**
 * Register Handler
 * Handles register form submission
 */

import { register, login } from '../api/apiClient.js';
import { saveAuth } from './storage.js';
import {
  validateRegisterForm,
  showInputError,
  clearFormErrors,
} from '../utils/validation.js';
import { updateNavAuth } from '../components/Nav.js';
import { navigateTo } from '../router/router.js';

/**
 * Initialize register form handler
 * Call this in RegisterView.init()
 */
export function initRegisterHandler() {
  const form = document.getElementById('register-form');
  const errorContainer = document.getElementById('register-error');
  const successContainer = document.getElementById('register-success');

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
      // Register user
      await register(data);

      // Auto-login after registration
      const loginResponse = await login({
        email: data.email,
        password: data.password,
      });

      // Save auth data
      saveAuth(loginResponse.data.accessToken, loginResponse.data);

      // Update navbar
      updateNavAuth();

      // Show success message and hide form
      showSuccess(form, successContainer);

      // Redirect to home after delay
      setTimeout(() => {
        navigateTo('/');
      }, 1500);
    } catch (error) {
      showError(errorContainer, error.message);
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
 * Show success message and hide form
 * @param {HTMLFormElement} form
 * @param {HTMLElement} successContainer
 */
function showSuccess(form, successContainer) {
  if (form) {
    form.classList.add('hidden');
  }
  if (successContainer) {
    successContainer.classList.remove('hidden');
  }
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
    button.textContent = 'Create Account';
    inputs.forEach((input) => (input.disabled = false));
  }
}