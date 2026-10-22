import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiConfigService } from '../../services/api-config.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-api-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Backend API Configuration</h3>
          <button class="btn-close" (click)="close.emit()">&times;</button>
        </div>

        <div class="modal-body">
          <p style="color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 14px;">
            Select a target backend address or enter a custom URL.
          </p>

          <div class="preset-buttons">
            <button
              type="button"
              class="btn btn-sm"
              [class.btn-primary]="apiUrl === 'https://localhost:7025'"
              [class.btn-secondary]="apiUrl !== 'https://localhost:7025'"
              (click)="setPreset('https://localhost:7025')"
            >
              HTTPS (7025)
            </button>
            <button
              type="button"
              class="btn btn-sm"
              [class.btn-primary]="apiUrl === 'http://localhost:5287'"
              [class.btn-secondary]="apiUrl !== 'http://localhost:5287'"
              (click)="setPreset('http://localhost:5287')"
            >
              HTTP (5287)
            </button>
            <button
              type="button"
              class="btn btn-sm"
              [class.btn-primary]="apiUrl === 'http://localhost:5000'"
              [class.btn-secondary]="apiUrl !== 'http://localhost:5000'"
              (click)="setPreset('http://localhost:5000')"
            >
              Docker (5000)
            </button>
          </div>

          <div class="form-group" style="margin-top: 14px;">
            <label for="apiUrlInput">API Base URL</label>
            <input
              id="apiUrlInput"
              type="text"
              class="form-control"
              [(ngModel)]="apiUrl"
              placeholder="https://localhost:7025"
            />
          </div>

          <div class="health-result" *ngIf="testResult">
            <div class="status-indicator" [class.status-online]="testResult.reachable" [class.status-offline]="!testResult.reachable"></div>
            <div>
              <strong style="font-size: 0.875rem;">{{ testResult.reachable ? 'Connection Successful' : 'Connection Failed' }}</strong>
              <div style="font-size: 0.8rem; color: var(--color-text-muted);">
                {{ testResult.statusText }} ({{ testResult.latencyMs }}ms)
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            [disabled]="isTesting"
            (click)="testConnection()"
          >
            {{ isTesting ? 'Testing...' : 'Test Connection' }}
          </button>
          <button
            type="button"
            class="btn btn-primary"
            (click)="saveAndClose()"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preset-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .health-result {
      margin-top: 14px;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      background: #f8fafc;
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;

      &.status-online {
        background: #16a34a;
      }

      &.status-offline {
        background: #dc2626;
      }
    }
  `]
})
export class ApiConfigModalComponent implements OnInit {
  private apiConfig = inject(ApiConfigService);
  private toast = inject(ToastService);

  @Output() close = new EventEmitter<void>();

  apiUrl = '';
  isTesting = false;
  testResult: { reachable: boolean; statusText: string; latencyMs: number } | null = null;

  ngOnInit(): void {
    this.apiUrl = this.apiConfig.baseUrl;
  }

  setPreset(url: string): void {
    this.apiUrl = url;
    this.testResult = null;
  }

  testConnection(): void {
    this.isTesting = true;
    this.testResult = null;

    this.apiConfig.checkHealth(this.apiUrl).subscribe(res => {
      this.isTesting = false;
      this.testResult = res;

      if (res.reachable) {
        this.toast.success(`Connected to API in ${res.latencyMs}ms!`);
      } else {
        this.toast.error(res.statusText, 'Connection Error');
      }
    });
  }

  saveAndClose(): void {
    if (!this.apiUrl.trim()) {
      this.toast.warning('Please specify an API URL');
      return;
    }

    this.apiConfig.setBaseUrl(this.apiUrl);
    this.toast.success(`API URL updated.`);
    this.close.emit();
  }
}
