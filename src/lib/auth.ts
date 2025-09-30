interface User {
  id: string;
  email: string;
  role: string;
}

class AuthManager {
  private tokenKey = 'auth_token';

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }

  login(token: string, user: User): void {
    this.setToken(token);
    // User data storage will be implemented here
  }

  logout(): void {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authManager = new AuthManager();
export type { User };