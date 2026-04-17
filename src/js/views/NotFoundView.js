/**
 * 404 Not Found View
 */
export class NotFoundView {
  constructor(params) {
    this.params = params;
  }

  async render() {
    return `
      <div class="min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center px-4">
        <div class="text-center max-w-md">
          <!-- 404 Number -->
          <h1 class="text-6xl sm:text-8xl font-bold text-primary-500 mb-4">404</h1>
          
          <!-- Title -->
          <h2 class="text-xl sm:text-2xl font-semibold text-text-primary mb-3 sm:mb-4">
            Page Not Found
          </h2>
          
          <!-- Description -->
          <p class="text-text-secondary mb-6 sm:mb-8 text-sm sm:text-base">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/" data-link class="btn-primary">
              Back to Home
            </a>
            <button onclick="history.back()" class="btn-secondary">
              Go Back
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async init() {}
}