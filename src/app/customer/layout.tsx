'use client';

import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  const userRole = isAuthenticated && user?.role ? user.role : undefined;
  // Handle both user.name and user.firstName + user.lastName formats
  const userName = isAuthenticated && user 
    ? (user.name || `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim())
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        userRole={userRole} 
        userName={userName}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}