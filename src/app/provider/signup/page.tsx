'use client';

import React, { Suspense } from 'react';
import ProviderRegisterForm from '@/components/forms/ProviderRegisterForm';
import Link from 'next/link';

function ProviderSignupWrapper() {
  return (
    <div className="flex items-center justify-center p-4 min-h-screen bg-gradient-to-br from-navy-50 to-white">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join as a Service Provider
          </h2>
          <p className="text-gray-600">
            Start your business journey with ConnectAgain and connect with customers
          </p>
        </div>

        {/* Provider Register Form */}
        <ProviderRegisterForm />

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-navy-600 hover:text-navy-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ServiceProviderSignupPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-4 min-h-screen bg-gradient-to-br from-navy-50 to-white">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Join as a Service Provider
            </h2>
            <p className="text-gray-600">
              Loading...
            </p>
          </div>
        </div>
      </div>
    }>
      <ProviderSignupWrapper />
    </Suspense>
  );
}