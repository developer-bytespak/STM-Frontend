'use client';

import React, { Suspense, useState } from 'react';
import LoginForm from '@/components/forms/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  const [autoFillCredentials, setAutoFillCredentials] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleFillCredentials = (email: string, password: string) => {
    setAutoFillCredentials({ email, password });
  };
  return (
    <div className="flex items-center justify-center p-4 bg-gradient-to-br from-navy-50 to-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            ConnectAgain
          </h1>
          <p className="text-gray-600">Welcome back</p>
        </div>

        {/* Login Form */}
        <Suspense fallback={
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-blue-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sign In
              </h2>
              <p className="text-gray-600 text-sm">
                Loading...
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
          </div>
        }>
          <LoginForm 
            autoFillEmail={autoFillCredentials.email}
            autoFillPassword={autoFillCredentials.password}
          />
        </Suspense>

        {/* Test Accounts Info */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs font-semibold text-green-900 mb-3">Test Accounts:</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-800"><strong>Customer:</strong> customer@test.com</span>
              <button
                onClick={() => handleFillCredentials('customer@test.com', 'Aq123456')}
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
              >
                Fill
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-800"><strong>Provider:</strong> provider3@test.com</span>
              <button
                onClick={() => handleFillCredentials('provider3@test.com', 'Aq123456')}
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
              >
                Fill
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-800"><strong>Admin:</strong> admin@gmail.com</span>
              <button
                onClick={() => handleFillCredentials('admin@gmail.com', 'Aq123456')}
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
              >
                Fill
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-800"><strong>LSM:</strong> lsm2@test.com</span>
              <button
                onClick={() => handleFillCredentials('lsm2@test.com', 'Aq123456')}
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
              >
                Fill
              </button>
            </div>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/pricing" className="text-navy-600 font-medium hover:underline">
              View Pricing Plans
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/register" className="text-navy-600 font-medium hover:underline">
              Sign up as Customer
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/provider/signup" className="text-navy-600 font-medium hover:underline">
              Sign up as Provider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
