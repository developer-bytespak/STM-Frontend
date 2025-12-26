'use client';

import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import HierarchicalSearch from '@/components/search/HierarchicalSearch';
import Footer from '@/components/layout/Footer';
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/ai/ChatWidget'), { ssr: false });

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
        <div className="relative bg-gradient-to-r from-navy-600 via-navy-700 to-navy-800 overflow-visible min-h-[600px] sm:min-h-[700px] md:min-h-[800px] flex items-center lg:items-start lg:pt-24">
          <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight px-2">
                Find the right <span className="italic">service</span>
                <br className="hidden xs:block" />
                <span className="xs:hidden"> </span>
                professional, right away
              </h1>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-100 h-32 sm:h-36 md:h-40 animate-pulse"></div>
                <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-100 h-32 sm:h-36 md:h-40 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      }>
        <HierarchicalSearch onClear={handleClearSearch} />
      </Suspense>

      {/* Footer */}
      <Footer />
      {/* SPS AI Chat Widget */}
      <ChatWidget />
    </div>
  );
}