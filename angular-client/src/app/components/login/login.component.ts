import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="header">
          <span class="angular-badge">Angular 17 Standalone</span>
          <h2>Welcome Back</h2>
          <p>Sign in to your task workspace</p>
        </div>

        <div class="error-alert" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              [(ngModel)]="username"
              placeholder="Enter your username"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              [(ngModel)]="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" class="submit-btn" [disabled]="loading">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading">Authenticating...</span>
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/register">Register here</a>
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
      border-color: #3b82f6;
    }
    .submit-btn {
      width: 100%;
      padding: 14px;
      background: #3b82f6;
      color: #ffffff;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
      margin-top: 8px;
    }
    .submit-btn:hover:not(:disabled) {
      background: #2563eb;
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
      color: #60a5fa;
      text-decoration: none;
      font-weight: 600;
    }
    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter both username and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/board']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.msg || 'Authentication failed. Please check your credentials.';
      }
    });
  }
}
