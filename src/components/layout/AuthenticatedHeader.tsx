'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Header from './Header';

/**
 * AuthenticatedHeader - Wrapper component that connects Header with authentication
 * 
 * This component automatically:
 * - Gets user data from useAuth hook
 * - Passes correct userRole and userName to Header
 * - Handles logout functionality
 * - Redirects to login after logout
 * 
 * Usage in layouts:
 * import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
 * <AuthenticatedHeader />
 */
export default function AuthenticatedHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Extract user role and name from user object
  const userRole = isAuthenticated && user ? user.role : undefined;
  const userName = isAuthenticated && user ? user.name || user.email : undefined;

  return (
    <Header 
      userRole={userRole}
      userName={userName}
      onLogout={handleLogout}
    />
  );
}

