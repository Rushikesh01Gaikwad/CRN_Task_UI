import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="(toasts$ | async) as toasts">
      <div
        *ngFor="let toast of toasts"
        class="toast-item"
        [ngClass]="'toast-' + toast.type"
      >
        <div class="toast-icon">
          <svg *ngIf="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg *ngIf="toast.type === 'error'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg *ngIf="toast.type === 'warning'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg *ngIf="toast.type === 'info'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div class="toast-content">
          <div class="toast-title" *ngIf="toast.title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" (click)="remove(toast.id)" aria-label="Close notification">
          &times;
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
      width: calc(100% - 40px);
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      border-radius: var(--radius-md);
      background: #ffffff;
      color: var(--color-text-main);
      border: 1px solid var(--color-border);
      border-left: 4px solid var(--color-primary);
      box-shadow: var(--shadow-md);
      transition: all var(--transition-normal);
    }

    .toast-success {
      border-left-color: #16a34a;
      .toast-icon { color: #16a34a; }
    }

    .toast-error {
      border-left-color: #dc2626;
      .toast-icon { color: #dc2626; }
    }

    .toast-warning {
      border-left-color: #d97706;
      .toast-icon { color: #d97706; }
    }

    .toast-info {
      border-left-color: #2563eb;
      .toast-icon { color: #2563eb; }
    }

    .toast-icon {
      flex-shrink: 0;
      margin-top: 1px;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--color-text-main);
      margin-bottom: 2px;
    }

    .toast-message {
      font-size: 0.8125rem;
      color: var(--color-text-muted);
      word-break: break-word;
      line-height: 1.4;
    }

    .toast-close {
      background: transparent;
      border: 0;
      color: var(--color-text-subtle);
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      padding: 0 4px;

      &:hover {
        color: var(--color-text-main);
      }
    }
  `]
})
export class ToastComponent {
  private toastService = inject(ToastService);
  toasts$ = this.toastService.toasts$;

  remove(id: string): void {
    this.toastService.remove(id);
  }
}
