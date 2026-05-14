/*  Form State Utilities
Shared helpers for managing loading and error states on forms
*/

/**
 * Show an error block and set its message text
 * @param {HTMLElement|null} container
 * @param {string} message
 */
export function showFormError(container, message) {
  if (!container) return;
  container.classList.remove('hidden');
  const p = container.querySelector('p');
  if (p) p.textContent = message;
}

/**
 * Hide an error block
 * @param {HTMLElement|null} container
 */
export function hideFormError(container) {
  if (!container) return;
  container.classList.add('hidden');
}

/**
 * Show an error block by element ID and set its message text
 * @param {string} elementId
 * @param {string} message
 */
export function showBlockError(elementId, message) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.classList.remove('hidden');
  const p = el.querySelector('p');
  if (p) p.textContent = message;
}

/**
 * Hide an error block by element ID
 * @param {string} elementId
 */
export function hideBlockError(elementId) {
  document.getElementById(elementId)?.classList.add('hidden');
}

// Loading state
/**
 * Toggle the loading state of a form
 * @param {HTMLFormElement} form
 * @param {boolean} isLoading
 * @param {Object} labels
 * @param {string} labels.busy - Button text while loading (for example 'Signing in…')
 * @param {string} labels.idle - Button text when ready(for example 'Sign in')
 */
export function setFormLoading(form, isLoading, { busy = 'Loading…', idle = 'Submit' } = {}) {
  const button = form.querySelector('button[type="submit"]');
  const inputs = form.querySelectorAll('input');

  button.disabled = isLoading;
  button.textContent = isLoading ? busy : idle;
  inputs.forEach((el) => (el.disabled = isLoading));
}