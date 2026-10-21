import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  Product,
  Item,
  CreateProduct,
  UpdateProduct
} from '../Models/product';

interface ApiResponseEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

interface PagedData<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  // ASP.NET Core API endpoint (default port 7059 for HTTPS, 5000 for Docker/HTTP)
  private apiUrl = 'https://localhost:7059/api/v1/products';

  getProducts(page = 1, pageSize = 10, search = ''): Observable<{
    page: number;
    pageSize: number;
    totalCount: number;
    products: Product[];
  }> {
    const url = `${this.apiUrl}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
    return this.http.get<any>(url).pipe(
      map(res => {
        // Handle ApiResponse<PagedResultDto<ProductDto>> format
        if (res && res.data && Array.isArray(res.data.items)) {
          return {
            page: res.data.page,
            pageSize: res.data.pageSize,
            totalCount: res.data.totalCount,
            products: res.data.items
          };
        }
        // Handle legacy/direct format
        if (res && Array.isArray(res.products)) {
          return res;
        }
        return { page: 1, pageSize: 10, totalCount: 0, products: [] };
      })
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => (res && res.data ? res.data : res))
    );
  }

  createProduct(product: CreateProduct): Observable<Product> {
    return this.http.post<any>(this.apiUrl, product).pipe(
      map(res => (res && res.data ? res.data : res))
    );
  }

  updateProduct(id: number, product: UpdateProduct): Observable<Product> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, product).pipe(
      map(res => (res && res.data ? res.data : res))
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Related Resource Endpoints (Sub-resource Items)
  getItems(productId: number): Observable<Item[]> {
    return this.http.get<any>(`${this.apiUrl}/${productId}/items`).pipe(
      map(res => (res && res.data ? res.data : (Array.isArray(res) ? res : [])))
    );
  }

  addItem(productId: number, quantity: number): Observable<Item> {
    return this.http.post<any>(`${this.apiUrl}/${productId}/items`, { quantity }).pipe(
      map(res => (res && res.data ? res.data : res))
    );
  }

  deleteItem(productId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}/items/${itemId}`);
  }
}