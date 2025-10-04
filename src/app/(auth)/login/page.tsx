'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail } from '@/lib/validation';
import Link from 'next/link';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!formData.email || !formData.password) {
        setErrors({ general: 'Email and password are required' });
        setLoading(false);
        return;
      }

      // Use the login function from useAuth hook
      await login(formData.email, formData.password);
      
      // Login function will automatically redirect based on user role
      // No need for manual redirect here

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-screen bg-gradient-to-br from-navy-50 to-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            ServiceProStars
          </h1>
          <p className="text-gray-600">Welcome back</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Login to Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`
                  w-full px-4 py-2 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-navy-500
                  ${errors.email ? 'border-red-500' : 'border-gray-300'}
                `}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`
                    w-full px-4 py-2 border rounded-lg pr-10
                    focus:outline-none focus:ring-2 focus:ring-navy-500
                    ${errors.password ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-600 text-white py-3 rounded-lg font-semibold
                hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Test Accounts Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">Test Accounts:</p>
            <div className="space-y-1 text-xs text-blue-800">
              <p><strong>Customer:</strong> customer@test.com</p>
              <p><strong>Provider:</strong> provider@test.com</p>
              <p><strong>Admin:</strong> admin@test.com</p>
              <p><strong>LSM:</strong> lsm@test.com</p>
              <p className="mt-2"><strong>Password:</strong> password123</p>
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 space-y-2">
            <p className="text-center">
              <Link href="/forgot-password" className="text-sm text-navy-600 hover:underline font-medium">
                Forgot your password?
              </Link>
            </p>
            
            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <div className="flex justify-center gap-4 mt-2">
                <Link href="/customer/signup" className="text-navy-600 font-medium hover:underline">
                  Sign up as Customer
                </Link>
                <span className="text-gray-400">|</span>
                <Link href="/serviceprovider/signup" className="text-navy-600 font-medium hover:underline">
                  Sign up as Provider
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}