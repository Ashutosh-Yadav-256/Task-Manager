import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="brand">
        <span class="brand-name">TaskFlow</span>
        <span class="tech-badge">Angular 17</span>
      </div>

      <div class="nav-right" *ngIf="authService.currentUser$ | async as user">
        <span class="user-greeting">Signed in as <strong>{{ user.username }}</strong></span>
        <button class="logout-btn" (click)="onLogout()">Sign Out</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 28px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-icon {
      font-size: 20px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.5px;
    }
    .tech-badge {
      font-size: 11px;
      font-weight: 700;
      background: rgba(221, 0, 49, 0.2);
      color: #ff3355;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(221, 0, 49, 0.4);
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .user-greeting {
      font-size: 13px;
      color: #94a3b8;
    }
    .user-greeting strong {
      color: #f8fafc;
    }
    .logout-btn {
      padding: 8px 16px;
      border-radius: 8px;
      background: #334155;
      color: #f8fafc;
      font-size: 13px;
      font-weight: 600;
    }
    .logout-btn:hover {
      background: #475569;
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
