/**
 * Register View
 */

import { initRegisterHandler } from '../auth/registerHandler.js';

export class RegisterView {
  constructor(params) {
    this.params = params;
  }

  async render() {
    return `
      <div class="auth-container py-8">
        <div class="auth-card">
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-subtitle">Join BidNoroff today</p>
          
          <!-- Error Message (hidden by default) -->
          <div id="register-error" class="hidden mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
            <p class="text-error text-sm font-medium"></p>
          </div>
          
          <!-- Success Message (hidden by default) -->
          <div id="register-success" class="hidden mb-6 p-4 bg-success/10 border border-success/20 rounded-lg text-center">
            <p class="text-green-700 font-medium">✓ Account created successfully!</p>
            <p class="text-green-700 font-medium">Redirecting to Home...</p>
          </div>
          
          <form id="register-form" class="space-y-5">
            <div>
              <label for="name" class="label">Username</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                pattern="^[a-zA-Z0-9_]+$"
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
                minlength="8"
                placeholder="••••••••"
                autocomplete="new-password"
                class="input"
              />
              <p class="hint">Minimum 8 characters</p>
            </div>
            
            <button type="submit" class="btn-primary w-full py-3">
              Create Account
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