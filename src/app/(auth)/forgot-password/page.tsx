'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { validateEmail, sanitizeInput } from '@/lib/validation';
import { authApi } from '@/api/auth';

interface FormErrors {
  email?: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

type ForgotPasswordStep = 'email' | 'otp' | 'new-password' | 'success';

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('email');
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  const validateEmailStep = (): boolean => {
    const newErrors: FormErrors = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordStep = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.newPassword) {
      newErrors.general = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.general = 'Password must be at least 6 characters long';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.general = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Call backend to send OTP
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate email format
      if (!validateEmailStep()) {
        setLoading(false);
        return;
      }

      const sanitizedEmail = sanitizeInput(formData.email);

      // Call API to send OTP
      const response = await authApi.sendPasswordResetOTP(sanitizedEmail);

      if ((response as any)?.message) {
        // Move to OTP verification step
        setCurrentStep('otp');
        setOtpResendTimer(60); // 60 seconds before can resend
      } else {
        setErrors({ 
          general: 'Failed to send verification code. Please try again.' 
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'An unexpected error occurred. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    setErrors({});

    try {
      const sanitizedEmail = sanitizeInput(formData.email);

      const response = await authApi.resendPasswordResetOTP(sanitizedEmail);

      if ((response as any)?.message) {
        setOtpResendTimer(60);
        setErrors({ general: undefined });
      } else {
        setErrors({ 
          general: 'Failed to resend verification code. Please try again.' 
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to resend OTP';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP with backend
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (!formData.otp || formData.otp.length !== 6) {
        setErrors({ otp: 'Please enter a valid 6-digit OTP' });
        setLoading(false);
        return;
      }

      const sanitizedEmail = sanitizeInput(formData.email);

      // Call API to verify OTP
      const response = await authApi.verifyPasswordResetOTP(sanitizedEmail, formData.otp);

      if ((response as any)?.verified) {
        // Move to new password step
        setCurrentStep('new-password');
      } else {
        setErrors({ 
          general: 'OTP verification failed. Please try again.' 
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          'Invalid OTP. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Reset password with backend
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate passwords
      if (!validatePasswordStep()) {
        setLoading(false);
        return;
      }

      const sanitizedEmail = sanitizeInput(formData.email);

      // Call API to reset password
      const response = await authApi.resetPassword(
        sanitizedEmail,
        formData.otp,
        formData.newPassword,
      );

      if ((response as any)?.message) {
        // Move to success step
        setCurrentStep('success');
      } else {
        setErrors({ 
          general: 'Failed to reset password. Please try again.' 
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          'Failed to reset password. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 'email') {
    return (
      <div className="bg-gradient-to-br from-navy-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy-900 mb-2">
              ServiceProStars
            </h1>
            <p className="text-gray-600">Reset your password</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔑</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600">
                Enter your email address and we&apos;ll send you a verification code to reset your password.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                    w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-navy-500
                    ${errors.email ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
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
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-navy-600 hover:text-navy-800 font-medium text-sm"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'otp') {
    return (
      <div className="bg-gradient-to-br from-navy-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verify OTP
              </h2>
              <p className="text-gray-600">
                Enter the 6-digit code sent to {formData.email}
              </p>
            </div>

            <form onSubmit={handleOTPSubmit} className="space-y-4">
              {/* OTP Field */}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="otp"
                  value={formData.otp}
                  onChange={(e) => handleInputChange('otp', e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                  className={`
                    w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500 text-center text-2xl tracking-widest
                    focus:outline-none focus:ring-2 focus:ring-navy-500
                    ${errors.otp ? 'border-red-500' : 'border-gray-300'}
                  `}
                  placeholder="000000"
                />
                {errors.otp && (
                  <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
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
                disabled={loading || formData.otp.length !== 6}
                className="w-full bg-navy-600 text-white py-3 rounded-lg font-semibold
                  hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            {/* Resend OTP */}
            <div className="mt-6 text-center">
              {otpResendTimer > 0 ? (
                <p className="text-sm text-gray-600">
                  Resend code in {otpResendTimer}s
                </p>
              ) : (
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-navy-600 hover:text-navy-800 font-medium text-sm disabled:opacity-50"
                >
                  Resend Code
                </button>
              )}
            </div>

            {/* Back Button */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setCurrentStep('email')}
                className="text-gray-600 hover:text-gray-800 font-medium text-sm"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'new-password') {
    return (
      <div className="bg-gradient-to-br from-navy-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy-900 mb-2">
              ServiceProStars
            </h1>
            <p className="text-gray-600">Set new password</p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create New Password
              </h2>
              <p className="text-gray-600">
                Enter your new password below.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* New Password Field */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-navy-500 text-gray-900 placeholder-gray-500"
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
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-navy-500 text-gray-900 placeholder-gray-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
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
                className="w-full bg-navy-600 text-white py-3 rounded-lg font-semibold
                  hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="bg-gradient-to-br from-navy-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎉</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Password Reset Successful!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your password has been successfully updated. You can now login with your new password.
            </p>

            <Link
              href="/login"
              className="w-full bg-navy-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-navy-700 transition-colors inline-block"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}