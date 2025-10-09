'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import HierarchicalSearch from '@/components/search/HierarchicalSearch';
import Footer from '@/components/layout/Footer';

export default function Home() {
  const { user, logout, isAuthenticated } = useAuth();
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

  const handleClearSearch = () => {
    // Scroll to top when clearing search
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Header 
        userRole={userRole} 
        userName={userName}
        onLogout={handleLogout}
      />

      {/* Hierarchical Search */}
      <Suspense fallback={
        <div className="relative bg-gradient-to-r from-navy-600 via-navy-700 to-navy-800 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight">
                Find the right <span className="italic">service</span>
                <br />
                professional, right away
              </h1>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-2xl p-8 border border-gray-100 h-40 animate-pulse"></div>
                <div className="bg-white rounded-lg shadow-2xl p-8 border border-gray-100 h-40 animate-pulse"></div>
              </div>
            </div>
            
            {/* Extra bottom padding to maintain section height */}
            <div className="h-16 md:h-20 lg:h-24"></div>
          </div>
        </div>
      }>
        <HierarchicalSearch onClear={handleClearSearch} />
      </Suspense>

      {/* Footer */}
      <Footer />
    </div>
  );
}