import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiConfigService } from './api-config.service';
import { ApiResponse, PagedResult } from '../models/common.model';
import {
  Product,
  Item,
  CreateProductDto,
  UpdateProductDto,
  CreateItemDto,
  UpdateItemDto
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  private get apiUrl(): string {
    return `${this.apiConfig.baseUrl}/api/v1/products`;
  }

  // ==========================================
  // Products Operations (CRUD + Pagination + Search)
  // ==========================================

  getProducts(
    page: number = 1,
    pageSize: number = 10,
    search?: string
  ): Observable<PagedResult<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<ApiResponse<PagedResult<Product>>>(this.apiUrl, { params }).pipe(
      map(res => {
        if (res && res.data) {
          return res.data;
        }
        // Fallback in case raw paged result is returned
        const anyRes = res as any;
        if (anyRes && Array.isArray(anyRes.items)) {
          return anyRes;
        }
        return {
          page: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasPrevious: false,
          hasNext: false,
          items: []
        };
      })
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`).pipe(
      map(res => (res && res.data ? res.data : (res as any)))
    );
  }

  createProduct(dto: CreateProductDto): Observable<Product> {
    return this.http.post<ApiResponse<Product>>(this.apiUrl, dto).pipe(
      map(res => (res && res.data ? res.data : (res as any)))
    );
  }

  updateProduct(id: number, dto: UpdateProductDto): Observable<Product> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, dto).pipe(
      map(res => (res && res.data ? res.data : (res as any)))
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // Sub-resource Items Operations (CRUD for [dbo].[Item])
  // ==========================================

  getItems(productId: number): Observable<Item[]> {
    return this.http.get<ApiResponse<Item[]>>(`${this.apiUrl}/${productId}/items`).pipe(
      map(res => (res && res.data ? res.data : (Array.isArray(res) ? (res as any) : [])))
    );
  }

  getItemById(productId: number, itemId: number): Observable<Item> {
    return this.http.get<ApiResponse<Item>>(`${this.apiUrl}/${productId}/items/${itemId}`).pipe(
      map(res => (res && res.data ? res.data : (res as any)))
    );
  }

  createItem(productId: number, dto: CreateItemDto): Observable<Item> {
    return this.http.post<ApiResponse<Item>>(`${this.apiUrl}/${productId}/items`, dto).pipe(
      map(res => (res && res.data ? res.data : (res as any)))
    );
  }

  updateItem(productId: number, itemId: number, dto: UpdateItemDto): Observable<Item> {
    return this.http.put<ApiResponse<Item>>(`${this.apiUrl}/${productId}/items/${itemId}`, dto).pipe(
      map(res => (res && res.data ? res.data : (res as any)))
    );
  }

  deleteItem(productId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}/items/${itemId}`);
  }
}
