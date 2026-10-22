import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { Product, Item } from '../../models/product.model';

@Component({
  selector: 'app-item-manager-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h3>Inventory Items: {{ product.productName }}</h3>
            <span style="font-size: 0.8rem; color: var(--color-text-subtle);">
              Product ID #{{ product.id }}
            </span>
          </div>
          <button class="btn-close" (click)="close.emit()">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Add Item Bar -->
          <div class="add-item-bar">
            <div>
              <label style="font-size: 0.8rem; font-weight: 500; color: var(--color-text-main); display: block; margin-bottom: 5px;">
                Add Stock Item
              </label>
              <div style="display: flex; gap: 8px;">
                <input
                  type="number"
                  class="form-control"
                  style="max-width: 180px;"
                  [(ngModel)]="newQuantity"
                  placeholder="Quantity"
                  min="1"
                />
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  [disabled]="isAdding || newQuantity <= 0"
                  (click)="addItem()"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  {{ isAdding ? 'Adding...' : 'Add Item' }}
                </button>
              </div>
            </div>

            <!-- Stats Pill -->
            <div class="summary-pill">
              <div>Total Items: <strong>{{ items.length }}</strong></div>
              <div>Total Units: <strong>{{ totalQuantity }}</strong></div>
            </div>
          </div>

          <!-- Loading state -->
          <div *ngIf="loading" style="text-align: center; padding: 24px; color: var(--color-text-subtle); font-size: 0.875rem;">
            Loading items...
          </div>

          <!-- Items Table -->
          <div class="table-container" *ngIf="!loading">
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 20%;">Item ID</th>
                  <th style="width: 50%;">Quantity</th>
                  <th style="width: 30%; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of items">
                  <td>
                    <span class="item-id">#{{ item.id }}</span>
                  </td>
                  <td>
                    <!-- View mode -->
                    <div *ngIf="editingItemId !== item.id" style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-weight: 600; font-size: 0.95rem; color: var(--color-text-main);">
                        {{ item.quantity }}
                      </span>
                      <span class="badge badge-secondary">units</span>
                    </div>

                    <!-- Edit mode -->
                    <div *ngIf="editingItemId === item.id" style="display: flex; align-items: center; gap: 6px;">
                      <input
                        type="number"
                        class="form-control"
                        style="width: 90px; padding: 4px 8px;"
                        [(ngModel)]="editQuantity"
                        min="1"
                      />
                      <button
                        type="button"
                        class="btn btn-sm btn-primary"
                        [disabled]="editQuantity <= 0"
                        (click)="saveEdit(item)"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm btn-secondary"
                        (click)="cancelEdit()"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px;" *ngIf="editingItemId !== item.id">
                      <button
                        type="button"
                        class="btn btn-sm btn-secondary"
                        (click)="startEdit(item)"
                        title="Edit Quantity"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm btn-danger"
                        (click)="deleteItem(item.id)"
                        title="Delete Item"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="items.length === 0">
                  <td colspan="3" style="text-align: center; padding: 28px; color: var(--color-text-subtle); font-size: 0.85rem;">
                    No inventory items found. Add one above.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="close.emit()">
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .add-item-bar {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      background: #f8fafc;
      border: 1px solid var(--color-border);
      margin-bottom: 16px;
    }

    .summary-pill {
      font-size: 0.8125rem;
      background: #ffffff;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      gap: 2px;
      text-align: right;

      strong {
        color: var(--color-text-main);
      }
    }

    .table-container {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;

      th {
        background: #f8fafc;
        padding: 10px 14px;
        color: var(--color-text-muted);
        font-weight: 600;
        font-size: 0.75rem;
        text-transform: uppercase;
        border-bottom: 1px solid var(--color-border);
      }

      td {
        padding: 10px 14px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      tbody tr:last-child td {
        border-bottom: none;
      }

      tbody tr:hover {
        background: #f8fafc;
      }
    }

    .item-id {
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 0.8rem;
      color: var(--color-text-subtle);
    }
  `]
})
export class ItemManagerModalComponent implements OnInit {
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  @Input() product!: Product;
  @Output() close = new EventEmitter<void>();
  @Output() itemsChanged = new EventEmitter<void>();

  items: Item[] = [];
  loading = false;
  newQuantity: number = 1;
  isAdding = false;

  editingItemId: number | null = null;
  editQuantity: number = 1;

  get totalQuantity(): number {
    return this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.productService.getItems(this.product.id).subscribe({
      next: items => {
        this.items = items || [];
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.toast.error('Failed to load items for product', 'Error');
      }
    });
  }

  addItem(): void {
    if (this.newQuantity <= 0) {
      this.toast.warning('Quantity must be greater than zero.');
      return;
    }

    this.isAdding = true;
    this.productService.createItem(this.product.id, { quantity: this.newQuantity }).subscribe({
      next: createdItem => {
        this.isAdding = false;
        this.items.push(createdItem);
        this.newQuantity = 1;
        this.toast.success(`Item added with quantity ${createdItem.quantity}.`);
        this.itemsChanged.emit();
      },
      error: err => {
        this.isAdding = false;
        this.toast.error(err.error?.message || 'Failed to add item', 'Error');
      }
    });
  }

  startEdit(item: Item): void {
    this.editingItemId = item.id;
    this.editQuantity = item.quantity;
  }

  cancelEdit(): void {
    this.editingItemId = null;
  }

  saveEdit(item: Item): void {
    if (this.editQuantity <= 0) {
      this.toast.warning('Quantity must be greater than zero.');
      return;
    }

    this.productService.updateItem(this.product.id, item.id, { quantity: this.editQuantity }).subscribe({
      next: updated => {
        item.quantity = updated.quantity;
        this.editingItemId = null;
        this.toast.success('Item quantity updated.');
        this.itemsChanged.emit();
      },
      error: err => {
        this.toast.error(err.error?.message || 'Failed to update item', 'Error');
      }
    });
  }

  deleteItem(itemId: number): void {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    this.productService.deleteItem(this.product.id, itemId).subscribe({
      next: () => {
        this.items = this.items.filter(i => i.id !== itemId);
        this.toast.success('Item deleted.');
        this.itemsChanged.emit();
      },
      error: err => {
        this.toast.error(err.error?.message || 'Failed to delete item', 'Error');
      }
    });
  }
}
