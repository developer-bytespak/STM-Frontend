/**
 * API module exports
 */

import ApiClient from './client';
import { session } from './session';

// Create API client instance with session management
export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  () => session.getAccessToken(),
  async () => {
    const refreshToken = session.getRefreshToken();
    if (!refreshToken) return false;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      if (!data?.accessToken) return false;
      
      session.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        session.setRefreshToken(data.refreshToken);
      }
      
      return true;
    } catch {
      return false;
    }
  }
);

export { session };
export * from './client';
