/**
 * Cookie utility functions for managing authentication tokens
 */

export interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
}

export const cookieUtils = {
  /**
   * Set a cookie with the given name, value, and options
   */
  set: (name: string, value: string, options: CookieOptions = {}): void => {
    if (typeof document === 'undefined') return;
    
    // Skip setting cookies that might conflict with HMR in development
    if (process.env.NODE_ENV === 'development' && name.includes('refresh')) {
      // Add a small delay to avoid HMR conflicts
      setTimeout(() => {
        cookieUtils.setInternal(name, value, options);
      }, 10);
      return;
    }
    
    cookieUtils.setInternal(name, value, options);
  },

  /**
   * Internal method to set cookies
   */
  setInternal: (name: string, value: string, options: CookieOptions = {}): void => {
    if (typeof document === 'undefined') return;

    const {
      expires,
      maxAge,
      path = '/',
      domain,
      secure = process.env.NODE_ENV === 'production',
      sameSite = 'lax',
      httpOnly = false
    } = options;

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (expires) {
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    if (maxAge) {
      cookieString += `; max-age=${maxAge}`;
    }

    cookieString += `; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    if (secure) {
      cookieString += `; secure`;
    }

    cookieString += `; samesite=${sameSite}`;

    if (httpOnly) {
      cookieString += `; httponly`;
    }

    document.cookie = cookieString;
  },

  /**
   * Get a cookie value by name
   */
  get: (name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name && cookieValue) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  },

  /**
   * Remove a cookie by name
   */
  remove: (name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void => {
    const { path = '/', domain } = options;
    
    let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    
    if (domain) {
      cookieString += `; domain=${domain}`;
    }
    
    document.cookie = cookieString;
  },

  /**
   * Check if a cookie exists
   */
  exists: (name: string): boolean => {
    return cookieUtils.get(name) !== null;
  }
};

/**
 * Authentication-specific cookie helpers
 */
export const authCookies = {
  /**
   * Set access token cookie (short-lived, secure)
   */
  setAccessToken: (token: string): void => {
    cookieUtils.set('stm_access_token', token, {
      maxAge: 15 * 60, // 15 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false, // Needs to be accessible to JS for API calls
      path: '/'
    });
  },

  /**
   * Get access token from cookie
   */
  getAccessToken: (): string | null => {
    return cookieUtils.get('stm_access_token');
  },

  /**
   * Set refresh token cookie (long-lived, accessible to JS for client-side refresh)
   */
  setRefreshToken: (token: string): void => {
    cookieUtils.set('stm_refresh_token', token, {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false, // Needs to be accessible to JS for client-side refresh
      path: '/'
    });
  },

  /**
   * Get refresh token from cookie (server-side only)
   */
  getRefreshToken: (): string | null => {
    return cookieUtils.get('stm_refresh_token');
  },

  /**
   * Set user data cookie
   */
  setUserData: (userData: any): void => {
    cookieUtils.set('stm_user_data', JSON.stringify(userData), {
      maxAge: 7 * 24 * 60 * 60, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false, // Needs to be accessible to JS for UI
      path: '/'
    });
  },

  /**
   * Get user data from cookie
   */
  getUserData: (): any | null => {
    const userData = cookieUtils.get('stm_user_data');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Clear all authentication cookies
   */
  clear: (): void => {
    // Clear new cookies
    cookieUtils.remove('stm_access_token');
    cookieUtils.remove('stm_refresh_token');
    cookieUtils.remove('stm_user_data');
    
    // Also clear any old cookies that might exist
    cookieUtils.remove('access_token');
    cookieUtils.remove('refresh_token');
    cookieUtils.remove('user_data');
    
    // Clear any potential HMR conflicting cookies
    if (process.env.NODE_ENV === 'development') {
      cookieUtils.remove('__next_hmr_refresh_hash__');
    }
  },

  /**
   * Check if user is authenticated based on cookies
   */
  isAuthenticated: (): boolean => {
    // Check for either access token or refresh token
    return !!(authCookies.getAccessToken() || authCookies.getRefreshToken());
  },

  /**
   * Initialize cookies - migrate old cookies and clear conflicts
   */
  initialize: (): void => {
    // Clear any HMR cookies that might interfere
    cookieUtils.remove('__next_hmr_refresh_hash__');
    
    // Migrate old cookies to new names if they exist
    const oldAccessToken = cookieUtils.get('access_token');
    const oldRefreshToken = cookieUtils.get('refresh_token');
    const oldUserData = cookieUtils.get('user_data');
    
    if (oldAccessToken && !authCookies.getAccessToken()) {
      authCookies.setAccessToken(oldAccessToken);
    }
    
    if (oldRefreshToken && !authCookies.getRefreshToken()) {
      authCookies.setRefreshToken(oldRefreshToken);
    }
    
    if (oldUserData && !authCookies.getUserData()) {
      try {
        const parsedUserData = JSON.parse(oldUserData);
        authCookies.setUserData(parsedUserData);
      } catch (error) {
        console.error('Failed to parse old user data:', error);
      }
    }
    
    // Clear old cookies after migration
    if (oldAccessToken || oldRefreshToken || oldUserData) {
      cookieUtils.remove('refresh_token');
      cookieUtils.remove('access_token');
      cookieUtils.remove('user_data');
    }
  }
};
