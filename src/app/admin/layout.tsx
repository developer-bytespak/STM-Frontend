'use client';

import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  const userRole = isAuthenticated && user?.role ? user.role : undefined;
  const userName = isAuthenticated && user?.name ? user.name : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        userRole={userRole} 
        userName={userName}
        onLogout={handleLogout}
      />
      <main>
        {children}
      </main>
    </div>
  );
}