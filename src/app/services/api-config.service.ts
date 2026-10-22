import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private http = inject(HttpClient);
  private readonly STORAGE_KEY = 'crn_api_base_url';

  // Default to HTTPS port 7025 (as configured in launchSettings.json)
  private readonly defaultBaseUrl = 'https://localhost:7025';

  private baseUrlSubject: BehaviorSubject<string>;
  public baseUrl$: Observable<string>;

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const initial = saved ? saved.trim() : this.defaultBaseUrl;
    this.baseUrlSubject = new BehaviorSubject<string>(initial);
    this.baseUrl$ = this.baseUrlSubject.asObservable();
  }

  get baseUrl(): string {
    return this.baseUrlSubject.value.replace(/\/+$/, '');
  }

  setBaseUrl(url: string): void {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    localStorage.setItem(this.STORAGE_KEY, cleanUrl);
    this.baseUrlSubject.next(cleanUrl);
  }

  resetToDefault(): void {
    this.setBaseUrl(this.defaultBaseUrl);
  }

  /**
   * Health check to test backend reachability (Swagger JSON or v1 products endpoint)
   */
  checkHealth(targetUrl?: string): Observable<{ reachable: boolean; statusText: string; latencyMs: number }> {
    const url = (targetUrl || this.baseUrl).replace(/\/+$/, '');
    const startTime = performance.now();

    // Check swagger or products endpoint with 3s timeout
    return this.http.get(`${url}/swagger/v1/swagger.json`, { responseType: 'text' }).pipe(
      timeout(3500),
      map(() => ({
        reachable: true,
        statusText: 'Connected (Swagger OK)',
        latencyMs: Math.round(performance.now() - startTime)
      })),
      catchError(err => {
        // Fallback check to api/v1/products
        return this.http.get(`${url}/api/v1/products?page=1&pageSize=1`).pipe(
          timeout(3000),
          map(() => ({
            reachable: true,
            statusText: 'Connected (API OK)',
            latencyMs: Math.round(performance.now() - startTime)
          })),
          catchError(innerErr => of({
            reachable: false,
            statusText: innerErr.status === 0
              ? 'Unreachable (Check SSL/CORS or try HTTP http://localhost:5287)'
              : `HTTP Error: ${innerErr.status}`,
            latencyMs: Math.round(performance.now() - startTime)
          }))
        );
      })
    );
  }
}
