'use client';

import React from 'react';
import RegisterForm from '@/components/forms/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center p-4 min-h-screen bg-gradient-to-br from-navy-50 to-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            ServiceProStars
          </h1>
          <p className="text-gray-600">Join our community</p>
        </div>

        {/* Register Form */}
        <RegisterForm />
      </div>
    </div>
  );
}