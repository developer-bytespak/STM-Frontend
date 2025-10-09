'use client';

import React, { Suspense } from 'react';
import RegisterForm from '@/components/forms/RegisterForm';

function RegisterFormWrapper() {
  return (
    <div className="flex items-center justify-center p-4 bg-gradient-to-br from-navy-50 to-white">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-600">
            Join thousands of customers who trust ServiceProStars
          </p>
        </div>

        {/* Register Form */}
        <RegisterForm />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-4 bg-gradient-to-br from-navy-50 to-white">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-600">
              Loading...
            </p>
          </div>
        </div>
      </div>
    }>
      <RegisterFormWrapper />
    </Suspense>
  );
}