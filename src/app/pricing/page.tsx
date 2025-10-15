'use client';

import React from 'react';
import PricingPlans from '@/components/subscription/pricingGrid';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
export default function PricingPage() {
  return (
    <>
      <Header />
      <PricingPlans />
      <Footer />
    </>
  );
}
