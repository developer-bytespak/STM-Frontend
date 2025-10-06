'use client';

import React from 'react';
import ProviderRegisterForm from '@/components/forms/ProviderRegisterForm';

export default function ServiceProviderSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            ServiceProStars
          </h1>
          <p className="text-gray-600">Join as a Service Provider</p>
        </div>

        {/* Provider Register Form */}
        <ProviderRegisterForm />
      </div>
    </div>
  );
}