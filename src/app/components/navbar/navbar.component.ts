import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ApiConfigService } from '../../services/api-config.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar">
      <div class="nav-container">
        <!-- Brand / Logo -->
        <div class="brand">
          <div class="brand-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div>
            <div class="brand-title">Product Management</div>
            <div class="brand-subtitle">Inventory & Catalog Portal</div>
          </div>
        </div>

        <!-- Right actions -->
        <div class="nav-actions">
          <!-- API Status Pill -->
          <button
            type="button"
            class="status-pill"
            (click)="openApiConfig.emit()"
            title="Click to view API settings"
          >
            <span class="status-dot" [class.online]="apiStatus === 'online'" [class.offline]="apiStatus === 'offline'"></span>
            <span class="status-label">API: {{ apiStatus === 'online' ? 'Connected' : 'Offline' }}</span>
          </button>

          <!-- Auth Status / Profile -->
          <ng-container *ngIf="(currentUser$ | async) as user; else loginButton">
            <div class="user-badge">
              <div class="user-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
              <div class="user-info">
                <span class="user-name">{{ user.username }}</span>
                <span class="badge badge-primary">{{ user.role }}</span>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-secondary"
                (click)="logout()"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          </ng-container>

          <ng-template #loginButton>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              (click)="openAuth.emit()"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Sign In
            </button>
          </ng-template>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      background: #ffffff;
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-logo {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    }

    .brand-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--color-text-main);
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 0.75rem;
      color: var(--color-text-subtle);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: var(--radius-full);
      background: #f8fafc;
      border: 1px solid var(--color-border);
      color: var(--color-text-muted);
      font-size: 0.775rem;
      cursor: pointer;
      transition: background-color var(--transition-fast);

      &:hover {
        background: #f1f5f9;
        color: var(--color-text-main);
      }
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #94a3b8;

      &.online {
        background: #16a34a;
      }

      &.offline {
        background: #dc2626;
      }
    }

    .user-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      padding: 4px 6px 4px 8px;
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border);
    }

    .user-avatar {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--color-primary);
      color: #ffffff;
      font-weight: 600;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .user-name {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--color-text-main);
    }
  `]
})
export class NavbarComponent implements OnInit {
  public authService = inject(AuthService);
  public apiConfig = inject(ApiConfigService);

  @Output() openApiConfig = new EventEmitter<void>();
  @Output() openAuth = new EventEmitter<void>();

  currentUser$ = this.authService.currentUser$;
  apiStatus: 'online' | 'offline' | 'checking' = 'checking';

  ngOnInit(): void {
    this.checkApi();
    this.apiConfig.baseUrl$.subscribe(() => this.checkApi());
  }

  checkApi(): void {
    this.apiConfig.checkHealth().subscribe(res => {
      this.apiStatus = res.reachable ? 'online' : 'offline';
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
