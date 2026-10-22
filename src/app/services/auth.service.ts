import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { ApiConfigService } from './api-config.service';
import { ApiResponse } from '../models/common.model';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  UserSession
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  private readonly TOKEN_KEY = 'crn_access_token';
  private readonly REFRESH_TOKEN_KEY = 'crn_refresh_token';
  private readonly USER_KEY = 'crn_user_session';

  private currentUserSubject = new BehaviorSubject<UserSession | null>(this.loadStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  public isRefreshing = false;
  public refreshTokenSubject = new BehaviorSubject<string | null>(null);

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get refreshTokenValue(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  get currentUser(): UserSession | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  private loadStoredUser(): UserSession | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    const url = `${this.apiConfig.baseUrl}/api/v1/auth/register`;
    return this.http.post<ApiResponse<AuthResponse>>(url, request).pipe(
      map(res => {
        if (!res.success || !res.data) {
          throw new Error(res.message || 'Registration failed');
        }
        return res.data;
      }),
      tap(data => this.saveSession(data))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    const url = `${this.apiConfig.baseUrl}/api/v1/auth/login`;
    return this.http.post<ApiResponse<AuthResponse>>(url, request).pipe(
      map(res => {
        if (!res.success || !res.data) {
          throw new Error(res.message || 'Login failed');
        }
        return res.data;
      }),
      tap(data => this.saveSession(data))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const token = this.token;
    const refreshToken = this.refreshTokenValue;

    if (!token || !refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    const url = `${this.apiConfig.baseUrl}/api/v1/auth/refresh-token`;
    const body: RefreshTokenRequest = { token, refreshToken };

    return this.http.post<ApiResponse<AuthResponse>>(url, body).pipe(
      map(res => {
        if (!res.success || !res.data) {
          throw new Error(res.message || 'Token refresh failed');
        }
        return res.data;
      }),
      tap(data => this.saveSession(data)),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    const token = this.refreshTokenValue;
    if (token && this.token) {
      const url = `${this.apiConfig.baseUrl}/api/v1/auth/revoke-token`;
      // Call revoke in background, ignore error
      this.http.post(url, JSON.stringify(token), {
        headers: { 'Content-Type': 'application/json' }
      }).subscribe({ error: () => {} });
    }

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  private saveSession(data: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, data.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);

    const user: UserSession = {
      username: data.username,
      email: data.email,
      role: data.role,
      token: data.token,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
