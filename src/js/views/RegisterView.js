/* Register view */

import { initRegisterHandler } from '../auth/registerHandler.js';

export class RegisterView {
  constructor(params) {
    this.params = params;
  }

  async render() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <h1 class="auth-title">Create account</h1>
          
          <!-- Error message (hidden by default) -->
          <div id="register-error" class="hidden mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
            <p class="alert-error"></p>
          </div>
          
          <form id="register-form" class="space-y-5" novalidate>
            <div>
              <label for="name" class="label">Username</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="your_username"
                autocomplete="username"
                class="input"
              />
              <p class="hint">Letters, numbers, underscores only</p>
            </div>
            
            <div>
              <label for="email" class="label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="name@stud.noroff.no"
                autocomplete="email"
                class="input"
              />
              <p class="hint">Must be @stud.noroff.no</p>
            </div>
            
            <div>
              <label for="password" class="label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="••••••••"
                autocomplete="new-password"
                class="input"
              />
              <p class="hint">Minimum 8 characters</p>
            </div>
            
            <button type="submit" class="btn-primary w-full py-3">
              Create account
            </button>
          </form>
          
          <p class="text-center text-text-secondary mt-6 text-sm sm:text-base">
            Already have an account?
            <a href="/login" data-link class="text-primary-500 hover:text-primary-600 hover:underline font-medium ml-1">
              Sign in
            </a>
          </p>
        </div>
      </div>
    `;
  }

  async init() {
    initRegisterHandler();
  }
}