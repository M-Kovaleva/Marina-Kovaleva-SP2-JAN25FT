/* Login handler */

import { login } from '../api/apiClient.js';
import { saveAuth } from './storage.js';
import { syncUserFromProfile } from './userSync.js';
import { validateLoginForm, clearFormErrors, showValidationErrors } from '../utils/validation.js';
import { showFormError, hideFormError, setFormLoading } from '../utils/formState.js';
import { updateNavAuth } from '../components/Nav.js';
import { navigateTo } from '../router/router.js';

// Initialize login form handler - call in LoginView.init()
export function initLoginHandler() {
  const form = document.getElementById('login-form');
  const errorContainer = document.getElementById('login-error');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    clearFormErrors(form);
    hideFormError(errorContainer);

    const formData = new FormData(form);
    const data = {
      email: formData.get('email').trim(),
      password: formData.get('password'),
    };

    const { isValid, errors } = validateLoginForm(data);
    if (!isValid) {
      showValidationErrors(form, errors);
      return;
    }

    setFormLoading(form, true, { busy: 'Signing in...', idle: 'Sign in' });

    try {
      // Authenticate — get token + basic profile (no credits in response)
      const response = await login(data);
      saveAuth(response.data.accessToken, response.data);

      // Sync full profile so localStorage has credits + _count
      try {
        await syncUserFromProfile(response.data.name);
      } catch (syncErr) {
        console.warn('Profile sync failed after login:', syncErr.message);
      }

      // Update navbar with fresh data, then redirect
      updateNavAuth();
      navigateTo('/');
    } catch (error) {
      showFormError(errorContainer, error.message);
    } finally {
      setFormLoading(form, false, { busy: 'Signing in...', idle: 'Sign in' });
    }
  });
}