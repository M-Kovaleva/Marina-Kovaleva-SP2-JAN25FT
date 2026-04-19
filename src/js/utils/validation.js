/**
 * Form Validation Utilities
 */

/**
 * Validate email format (must be @stud.noroff.no)
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const pattern = /^[a-zA-Z0-9._%+-]+@stud\.noroff\.no$/;
  return pattern.test(email);
}

/**
 * Validate username (letters, numbers, underscores only)
 * @param {string} name
 * @returns {boolean}
 */
export function isValidUsername(name) {
  const pattern = /^[a-zA-Z0-9_]+$/;
  return pattern.test(name);
}

/**
 * Validate password (minimum 8 characters)
 * @param {string} password
 * @returns {boolean}
 */
export function isValidPassword(password) {
  return password.length >= 8;
}

/**
 * Validate URL format
 * @param {string} url
 * @returns {boolean}
 */
export function isValidUrl(url) {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate login form
 * @param {Object} data - { email, password }
 * @returns {Object} - { isValid, errors }
 */
export function validateLoginForm({ email, password }) {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Must be a @stud.noroff.no email';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 8 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate register form
 * @param {Object} data - { name, email, password }
 * @returns {Object} - { isValid, errors }
 */
export function validateRegisterForm({ name, email, password }) {
  const errors = {};

  if (!name) {
    errors.name = 'Username is required';
  } else if (!isValidUsername(name)) {
    errors.name = 'Only letters, numbers, and underscores allowed';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Must be a @stud.noroff.no email';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 8 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate listing form
 * @param {Object} data - { title, endsAt, description, media }
 * @returns {Object} - { isValid, errors }
 */
export function validateListingForm({ title, endsAt, description, media }) {
  const errors = {};

  if (!title) {
    errors.title = 'Title is required';
  } else if (title.length > 280) {
    errors.title = 'Title must be less than 280 characters';
  }

  if (!endsAt) {
    errors.endsAt = 'End date is required';
  } else {
    const endDate = new Date(endsAt);
    if (endDate <= new Date()) {
      errors.endsAt = 'End date must be in the future';
    }
  }

  // Validate media URLs if provided
  if (media && Array.isArray(media)) {
    const invalidUrls = media.filter((m) => m.url && !isValidUrl(m.url));
    if (invalidUrls.length > 0) {
      errors.media = 'One or more image URLs are invalid';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Show error on input field
 * @param {HTMLInputElement} input
 * @param {string} message
 */
export function showInputError(input, message) {
  input.classList.remove('input');
  input.classList.add('input-error');

  // Find or create error message element
  let errorEl = input.parentElement.querySelector('.error-message');
  if (!errorEl) {
    errorEl = document.createElement('p');
    errorEl.className = 'error-message text-error text-xs mt-1';
    input.parentElement.appendChild(errorEl);
  }
  errorEl.textContent = message;
}

/**
 * Clear error from input field
 * @param {HTMLInputElement} input
 */
export function clearInputError(input) {
  input.classList.remove('input-error');
  input.classList.add('input');

  const errorEl = input.parentElement.querySelector('.error-message');
  if (errorEl) {
    errorEl.remove();
  }
}

/**
 * Clear all errors from form
 * @param {HTMLFormElement} form
 */
export function clearFormErrors(form) {
  const inputs = form.querySelectorAll('.input-error');
  inputs.forEach((input) => clearInputError(input));

  const errorMessages = form.querySelectorAll('.error-message');
  errorMessages.forEach((el) => el.remove());
}