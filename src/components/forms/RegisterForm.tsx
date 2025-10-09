'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { validateEmail, validatePassword, validatePhone, validateZipCode, getPasswordStrength, sanitizeInput, formatPhoneNumber } from '@/lib/validation';
import { SuccessScreen } from '@/components/auth/SuccessScreen';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  region: string;
  address: string;
  zipCode: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  region?: string;
  address?: string;
  zipCode?: string;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: string;
  general?: string;
}

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    region: '',
    address: '',
    zipCode: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error;
    }

  // Validate phone
  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.valid) {
    newErrors.phone = phoneValidation.error;
  }

  // Validate region
  if (!formData.region.trim()) {
    newErrors.region = 'Region is required';
  }

  // Validate address
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address';
    }

    // Validate zip code
    const zipCodeValidation = validateZipCode(formData.zipCode);
    if (!zipCodeValidation.valid) {
      newErrors.zipCode = zipCodeValidation.error;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Validate terms acceptance
    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await register({
        email: sanitizeInput(formData.email),
        password: formData.password,
        firstName: sanitizeInput(formData.firstName.trim()),
        lastName: sanitizeInput(formData.lastName.trim()),
        phoneNumber: formatPhoneNumber(sanitizeInput(formData.phone)),
        role: 'CUSTOMER',
        region: sanitizeInput(formData.region.trim()),
        address: sanitizeInput(formData.address.trim()),
        zipcode: sanitizeInput(formData.zipCode.trim()),
      }, true, returnUrl || undefined); // Redirect after registration with returnUrl
      
      // Set success state (though we're redirecting, this is for fallback)
      setIsSuccess(true);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-green-100">
      {isSuccess ? (
        <SuccessScreen
          title="Account Created Successfully!"
          message="You're all set! Welcome to ServiceProStars."
          redirectTo={returnUrl || '/'}
          redirectDelay={2000}
        />
      ) : (
        <>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Customer Account
            </h2>
            <p className="text-gray-600 text-sm">
              Join us today! Create your customer account to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`
                w-full px-4 py-2 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-green-500
                ${errors.firstName ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="First name"
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`
                w-full px-4 py-2 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-green-500
                ${errors.lastName ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="Last name"
              disabled={isLoading}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`
              w-full px-4 py-2 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-green-500
              ${errors.email ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="Enter your email"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`
              w-full px-4 py-2 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-green-500
              ${errors.phone ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="Enter your phone number"
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
            Region <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            className={`
              w-full px-4 py-2 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-green-500
              ${errors.region ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="Dallas, TX"
            disabled={isLoading}
          />
          {errors.region && (
            <p className="text-red-500 text-xs mt-1">{errors.region}</p>
          )}
        </div>


        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className={`
              w-full px-4 py-2 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-green-500
              ${errors.address ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="Enter your street address and city"
            disabled={isLoading}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
          )}
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className={`
              w-full px-4 py-2 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-green-500
              ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="Enter your ZIP code (e.g., 12345)"
            disabled={isLoading}
          />
          {errors.zipCode && (
            <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`
                w-full px-4 py-2 pr-10 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-green-500
                ${errors.password ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="Create a password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.strength === 'weak' ? 'bg-red-500' :
                      passwordStrength.strength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{
                      width: `${passwordStrength.score * 16.67}%`
                    }}
                  />
                </div>
                <span className={`text-xs font-medium ${
                  passwordStrength.strength === 'weak' ? 'text-red-500' :
                  passwordStrength.strength === 'medium' ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {passwordStrength.strength}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                <div className="grid grid-cols-2 gap-1">
                  <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                    • 8+ characters
                  </span>
                  <span className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                    • Lowercase letter
                  </span>
                  <span className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                    • Uppercase letter
                  </span>
                  <span className={/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                    • Number
                  </span>
                </div>
              </div>
            </div>
          )}
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`
                w-full px-4 py-2 pr-10 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-green-500
                ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="acceptedTerms"
                name="acceptedTerms"
                type="checkbox"
                checked={formData.acceptedTerms}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                disabled={isLoading}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="acceptedTerms" className="text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="text-green-600 hover:text-green-500">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-green-600 hover:text-green-500">
                  Privacy Policy
                </Link>
              </label>
              {errors.acceptedTerms && (
                <p className="text-red-500 text-xs mt-1">{errors.acceptedTerms}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-white
            bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          `}
        >
          {isLoading ? 'Creating Account...' : 'Create Customer Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 hover:text-green-500 font-medium">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Want to provide services?{' '}
          <Link href="/provider/signup" className="text-green-600 hover:text-green-500 font-medium">
            Sign up as a service provider
          </Link>
        </p>
      </div>
        </>
      )}
    </div>
  );
}