'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import PricingPlans from '@/components/subscription/pricingGrid';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import Footer from '@/components/layout/Footer';

export default function PricingPage() {
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
