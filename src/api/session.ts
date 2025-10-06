/**
 * Session management for authentication tokens using cookies
 * Handles token storage and retrieval
 */

import { authCookies } from '@/lib/cookies';

let accessTokenInMemory: string | null = null;

export const session = {
  getAccessToken: (): string | null => {
    // First check in-memory, then cookies
    return accessTokenInMemory || authCookies.getAccessToken();
  },
  
  setAccessToken: (token: string | null): void => {
    accessTokenInMemory = token;
    if (token) {
      authCookies.setAccessToken(token);
    } else {
      authCookies.clear();
    }
  },
  
  getRefreshToken: (): string | null => {
    return authCookies.getRefreshToken();
  },
  
  setRefreshToken: (token: string | null): void => {
    if (token) {
      authCookies.setRefreshToken(token);
    } else {
      authCookies.clear();
    }
  },
  
  clear: (): void => {
    accessTokenInMemory = null;
    authCookies.clear();
  },
  
  isAuthenticated: (): boolean => {
    // Check for either access token or refresh token
    return !!(accessTokenInMemory || authCookies.getAccessToken() || authCookies.getRefreshToken());
  }
};
