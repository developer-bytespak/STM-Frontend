'use client';

import React, { useState } from 'react';
import { SuccessScreen } from '@/components/auth/SuccessScreen';
import { validateEmail, sanitizeInput } from '@/lib/validation';
import { getUserByEmail } from '@/lib/mockAuthApi';
import { FormErrors } from '@/types/auth';

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error;
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate form
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Get user from mock database
      const user = getUserByEmail(sanitizedEmail);

      if (!user) {
        setErrors({ general: 'No account found with this email. Please sign up first.' });
        setLoading(false);
        return;
      }

      // Check if account is active
      if (user.status !== 'active') {
        setErrors({ general: 'Please complete your registration by verifying your email.' });
        setLoading(false);
        return;
      }

      // Verify password
      if (user.password !== sanitizedPassword) {
        setErrors({ general: 'Invalid email or password. Please try again.' });
        setLoading(false);
        return;
      }

      // Create session
      const mockToken = `mock_token_${Date.now()}_${user.id}`;
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_email', user.email);
      localStorage.setItem('user_role', user.role);

      // Show success screen
      setShowSuccess(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            ServiceProStars
          </h1>
          <p className="text-gray-600">Welcome Back!</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {!showSuccess ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Login to Your Account
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`
                      w-full px-4 py-2 border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-navy-500
                      ${errors.email ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="john@example.com"
                    autoFocus
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {/* Additional Links */}
              <div className="mt-6 space-y-3">
                <p className="text-center text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <a href="/customer/signup" className="text-navy-600 font-medium hover:underline">
                    Sign Up
                  </a>
                </p>
                
                <p className="text-center text-sm">
                  <a href="/customer/forgot-password" className="text-gray-500 hover:text-gray-700">
                    Forgot Password?
                  </a>
                </p>
              </div>
            </>
          ) : (
            <SuccessScreen
              title="Login Successful!"
              message="Welcome back to ServiceProStars!"
              redirectTo="/customer/dashboard"
              redirectDelay={2000}
            />
          )}
        </div>
      </div>
    </div>
  );
}


