'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (user?.role !== 'admin') {
        // Redirect to appropriate dashboard based on role
        switch (user?.role) {
          case 'customer':
            router.push('/customer/dashboard');
            break;
          case 'service_provider':
            router.push('/provider/dashboard');
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
  }, [isAuthenticated, user, isLoading, router]);
  
  const handleLogout = async () => {
    await logout();
  };
  
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
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        userRole={user.role} 
        userName={user.name}
        onLogout={handleLogout}
      />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
}