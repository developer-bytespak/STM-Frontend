'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OTPVerification } from '@/components/auth/OTPVerification';
import { validateEmail, sanitizeInput } from '@/lib/validation';
import { generateOTP, storeOTPSession, clearOTPSession } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/emailjs';
import { authManager } from '@/lib/auth';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

type LoginStep = 'credentials' | 'otp';

export default function AdminLoginPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<LoginStep>('credentials');
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

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
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

      // Mock admin credential verification - replace with actual API call
      const mockAdminCheck = await verifyAdminCredentials(sanitizedEmail, sanitizedPassword);

      if (!mockAdminCheck.success) {
        setErrors({ general: mockAdminCheck.error });
        setLoading(false);
        return;
      }

      // Generate and send OTP
      const otp = generateOTP();
      const emailResult = await sendOTPEmail(
        sanitizedEmail,
        otp,
        'Admin'
      );

      if (!emailResult.success) {
        setErrors({ 
          general: emailResult.error || 'Failed to send verification code. Please try again.' 
        });
        setLoading(false);
        return;
      }

      // Store OTP session
      storeOTPSession(sanitizedEmail, otp, '');

      // Move to OTP verification step
      setCurrentStep('otp');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerificationSuccess = async () => {
    setLoading(true);

    try {
      // Complete admin login
      const mockLoginResponse = await completeAdminLogin(formData.email);

      if (!mockLoginResponse.success || !mockLoginResponse.data) {
        setErrors({ general: mockLoginResponse.error || 'Login failed' });
        setLoading(false);
        return;
      }

      // Store authentication data
      authManager.login(mockLoginResponse.data.token, mockLoginResponse.data.user);
      
      // Clear OTP session
      clearOTPSession();

      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Admin credential verification using localStorage
  const verifyAdminCredentials = async (email: string, password: string) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    // Find admin by BOTH email AND password AND role combination
    const admin = users.find((u: any) => u.email === email && u.password === password && u.role === 'admin');
    
    if (!admin) {
      // Check if email exists as admin but password is wrong
      const emailExistsAsAdmin = users.find((u: any) => u.email === email && u.role === 'admin');
      if (emailExistsAsAdmin) {
        return { success: false, error: 'Invalid admin password' };
      } else {
        return { success: false, error: 'Invalid admin credentials' };
      }
    }

    return { success: true, admin };
  };

  // Complete admin login
  const completeAdminLogin = async (email: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const admin = users.find((u: any) => u.email === email && u.role === 'admin');
    
    if (!admin) {
      return {
        success: false,
        error: 'Admin not found'
      };
    }
    
    return {
      success: true,
      data: {
        user: {
          id: admin.id,
          email: email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: 'admin'
        },
        token: `mock-admin-token-${Date.now()}`
      }
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-900 mb-2">
            ServiceProStars
          </h1>
          <p className="text-gray-600">Admin Portal</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-red-100">
          {currentStep === 'credentials' && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Admin Login
                </h2>
                <p className="text-gray-600 text-sm">
                  Secure access with two-factor authentication
                </p>
              </div>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`
                      w-full px-4 py-2 border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-red-500
                      ${errors.email ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="admin@serviceprostars.com"
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
                        focus:outline-none focus:ring-2 focus:ring-red-500
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

                {/* Security Notice */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 text-sm">⚠️</span>
                    <div>
                      <p className="text-xs text-red-800 font-medium">Security Notice</p>
                      <p className="text-xs text-red-700 mt-1">
                        This is a secure admin area. All login attempts are logged and monitored.
                      </p>
                    </div>
                  </div>
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
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold
                    hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify Credentials'}
                </button>
              </form>

              {/* Back to regular login */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Not an admin?{' '}
                  <a href="/login" className="text-navy-600 font-medium hover:underline">
                    Regular Login
                  </a>
                </p>
              </div>
            </>
          )}

          {currentStep === 'otp' && (
            <OTPVerification
              email={formData.email}
              userName="Admin"
              phone=""
              onVerificationSuccess={handleOTPVerificationSuccess}
              onBack={() => setCurrentStep('credentials')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
