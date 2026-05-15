/**
 * Avatar utility
 * @param {HTMLElement} container
 * @param {Object}  [options]
 * @param {string}  [options.url] - Image URL; empty / falsy - placeholder
 * @param {string}  [options.alt] - Alt text for the img element
 */
export function renderAvatarInto(container, { url, alt = '' } = {}) {
  container.innerHTML = '';
  if (!url?.trim()) return; // broken URL, loads - container background (placeholder) shows

  const img = document.createElement('img');
  img.alt = alt;
  img.className = 'w-full h-full object-cover';
  img.onerror = () => img.remove(); // remove img - placeholder shows
  img.src = url; // set src last so onerror is wired before load starts

  container.appendChild(img);
}
