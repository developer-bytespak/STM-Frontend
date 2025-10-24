'use client';

import React from 'react';
import PaymentGateway from '@/components/subscription/PaymentGateway';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <PaymentGateway />
      </main>
      <Footer />
    </div>
  );
}
