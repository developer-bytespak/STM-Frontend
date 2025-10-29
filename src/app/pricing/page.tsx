'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PricingPlans from '@/components/subscription/pricingGrid';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import Footer from '@/components/layout/Footer';

function PricingPageContent() {
  const searchParams = useSearchParams();
  const userType = searchParams.get('userType') as 'customer' | 'provider' | null;

  return (
    <>
      <AuthenticatedHeader />
      <PricingPlans initialUserType={userType} />
      <Footer />
    </>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <AuthenticatedHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pricing plans...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <PricingPageContent />
    </Suspense>
  );
}
