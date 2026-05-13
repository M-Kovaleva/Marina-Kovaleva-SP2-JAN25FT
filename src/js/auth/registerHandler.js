/**
 * Register Handler
 * Handles register form submission
 */

import { register, login } from '../api/apiClient.js';
import { saveAuth } from './storage.js';
import { syncUserFromProfile } from './userSync.js';
import { validateRegisterForm, clearFormErrors, showValidationErrors } from '../utils/validation.js';
import { showFormError, hideFormError, setFormLoading } from '../utils/formState.js';
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

    clearFormErrors(form);
    hideFormError(errorContainer);

    const formData = new FormData(form);
    const data = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      password: formData.get('password'),
    };

    const { isValid, errors } = validateRegisterForm(data);
    if (!isValid) {
      showValidationErrors(form, errors);
      return;
    }

    setFormLoading(form, true, { busy: 'Creating account...', idle: 'Create account' });

    try {
      // 1. Create the account
      await register(data);

      // 2. Auto-login to get access token
      const loginResponse = await login({
        email: data.email,
        password: data.password,
      });
      saveAuth(loginResponse.data.accessToken, loginResponse.data);

      // 3. Sync full profile (login response lacks credits — Noroff API quirk)
      try {
        await syncUserFromProfile(loginResponse.data.name);
      } catch (syncErr) {
        // Non-fatal: account created, user logged in, credits sync later.
        console.warn('Profile sync failed after register:', syncErr.message);
      }

      // 4. Update navbar with fresh data
      updateNavAuth();

      // 5. Show success and redirect
      showSuccessToast('Account created.');
      setTimeout(() => navigateTo('/'), 1500);
    } catch (error) {
      showFormError(errorContainer, error.message);
      setFormLoading(form, false, { busy: 'Creating account...', idle: 'Create account' });
    }
  });
}