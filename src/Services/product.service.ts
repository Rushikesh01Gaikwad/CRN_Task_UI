import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Product,
  CreateProduct,
  UpdateProduct
} from '../Models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  // Change this URL to match your actual ASP.NET Core API port.
  private apiUrl = 'https://localhost:7059/api/products';

  getProducts(): Observable<{
    page: number;
    pageSize: number;
    totalCount: number;
    products: Product[];
  }> {
    return this.http.get<{
      page: number;
      pageSize: number;
      totalCount: number;
      products: Product[];
    }>(this.apiUrl);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: CreateProduct): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(
    id: number,
    product: UpdateProduct
  ): Observable<Product> {
    return this.http.put<Product>(
      `${this.apiUrl}/${id}`,
      product
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}