'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Allow unauthenticated access to signup page
  const isSignupPage = pathname === '/provider/signup';
  
  useEffect(() => {
    // Skip auth check for signup page
    if (isSignupPage) {
      return;
    }
    
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (user?.role !== 'service_provider') {
        // Redirect to appropriate dashboard based on role
        switch (user?.role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'customer':
            router.push('/customer/dashboard');
            break;
          case 'local_service_manager':
            router.push('/lsm/dashboard');
            break;
          default:
            router.push('/');
        }
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, router, isSignupPage]);
  
  const handleLogout = async () => {
    await logout();
  };
  
  // For signup page, render without authentication check
  if (isSignupPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          {children}
        </main>
      </div>
    );
  }
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Don't render content if not authenticated or wrong role
  if (!isAuthenticated || user?.role !== 'service_provider') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        userRole={user.role} 
        userName={user.name}
        onLogout={handleLogout}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}