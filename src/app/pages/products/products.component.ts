import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ApiConfigService } from '../../services/api-config.service';

import { Product, CreateItemDto } from '../../models/product.model';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ToastComponent } from '../../components/toast/toast.component';
import { ApiConfigModalComponent } from '../../components/api-config-modal/api-config-modal.component';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal.component';
import { ItemManagerModalComponent } from '../../components/item-manager-modal/item-manager-modal.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    ToastComponent,
    ApiConfigModalComponent,
    AuthModalComponent,
    ItemManagerModalComponent
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  public productService = inject(ProductService);
  public authService = inject(AuthService);
  public toast = inject(ToastService);
  public apiConfig = inject(ApiConfigService);

  readonly Math = Math;

  // Products state
  products: Product[] = [];
  loading = false;
  totalCount = 0;
  totalPages = 0;
  page = 1;
  pageSize = 10;
  searchQuery = '';

  private searchSubject = new Subject<string>();

  // Modals state
  showApiConfigModal = false;
  showAuthModal = false;
  showProductModal = false;
  showDeleteModal = false;
  selectedProductForItems: Product | null = null;
  productToDelete: Product | null = null;

  // Product Create/Edit Form state
  isEditing = false;
  currentProductId: number | null = null;
  productForm = {
    productName: '',
    author: 'Admin',
    items: [] as CreateItemDto[]
  };
  initialItemQuantity: number = 1;
  formSubmitting = false;
  fieldErrors: Record<string, string[]> = {};

  ngOnInit(): void {
    // Auto-fill author from user if logged in
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.productForm.author = user.username;
      }
    });

    // Debounced search
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.page = 1;
      this.loadProducts();
    });

    this.loadProducts();
  }

  onSearchChange(val: string): void {
    this.searchSubject.next(val);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts(this.page, this.pageSize, this.searchQuery).subscribe({
      next: paged => {
        this.products = paged.items || [];
        this.totalCount = paged.totalCount;
        this.totalPages = paged.totalPages || Math.ceil(paged.totalCount / this.pageSize) || 1;
        this.page = paged.page;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        const msg = err.status === 0
          ? 'Cannot connect to backend API. Please verify the URL and backend execution.'
          : (err.error?.message || `Failed to load products (${err.status})`);
        this.toast.error(msg, 'API Error');
      }
    });
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = Number(newSize);
    this.page = 1;
    this.loadProducts();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.loadProducts();
  }

  // ==========================================
  // Product Creation & Editing
  // ==========================================

  openCreateModal(): void {
    this.isEditing = false;
    this.currentProductId = null;
    const author = this.authService.currentUser?.username || 'Admin';
    this.productForm = {
      productName: '',
      author: author,
      items: []
    };
    this.initialItemQuantity = 1;
    this.fieldErrors = {};
    this.showProductModal = true;
  }

  openEditModal(product: Product): void {
    this.isEditing = true;
    this.currentProductId = product.id;
    const author = this.authService.currentUser?.username || product.modifiedBy || product.createdBy || 'Admin';
    this.productForm = {
      productName: product.productName,
      author: author,
      items: []
    };
    this.fieldErrors = {};
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.fieldErrors = {};
  }

  addInitialItem(): void {
    if (this.initialItemQuantity <= 0) return;
    this.productForm.items.push({ quantity: this.initialItemQuantity });
    this.initialItemQuantity = 1;
  }

  removeInitialItem(index: number): void {
    this.productForm.items.splice(index, 1);
  }

  saveProduct(): void {
    this.fieldErrors = {};
    const name = this.productForm.productName.trim();
    const author = this.productForm.author.trim();

    if (!name) {
      this.fieldErrors['productName'] = ['Product name is required.'];
      return;
    }

    if (!author) {
      this.fieldErrors['author'] = ['Author / modifier name is required.'];
      return;
    }

    this.formSubmitting = true;

    if (this.isEditing && this.currentProductId !== null) {
      // Update
      this.productService.updateProduct(this.currentProductId, {
        productName: name,
        modifiedBy: author
      }).subscribe({
        next: updated => {
          this.formSubmitting = false;
          this.toast.success(`Product "${updated.productName}" updated successfully!`);
          this.closeProductModal();
          this.loadProducts();
        },
        error: err => {
          this.formSubmitting = false;
          this.handleFormError(err);
        }
      });
    } else {
      // Create
      this.productService.createProduct({
        productName: name,
        createdBy: author,
        items: this.productForm.items.length > 0 ? this.productForm.items : undefined
      }).subscribe({
        next: created => {
          this.formSubmitting = false;
          this.toast.success(`Product "${created.productName}" created successfully!`);
          this.closeProductModal();
          this.loadProducts();
        },
        error: err => {
          this.formSubmitting = false;
          this.handleFormError(err);
        }
      });
    }
  }

  private handleFormError(err: any): void {
    if (err.error?.errors) {
      this.fieldErrors = err.error.errors;
    }
    const msg = err.error?.message || err.message || 'Action failed. Please check inputs.';
    this.toast.error(msg, 'Validation Error');
  }

  // ==========================================
  // Delete Product
  // ==========================================

  confirmDelete(product: Product): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.productToDelete = null;
    this.showDeleteModal = false;
  }

  executeDelete(): void {
    if (!this.productToDelete) return;

    const id = this.productToDelete.id;
    const name = this.productToDelete.productName;

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.toast.success(`Product "${name}" deleted.`);
        this.closeDeleteModal();
        this.loadProducts();
      },
      error: err => {
        this.toast.error(err.error?.message || 'Failed to delete product', 'Error');
        this.closeDeleteModal();
      }
    });
  }

  // ==========================================
  // Manage Sub-resource Items
  // ==========================================

  openItemsManager(product: Product): void {
    this.selectedProductForItems = product;
  }

  closeItemsManager(): void {
    this.selectedProductForItems = null;
    this.loadProducts();
  }

  getTotalQuantity(product: Product): number {
    if (!product.items || !Array.isArray(product.items)) return 0;
    return product.items.reduce((acc, i) => acc + (i.quantity || 0), 0);
  }

  get totalPageUnits(): number {
    return this.products.reduce((acc, p) => acc + this.getTotalQuantity(p), 0);
  }
}