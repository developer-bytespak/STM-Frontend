'use client';

import React, { useState } from 'react';
import { OTPVerification } from '@/components/auth/OTPVerification';
import { SuccessScreen } from '@/components/auth/SuccessScreen';
import { validateEmail, validatePassword, validatePhone, getPasswordStrength, sanitizeInput, formatPhoneNumber } from '@/lib/validation';
import { generateOTP, storeOTPSession, clearOTPSession } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/emailjs';

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  acceptedTerms: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
  acceptedTerms?: string;
  general?: string;
}

type SignupStep = 'form' | 'otp' | 'success';

export default function CustomerSignupPage() {
  const [currentStep, setCurrentStep] = useState<SignupStep>('form');
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof CustomerFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error;
    } else {
      // Check if email already exists in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const emailExists = existingUsers.some((user: any) => user.email === formData.email);
      if (emailExists) {
        newErrors.email = 'Email already registered. Please login instead.';
      }
    }

    // Validate phone
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) {
      newErrors.phone = phoneValidation.error;
    }

    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address';
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error;
    }

    // Validate terms acceptance
    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = 'You must accept the Terms & Conditions';
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
      const isValid = validateForm();
      if (!isValid) {
        setLoading(false);
        return;
      }

      // Sanitize inputs
      const sanitizedData = {
        ...formData,
        firstName: sanitizeInput(formData.firstName),
        lastName: sanitizeInput(formData.lastName),
        email: sanitizeInput(formData.email),
        phone: formatPhoneNumber(sanitizeInput(formData.phone)),
        address: sanitizeInput(formData.address),
      };

      // Generate and send OTP
      const otp = generateOTP();
      const emailResult = await sendOTPEmail(
        sanitizedData.email,
        otp,
        sanitizedData.firstName
      );

      if (!emailResult.success) {
        setErrors({ 
          general: emailResult.error || 'Failed to send verification code. Please try again.' 
        });
        setLoading(false);
        return;
      }

      // Store OTP session
      storeOTPSession(sanitizedData.email, otp, sanitizedData.phone);

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
      // Create customer user in localStorage
      const newCustomer = {
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: 'customer',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      };

      // Get existing users and add new customer
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      existingUsers.push(newCustomer);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      // Create authenticated session
      localStorage.setItem('auth_token', 'mock-customer-token-' + Date.now());
      localStorage.setItem('user_email', formData.email);
      localStorage.setItem('user_role', 'customer');
      localStorage.setItem('user_id', newCustomer.id);

      // Clear OTP session
      clearOTPSession();

      // Move to success screen (will redirect to dashboard)
      setCurrentStep('success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            ServiceProStars
          </h1>
          <p className="text-gray-600">Professional Services at Your Fingertips</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {currentStep === 'form' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create Your Account
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Name Field */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`
                      w-full px-4 py-2 border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-navy-500
                      ${errors.firstName ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>

                {/* Last Name Field */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`
                      w-full px-4 py-2 border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-navy-500
                      ${errors.lastName ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>

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

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`
                      w-full px-4 py-2 border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-navy-500
                      ${errors.phone ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="03001234567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Address Field */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className={`
                      w-full px-4 py-2 border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-navy-500
                      ${errors.address ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="Enter your complete address including city and postal code"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
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
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${
                              passwordStrength.strength === 'weak' && level === 1
                                ? 'bg-red-500'
                                : passwordStrength.strength === 'medium' && level <= 2
                                ? 'bg-yellow-500'
                                : passwordStrength.strength === 'strong' && level <= 3
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Password strength:{' '}
                        <span
                          className={`font-medium ${
                            passwordStrength.strength === 'weak'
                              ? 'text-red-500'
                              : passwordStrength.strength === 'medium'
                              ? 'text-yellow-500'
                              : 'text-green-500'
                          }`}
                        >
                          {passwordStrength.strength}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acceptedTerms}
                      onChange={(e) => handleInputChange('acceptedTerms', e.target.checked)}
                      className="mt-1 w-4 h-4 text-navy-600 border-gray-300 rounded focus:ring-navy-500"
                    />
                    <span className="text-sm text-gray-700">
                      I accept the{' '}
                      <a href="/terms" className="text-navy-600 hover:underline">
                        Terms & Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-navy-600 hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.acceptedTerms && (
                    <p className="text-red-500 text-xs mt-1">{errors.acceptedTerms}</p>
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
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{' '}
                <a href="/login" className="text-navy-600 font-medium hover:underline">
                  Login
                </a>
              </p>
            </>
          )}

          {currentStep === 'otp' && (
            <OTPVerification
              email={formData.email}
              userName={`${formData.firstName} ${formData.lastName}`}
              phone={formData.phone}
              onVerificationSuccess={handleOTPVerificationSuccess}
              onBack={() => setCurrentStep('form')}
            />
          )}

          {currentStep === 'success' && (
            <SuccessScreen
              title="Account Created Successfully!"
              message="You're now logged in! Taking you to your dashboard..."
              redirectTo="/customer/dashboard"
              redirectDelay={2000}
            />
          )}
        </div>
      </div>
    </div>
  );
}