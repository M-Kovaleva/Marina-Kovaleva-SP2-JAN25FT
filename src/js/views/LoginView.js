/* Login view */

import { initLoginHandler } from '../auth/loginHandler.js';
export class LoginView {
  constructor(params) {
    this.params = params;
  }

  async render() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <h1 class="auth-title">Sign in to your account</h1>
          <!-- Error Message (hidden by default) -->
          <div id="login-error" class="hidden mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
            <p class="alert-error"></p>
          </div>
          
          <form id="login-form" class="space-y-5" novalidate>
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
            </div>
            
            <div>
              <label for="password" class="label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="••••••••"
                autocomplete="current-password"
                class="input"
              />
            </div>
            
            <button type="submit" class="btn-primary w-full py-3">
              Sign in
            </button>
          </form>
          
          <p class="text-center text-text-secondary mt-6 text-sm sm:text-base">
            Don't have an account?
            <a href="/register" data-link class="text-primary-500 hover:text-primary-600 hover:underline font-medium ml-1">
              Register
            </a>
          </p>
        </div>
      </div>
    `;
  }

  async init() {
    initLoginHandler();
  }
}