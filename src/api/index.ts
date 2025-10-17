/**
 * API module exports
 */

import ApiClient from './client';
import { session } from './session';

// Create API client instance with session management
export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' 
    ? 'https://stm-backend-qcaf.onrender.com' 
    : 'http://localhost:8000'),
  () => session.getAccessToken(),
  async () => {
    const refreshToken = session.getRefreshToken();
    if (!refreshToken) {
      console.log('❌ No refresh token available');
      return false;
    }
    
    console.log('🔄 401 Error - Attempting to refresh token...');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' 
        ? 'https://stm-backend-qcaf.onrender.com' 
        : 'http://localhost:8000')}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        console.error('❌ Token refresh failed with status:', response.status);
        return false;
      }
      
      const data = await response.json();
      if (!data?.accessToken) {
        console.error('❌ No access token in refresh response');
        return false;
      }
      
      console.log('✅ Token refreshed successfully on 401');
      session.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        session.setRefreshToken(data.refreshToken);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return false;
    }
  }
);

export { session };
export * from './client';
export * from './customer';
export * from './officeBooking';
