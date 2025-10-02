'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateEmail, sanitizeInput } from '@/lib/validation';
import { authManager } from '@/lib/auth';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error;
    }

    if (!formData.password) {
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

      const sanitizedEmail = sanitizeInput(formData.email);
      const sanitizedPassword = sanitizeInput(formData.password);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock login API call - in real implementation, this would call your backend
      const mockLoginResponse = await mockLogin(sanitizedEmail, sanitizedPassword);

      if (!mockLoginResponse.success || !mockLoginResponse.data) {
        setErrors({ general: mockLoginResponse.error || 'Login failed' });
        setLoading(false);
        return;
      }

      // Store authentication data
      authManager.login(mockLoginResponse.data.token, mockLoginResponse.data.user);
      
      // Redirect based on user role and approval status
      const { role, approvalStatus } = mockLoginResponse.data.user;
      
      // Handle different user roles and their specific routing
      switch (role) {
        case 'customer':
          router.push('/customer/dashboard');
          break;
        case 'service_provider':
          if (approvalStatus === 'pending') {
            router.push('/provider/dashboard?status=pending');
          } else if (approvalStatus === 'approved') {
            router.push('/provider/dashboard');
          } else {
            router.push('/provider/dashboard?status=pending'); // Default to pending for safety
          }
          break;
        case 'local_service_manager':
          router.push('/lsm/dashboard');
          break;
        case 'admin':
          router.push('/admin/dashboard');
          break;
        default:
          console.error('Unknown user role:', role);
          router.push('/');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Login function using localStorage
  const mockLogin = async (email: string, password: string) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    // Find user by BOTH email AND password combination
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
      // Check if email exists but password is wrong
      const emailExists = users.find((u: any) => u.email === email);
      if (emailExists) {
        return { success: false, error: 'Invalid password. Please try again.' };
      } else {
        return { success: false, error: 'No account found with this email. Please sign up first.' };
      }
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return { success: false, error: 'Please verify your email before logging in.' };
    }

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          // Only service providers have approval status, others are always 'approved'
          approvalStatus: user.role === 'service_provider' ? (user.approvalStatus || 'pending') : 'approved'
        },
        token: `mock-${user.role}-token-${Date.now()}`
      }
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex items-center justify-center p-4">
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

          {/* Links */}
          <div className="mt-6 space-y-2">
            <p className="text-center">
              <a href="/forgot-password" className="text-sm text-navy-600 hover:underline font-medium">
                Forgot your password?
              </a>
            </p>
            
            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <div className="flex justify-center gap-4 mt-2">
                <a href="/customer/signup" className="text-navy-600 font-medium hover:underline">
                  Sign up as Customer
                </a>
                <span className="text-gray-400">|</span>
                <a href="/serviceprovider/signup" className="text-navy-600 font-medium hover:underline">
                  Sign up as Provider
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}