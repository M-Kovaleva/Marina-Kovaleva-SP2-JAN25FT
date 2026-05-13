/* Form Validation Utilities */

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
 * @param {Object} data - email, password
 * @returns {Object} - isValid, errors
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
 * @param {Object} data - name, email, password
 * @returns {Object} - isValid, errors
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
 * @param {Object} data - title, endsAt, description, media
 * @returns {Object} - isValid, errors
 */
export function validateListingForm({ title, endsAt, description, media }) {
  const errors = {};

  if (!title) {
    errors.title = 'Title is required';
  } else if (title.length > 280) {
    errors.title = 'Title must be less than 280 characters';
  }

  // Skip endsAt validation entirely when null (for edit mode — field is readonly)
  if (endsAt !== null) {
    if (!endsAt) {
      errors.endsAt = 'End date is required';
    } else {
      const endDate = new Date(endsAt);
      const oneYearAhead = new Date();
      oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);

      if (isNaN(endDate.getTime()) || endDate > oneYearAhead) {
        errors.endsAt = 'End date must be within one year from now';
      } else if (endDate <= new Date()) {
        errors.endsAt = 'End date must be in the future';
      }
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
    errorEl.className = 'error-message field-error';
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

/**
 * Validate profile edit form
 * @param {Object} data - bio, avatarUrl, bannerUrl
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateProfileForm({ bio, avatarUrl, bannerUrl }) {
  const errors = {};

  if (bio && bio.length > 160) {
    errors.bio = 'Bio must be 160 characters or less';
  }

  if (avatarUrl && !isValidUrl(avatarUrl)) {
    errors.avatar = 'Must be a valid URL starting with https://';
  }

  if (bannerUrl && !isValidUrl(bannerUrl)) {
    errors.banner = 'Must be a valid URL starting with https://';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Display field-specific errors on a form via showInputError
 * Looks up inputs by their `name` attribute
 *
 * @param {HTMLFormElement} form
 * @param {Object} errors - fieldName: 'error message'
 */
export function showValidationErrors(form, errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const input = form.querySelector(`[name="${field}"]`);
    if (input) {
      showInputError(input, message);
    }
  });
}