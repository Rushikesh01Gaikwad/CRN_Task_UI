export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  username: string;
  email: string;
  role: string;
}

export interface UserSession {
  username: string;
  email: string;
  role: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
}
