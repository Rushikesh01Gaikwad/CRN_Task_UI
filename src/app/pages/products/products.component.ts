import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../../Services/product.service';
import { Product } from '../../../Models/product';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);

  products: Product[] = [];
  productName = '';
  createdBy = 'Rushikesh';
  editingId: number | null = null;
  errorMessage = '';
  successMessage = '';
  loading = false;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: response => {
        this.products = response.products;
        this.loading = false;
      },
      error: error => {
        this.errorMessage =
          error.status === 0
            ? 'Cannot connect to the API. Check the API URL and CORS.'
            : `Unable to load products (${error.status}).`;
        this.loading = false;
      }
    });
  }

  saveProduct(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const name = this.productName.trim();

    if (!name || name.length > 255) {
      this.errorMessage =
        'Enter a product name with a maximum of 255 characters.';
      return;
    }

    if (this.editingId !== null) {
      this.productService.updateProduct(this.editingId, {
        productName: name,
        modifiedBy: this.createdBy.trim()
      }).subscribe({
        next: () => {
          this.successMessage = 'Product updated successfully.';
          this.resetForm();
          this.loadProducts();
        },
        error: error => {
          this.errorMessage =
            `Update failed (${error.status}). Check authentication and API logs.`;
        }
      });

      return;
    }

    this.productService.createProduct({
      productName: name,
      createdBy: this.createdBy.trim(),
      items: []
    }).subscribe({
      next: () => {
        this.successMessage = 'Product created successfully.';
        this.resetForm();
        this.loadProducts();
      },
      error: error => {
        this.errorMessage =
          `Create failed (${error.status}). Check authentication and API logs.`;
      }
    });
  }

  editProduct(product: Product): void {
    this.editingId = product.id;
    this.productName = product.productName;
    this.createdBy = product.modifiedBy || product.createdBy;
    this.successMessage = '';
    this.errorMessage = '';
  }

  deleteProduct(id: number): void {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.successMessage = 'Product deleted successfully.';
        this.loadProducts();
      },
      error: error => {
        this.errorMessage =
          `Delete failed (${error.status}). Check authentication and API logs.`;
      }
    });
  }

  resetForm(): void {
    this.productName = '';
    this.createdBy = 'Rushikesh';
    this.editingId = null;
  }
}