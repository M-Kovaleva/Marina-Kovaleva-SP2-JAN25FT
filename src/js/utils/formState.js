/**
 * Form State Utilities
 *
 * Shared helpers for managing loading and error states on forms.
 * Used by loginHandler, registerHandler, and any other handler
 * that owns a form with a submit button and an error block.
 *
 * Two flavours of error helpers:
 *
 *   showFormError(container, message)  — takes a DOM element directly.
 *   showBlockError(id, message)        — looks up element by ID.
 *
 * Use the element-based pair (showFormError / hideFormError) when the
 * caller already holds a reference to the container (loginHandler,
 * registerHandler).
 *
 * Use the ID-based pair (showBlockError / hideBlockError) when the
 * element is looked up fresh each time (bidFormHandler,
 * listingFormHandler, profileEditHandler).
 */

// ─────────────────────────────────────────────
// Element-based error helpers
// ─────────────────────────────────────────────

/**
 * Show an error block and set its message text.
 * Expects the container to contain a <p> element for the message.
 *
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
 * Hide an error block.
 *
 * @param {HTMLElement|null} container
 */
export function hideFormError(container) {
  if (!container) return;
  container.classList.add('hidden');
}

// ─────────────────────────────────────────────
// ID-based error helpers
// ─────────────────────────────────────────────

/**
 * Show an error block by element ID and set its message text.
 * Expects the element to contain a <p> for the message.
 *
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
 * Hide an error block by element ID.
 *
 * @param {string} elementId
 */
export function hideBlockError(elementId) {
  document.getElementById(elementId)?.classList.add('hidden');
}

// ─────────────────────────────────────────────
// Loading state
// ─────────────────────────────────────────────

/**
 * Toggle the loading state of a form:
 *   - disables / re-enables the submit button and all inputs
 *   - swaps the button label between busy and idle text
 *
 * @param {HTMLFormElement} form
 * @param {boolean} isLoading
 * @param {Object} labels
 * @param {string} labels.busy - Button text while loading  (e.g. 'Signing in…')
 * @param {string} labels.idle - Button text when ready     (e.g. 'Sign in')
 */
export function setFormLoading(form, isLoading, { busy = 'Loading…', idle = 'Submit' } = {}) {
  const button = form.querySelector('button[type="submit"]');
  const inputs = form.querySelectorAll('input');

  button.disabled = isLoading;
  button.textContent = isLoading ? busy : idle;
  inputs.forEach((el) => (el.disabled = isLoading));
}