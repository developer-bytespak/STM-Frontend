/**
 * API Client for backend integration
 * Handles authentication, token management, and API requests
 */

// API_BASE_URL is used in the constructor parameter

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'service_provider' | 'local_service_manager' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'LSM' | 'ADMIN';
  region?: string;
  zipcode?: string;
  address?: string;
  location?: string;
  experience?: number;
}

class ApiClient {
  private baseURL: string;
  private getAccessToken: () => string | null;
  private onUnauthorized: () => Promise<boolean>;

  constructor(
    baseURL: string,
    getAccessToken: () => string | null,
    onUnauthorized: () => Promise<boolean>
  ) {
    this.baseURL = baseURL;
    this.getAccessToken = getAccessToken;
    this.onUnauthorized = onUnauthorized;
  }

  private async safeJson(response: Response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  private toApiError(response: Response, body: unknown): ApiError {
    const bodyObj = body as Record<string, unknown> | null;
    return {
      status: response.status,
      message: (bodyObj?.message as string) || response.statusText || 'Request failed',
      details: bodyObj?.error || body,
    };
  }

  private async doRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.ok) {
      return (await this.safeJson(response)) as T;
    }

    // Try refresh on 401 once
    if (response.status === 401 && (await this.onUnauthorized())) {
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
        credentials: 'include',
      });

      if (retryResponse.ok) {
        return (await this.safeJson(retryResponse)) as T;
      }

      const retryBody = await this.safeJson(retryResponse);
      throw this.toApiError(retryResponse, retryBody);
    }

    const body = await this.safeJson(response);
    throw this.toApiError(response, body);
  }

  async request<T>(endpoint: string, options: RequestInit = {}) {
    return this.doRequest<T>(endpoint, options);
  }

  // Auth endpoints
  async login(credentials: LoginCredentials) {
    return this.request<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterData) {
    return this.request<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refresh(refreshToken: string) {
    return this.request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getProfile() {
    return this.request<unknown>('/auth/profile', {
      method: 'GET',
    });
  }

  async getMe() {
    return this.request<{ id: number; email: string; firstName: string; lastName: string; role: string }>('/auth/me', {
      method: 'GET',
    });
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async updateProfile(data: { firstName?: string; lastName?: string; phoneNumber?: string; profilePicture?: string }) {
    return this.request<unknown>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export default ApiClient;
