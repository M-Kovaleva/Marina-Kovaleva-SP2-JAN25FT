/**
 * Avatar Rendering Utility
 *
 * Renders a user avatar (or any circular image) inside a container element.
 *
 * Three states — all handled automatically:
 *
 *   No URL      → container is empty; its background colour shows through
 *                 as the placeholder (use bg-gray-200 on the container).
 *   Loading     → same as above — background is visible until img loads.
 *   Broken URL  → onerror removes the img; background shows through again.
 *   Loaded      → img covers the container via object-cover.
 *
 * The container is responsible for size, shape, and placeholder colour.
 * This helper only manages the img element inside it.
 *
 * Usage:
 *   renderAvatarInto(document.getElementById('profile-avatar'), {
 *     url: user.avatar?.url,
 *     alt: user.name,
 *   });
 */

/**
 * @param {HTMLElement} container
 * @param {Object}  [options]
 * @param {string}  [options.url] - Image URL; empty / falsy → placeholder
 * @param {string}  [options.alt] - Alt text for the img element
 */
export function renderAvatarInto(container, { url, alt = '' } = {}) {
  container.innerHTML = '';
  if (!url?.trim()) return; // no image → container background (placeholder) shows

  const img = document.createElement('img');
  img.alt = alt;
  img.className = 'w-full h-full object-cover';
  img.onerror = () => img.remove(); // broken URL → remove img → placeholder shows
  img.src = url; // set src last so onerror is wired before load starts

  container.appendChild(img);
}