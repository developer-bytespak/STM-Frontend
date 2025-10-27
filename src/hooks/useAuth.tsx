'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, session, ApiError } from '@/api';
import { authCookies } from '@/lib/cookies';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'customer' | 'service_provider' | 'local_service_manager' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, returnUrl?: string) => Promise<void>;
  register: (data: RegisterData, shouldRedirect?: boolean, returnUrl?: string) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface RegisterData {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize cookies and clear any conflicts
        authCookies.initialize();
        
        // Check if we have a cached user in cookies
        const cachedUser = authCookies.getUserData();
        
        if (cachedUser) {
          setUser(cachedUser);
          
          // For test accounts, set a mock access token
          if (cachedUser.id === 'test-user-id') {
            session.setAccessToken('test-access-token');
          }
        }

        // Check if we have tokens and verify session with backend
        const hasAccessToken = session.getAccessToken();
        const hasRefreshToken = session.getRefreshToken();
        
        // If we have user data but no tokens, try to refresh
        if (cachedUser && !hasAccessToken && hasRefreshToken && !String(cachedUser?.id || '').includes('test-user-id')) {
          try {
            // Try to refresh the session
            const refreshToken = session.getRefreshToken();
            if (refreshToken) {
              const response = await apiClient.refresh(refreshToken);
              session.setAccessToken(response.accessToken);
              if (response.refreshToken) {
                session.setRefreshToken(response.refreshToken);
              }
              // Session refreshed successfully, keep user data
              setUser(cachedUser);
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
            // Refresh failed, clear everything
            session.clear();
            setUser(null);
            authCookies.clear();
          }
        }
        // If we have tokens, try to verify the session
        else if ((hasAccessToken || hasRefreshToken) && !String(cachedUser?.id || '').includes('test-user-id')) {
          try {
            const meResponse = await apiClient.getMe();
            const userData = {
              id: meResponse.id,
              name: `${meResponse.firstName} ${meResponse.lastName}`.trim(),
              email: meResponse.email,
              role: meResponse.role as User['role']
            };
            
            setUser(userData);
            authCookies.setUserData(userData);
          } catch (error) {
            console.error('Session verification failed:', error);
            // Only clear everything if it's an authentication error (401, 403)
            if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
              // Authentication failed - clear everything
              session.clear();
              setUser(null);
              authCookies.clear();
            } else {
              // Network or other error - keep user data but clear tokens
              session.clear();
              // Keep user data in cookies for retry
            }
          }
        } else if (!hasAccessToken && !hasRefreshToken) {
          if (cachedUser) {
            // We have user data but no tokens - keep user data for now
            setUser(cachedUser);
          } else {
            // No tokens and no cached user, clear any stale data
            setUser(null);
            authCookies.clear();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Only clear cookies if there's a critical error, not just network issues
        if (error instanceof Error && error.message.includes('network')) {
          // Network error - keep user data but clear tokens
          session.clear();
          setUser(null);
        } else {
          // Other errors - clear everything
          session.clear();
          setUser(null);
          authCookies.clear();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Proactive Token Refresh - Check every minute
  useEffect(() => {
    const refreshTokenProactively = async () => {
      const token = session.getAccessToken();
      if (!token) return;

      try {
        // Decode token to check expiration
        const decoded: any = jwtDecode(token);
        const expiresAt = decoded.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        // Refresh if token expires in less than 5 minutes
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          console.log('🔄 Token expiring soon, refreshing proactively...');
          const refreshToken = session.getRefreshToken();
          
          if (refreshToken) {
            const response = await apiClient.refresh(refreshToken);
            session.setAccessToken(response.accessToken);
            if (response.refreshToken) {
              session.setRefreshToken(response.refreshToken);
            }
            console.log('✅ Token refreshed successfully');
          }
        }
      } catch (error) {
        console.error('❌ Proactive token refresh failed:', error);
        // Don't logout here, let normal 401 flow handle it
      }
    };

    // Run immediately on mount
    refreshTokenProactively();

    // Then check every minute
    const interval = setInterval(refreshTokenProactively, 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  // Refresh token when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user) {
        const token = session.getAccessToken();
        if (!token) return;

        try {
          const decoded: any = jwtDecode(token);
          const expiresAt = decoded.exp * 1000;
          const now = Date.now();
          const timeUntilExpiry = expiresAt - now;

          // Refresh if token is close to expiring or already expired
          if (timeUntilExpiry < 10 * 60 * 1000) {
            console.log('🔄 Page focused - refreshing token...');
            const refreshToken = session.getRefreshToken();
            
            if (refreshToken) {
              const response = await apiClient.refresh(refreshToken);
              session.setAccessToken(response.accessToken);
              if (response.refreshToken) {
                session.setRefreshToken(response.refreshToken);
              }
              console.log('✅ Token refreshed on page focus');
            }
          }
        } catch (error) {
          console.error('❌ Token refresh on focus failed:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const login = async (email: string, password: string, returnUrl?: string) => {
    try {
      const response = await apiClient.login({ email, password });
      
      // Store tokens
      session.setAccessToken(response.accessToken);
      session.setRefreshToken(response.refreshToken);
      
      // Create user object
      const userData = {
        id: response.user.id,
        name: `${response.user.firstName} ${response.user.lastName}`.trim(),
        email: response.user.email,
        role: response.user.role
      };
      
      setUser(userData);
      authCookies.setUserData(userData);
      
      // Role-based redirect logic with status checking for service providers
      if (userData.role === 'admin' || userData.role === 'local_service_manager') {
        // Admin/LSM: Always go to dashboard (ignore returnUrl for management users)
        redirectBasedOnRole(userData.role);
      } else if (userData.role === 'service_provider') {
        // Service Provider: Check status before redirecting
        try {
          // Try to fetch provider profile to check status
          const { providerApi } = await import('@/api/provider');
          const profile = await providerApi.getProfile();
          
          // Check if provider status is active
          if (profile.status.current === 'active') {
            // Provider is active - go to dashboard
            redirectBasedOnRole(userData.role);
          } else {
            // Provider is pending/rejected - show popup and redirect to login
            alert('Your request is under review. Please wait for approval before accessing the dashboard.');
            router.push('/login');
          }
        } catch (error) {
          // If profile fetch fails, provider is likely pending/rejected
          alert('Your request is under review. Please wait for approval before accessing the dashboard.');
          router.push('/login');
        }
      } else {
        // Customer: Return to where they were, or homepage as fallback
        if (returnUrl) {
          router.push(returnUrl);
        } else {
          // No returnUrl - go to homepage (only happens on direct login page access)
          router.push('/');
        }
      }
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Login failed');
    }
  };

  const register = async (data: RegisterData, shouldRedirect: boolean = false, returnUrl?: string) => {
    try {
      const response = await apiClient.register(data);
      
      // Store tokens
      session.setAccessToken(response.accessToken);
      session.setRefreshToken(response.refreshToken);
      
      // Create user object
      const userData = {
        id: response.user.id,
        name: `${response.user.firstName} ${response.user.lastName}`.trim(),
        email: response.user.email,
        role: response.user.role
      };
      
      setUser(userData);
      authCookies.setUserData(userData);
      
      // Only redirect if requested
      if (shouldRedirect) {
        // Role-based redirect logic with status checking for service providers
        if (userData.role === 'admin' || userData.role === 'local_service_manager') {
          // Admin/LSM: Always go to dashboard
          redirectBasedOnRole(userData.role);
        } else if (userData.role === 'service_provider') {
          // Service Provider: Check status before redirecting
          try {
            // Try to fetch provider profile to check status
            const { providerApi } = await import('@/api/provider');
            const profile = await providerApi.getProfile();
            
            // Check if provider status is active
            if (profile.status.current === 'active') {
              // Provider is active - go to dashboard
              redirectBasedOnRole(userData.role);
            } else {
              // Provider is pending/rejected - show popup and redirect to login
              alert('Your request is under review. Please wait for approval before accessing the dashboard.');
              router.push('/login');
            }
          } catch (error) {
            // If profile fetch fails, provider is likely pending/rejected
            alert('Your request is under review. Please wait for approval before accessing the dashboard.');
            router.push('/login');
          }
        } else {
          // Customer: Return to where they were, or homepage as fallback
          if (returnUrl) {
            router.push(returnUrl);
          } else {
            // No returnUrl - go to homepage (fallback)
            router.push('/');
          }
        }
      }
      
      return userData;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      session.clear();
      setUser(null);
      authCookies.clear();
      router.push('/login');
    }
  };

  const redirectBasedOnRole = (role: User['role']) => {
    switch (role) {
      case 'customer':
        router.push('/customer/dashboard');
        break;
      case 'service_provider':
        router.push('/provider/dashboard');
        break;
      case 'local_service_manager':
        router.push('/lsm/dashboard');
        break;
      case 'admin':
        router.push('/admin/dashboard');
        break;
      default:
        router.push('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}