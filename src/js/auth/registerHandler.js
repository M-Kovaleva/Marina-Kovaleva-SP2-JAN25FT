/* Register handler */

import { register, login } from '../api/apiClient.js';
import { saveAuth } from './storage.js';
import { syncUserFromProfile } from './userSync.js';
import { validateRegisterForm, clearFormErrors, showValidationErrors } from '../utils/validation.js';
import { showFormError, hideFormError, setFormLoading } from '../utils/formState.js';
import { updateNavAuth } from '../components/Nav.js';
import { showSuccessToast } from '../utils/toast.js';
import { navigateTo } from '../router/router.js';

const REDIRECT_DELAY_MS = 1500;

//Initialize register form handler - call this in RegisterView.init()
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
      // Create the account
      await register(data);

      // Auto-login to get access token
      const loginResponse = await login({
        email: data.email,
        password: data.password,
      });
      saveAuth(loginResponse.data.accessToken, loginResponse.data);

      // Sync full profile
      try {
        await syncUserFromProfile(loginResponse.data.name);
      } catch (syncErr) {
        console.warn('Profile sync failed after register:', syncErr.message);
      }

      // Update navbar with fresh data
      updateNavAuth();

      // Show success and redirect
      showSuccessToast('Account created.');
      setTimeout(() => navigateTo('/'), REDIRECT_DELAY_MS);
    } catch (error) {
      showFormError(errorContainer, error.message);
      setFormLoading(form, false, { busy: 'Creating account...', idle: 'Create account' });
    }
  });
}
