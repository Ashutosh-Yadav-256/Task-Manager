import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="header">
          <span class="angular-badge">Angular 17 Standalone</span>
          <h2>Create Account</h2>
          <p>Sign up to start organizing tasks</p>
        </div>

        <div class="error-alert" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onRegister()">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              [(ngModel)]="username"
              placeholder="Choose a username"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password (min 6 characters)</label>
            <input
              id="password"
              type="password"
              name="password"
              [(ngModel)]="password"
              placeholder="Create password"
              required
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              placeholder="Re-enter password"
              required
            />
          </div>

          <button type="submit" class="submit-btn" [disabled]="loading">
            <span *ngIf="!loading">Create Account</span>
            <span *ngIf="loading">Registering...</span>
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/login">Sign In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 72px);
      padding: 24px;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    .angular-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      color: #ff3355;
      background: rgba(255, 51, 85, 0.15);
      border: 1px solid rgba(255, 51, 85, 0.3);
      padding: 2px 8px;
      border-radius: 4px;
      margin-bottom: 12px;
    }
    h2 {
      font-size: 26px;
      font-weight: 800;
      color: #f8fafc;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      margin-top: 4px;
    }
    .error-alert {
      background: rgba(239, 68, 68, 0.15);
      border-left: 4px solid #ef4444;
      color: #fca5a5;
      padding: 12px;
      border-radius: 6px;
      font-size: 13px;
      margin-bottom: 20px;
    }
    .form-group {
      margin-bottom: 18px;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 6px;
    }
    input {
      width: 100%;
      padding: 12px 14px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #f8fafc;
      font-size: 14px;
    }
    input:focus {
      outline: none;
      border-color: #10b981;
    }
    .submit-btn {
      width: 100%;
      padding: 14px;
      background: #10b981;
      color: #ffffff;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
      margin-top: 8px;
    }
    .submit-btn:hover:not(:disabled) {
      background: #059669;
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: #94a3b8;
    }
    .auth-footer a {
      color: #34d399;
      text-decoration: none;
      font-weight: 600;
    }
    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  username = '';
  password = '';
  confirmPassword = '';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter all fields.';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register({ username: this.username.trim(), password: this.password }).subscribe({
      next: () => {
        // Automatically login after successful registration
        this.authService.login({ username: this.username.trim(), password: this.password }).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/board']);
          },
          error: (err) => {
            this.loading = false;
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.msg || 'Registration failed.';
      }
    });
  }
}
