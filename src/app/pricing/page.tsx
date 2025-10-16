'use client';

import React from 'react';
import PricingPlans from '@/components/subscription/pricingGrid';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import Footer from '@/components/layout/Footer';

export default function PricingPage() {
  return (
    <>
      <AuthenticatedHeader />
      <PricingPlans />
      <Footer />
    </>
  );
}
