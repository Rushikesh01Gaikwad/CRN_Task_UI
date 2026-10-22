import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isLoginTab ? 'Sign In' : 'Create Account' }}</h3>
          <button class="btn-close" (click)="close.emit()">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Auth Tabs -->
          <div class="auth-tabs">
            <button
              type="button"
              class="tab-btn"
              [class.active]="isLoginTab"
              (click)="isLoginTab = true"
            >
              Sign In
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="!isLoginTab"
              (click)="isLoginTab = false"
            >
              Register
            </button>
          </div>

          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="error-banner">
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Sign In Form -->
          <form *ngIf="isLoginTab" (ngSubmit)="handleLogin()">
            <div class="form-group">
              <label for="loginUsername">Username</label>
              <input
                id="loginUsername"
                type="text"
                class="form-control"
                [(ngModel)]="loginData.username"
                name="username"
                required
                placeholder="Enter username"
              />
            </div>

            <div class="form-group">
              <label for="loginPassword">Password</label>
              <input
                id="loginPassword"
                type="password"
                class="form-control"
                [(ngModel)]="loginData.password"
                name="password"
                required
                placeholder="Enter password"
              />
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
              <button
                type="button"
                class="btn btn-sm btn-secondary"
                (click)="fillDemoUser()"
              >
                Auto-fill Demo
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="loading || !loginData.username || !loginData.password"
              >
                {{ loading ? 'Signing In...' : 'Sign In' }}
              </button>
            </div>
          </form>

          <!-- Register Form -->
          <form *ngIf="!isLoginTab" (ngSubmit)="handleRegister()">
            <div class="form-group">
              <label for="regUsername">Username</label>
              <input
                id="regUsername"
                type="text"
                class="form-control"
                [(ngModel)]="regData.username"
                name="regUsername"
                required
                minlength="3"
                placeholder="e.g. user1"
              />
            </div>

            <div class="form-group">
              <label for="regEmail">Email Address</label>
              <input
                id="regEmail"
                type="email"
                class="form-control"
                [(ngModel)]="regData.email"
                name="regEmail"
                required
                placeholder="e.g. user@example.com"
              />
            </div>

            <div class="form-group">
              <label for="regPassword">Password (min 6 characters)</label>
              <input
                id="regPassword"
                type="password"
                class="form-control"
                [(ngModel)]="regData.password"
                name="regPassword"
                required
                minlength="6"
                placeholder="Enter password"
              />
            </div>

            <div class="form-group">
              <label for="regRole">Role</label>
              <select
                id="regRole"
                class="form-control"
                [(ngModel)]="regData.role"
                name="regRole"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="loading || !regData.username || !regData.email || !regData.password"
              >
                {{ loading ? 'Creating Account...' : 'Create Account' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-tabs {
      display: flex;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 18px;
    }

    .tab-btn {
      flex: 1;
      padding: 8px 12px;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--color-text-muted);
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        color: var(--color-text-main);
      }

      &.active {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
      }
    }

    .error-banner {
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      font-size: 0.8125rem;
      margin-bottom: 14px;
    }
  `]
})
export class AuthModalComponent {
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  @Output() close = new EventEmitter<void>();

  isLoginTab = true;
  loading = false;
  errorMessage = '';

  loginData = {
    username: '',
    password: ''
  };

  regData = {
    username: '',
    email: '',
    password: '',
    role: 'User'
  };

  fillDemoUser(): void {
    this.loginData.username = 'admin';
    this.loginData.password = 'Admin@123';
  }

  handleLogin(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: res => {
        this.loading = false;
        this.toast.success(`Welcome back, ${res.username}!`);
        this.close.emit();
      },
      error: err => {
        this.loading = false;
        const msg = err.error?.message || err.message || 'Login failed. Please verify credentials.';
        this.errorMessage = msg;
        this.toast.error(msg, 'Authentication Failed');
      }
    });
  }

  handleRegister(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.regData).subscribe({
      next: res => {
        this.loading = false;
        this.toast.success(`Account created! Welcome, ${res.username}.`);
        this.close.emit();
      },
      error: err => {
        this.loading = false;
        const msg = err.error?.message || err.message || 'Registration failed.';
        this.errorMessage = msg;
        this.toast.error(msg, 'Registration Error');
      }
    });
  }
}
