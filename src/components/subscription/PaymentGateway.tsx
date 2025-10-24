'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface PaymentFormData {
  cardNumber: string;
  expiration: string;
  cvc: string;
  country: string;
  zipCode: string;
}

interface PaymentGatewayProps {
  planInfo?: {
    name: string;
    price: string;
    userType: 'customer' | 'provider';
    planId: string;
  };
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ planInfo }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiration: '',
    cvc: '',
    country: 'United States',
    zipCode: ''
  });
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Get plan info from localStorage if not provided as prop
  const [selectedPlan, setSelectedPlan] = useState(planInfo);

  useEffect(() => {
    if (!selectedPlan) {
      const storedPlan = localStorage.getItem('selectedPlan');
      if (storedPlan) {
        setSelectedPlan(JSON.parse(storedPlan));
      }
    }
  }, [selectedPlan]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    if (paymentMethod === 'card') {
      // Card number validation (basic format check)
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Please enter a valid card number';
      }

      // Expiration validation
      if (!formData.expiration.trim()) {
        newErrors.expiration = 'Expiration date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiration)) {
        newErrors.expiration = 'Please enter a valid expiration date (MM/YY)';
      }

      // CVC validation
      if (!formData.cvc.trim()) {
        newErrors.cvc = 'CVC is required';
      } else if (!/^\d{3,4}$/.test(formData.cvc)) {
        newErrors.cvc = 'Please enter a valid CVC';
      }
    }

    // Country validation
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    // ZIP code validation
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    handleInputChange('cardNumber', formatted);
  };

  const handleExpirationChange = (value: string) => {
    // Auto-format MM/YY
    let formatted = value.replace(/\D/g, '');
    if (formatted.length >= 2) {
      formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
    }
    handleInputChange('expiration', formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Redirect based on authentication status
    if (isAuthenticated) {
      // Clear localStorage after successful payment for logged-in users
      localStorage.removeItem('selectedPlan');
      // Redirect to appropriate dashboard
      const dashboardPath = selectedPlan?.userType === 'customer' 
        ? '/customer/dashboard' 
        : '/provider/dashboard';
      router.push(dashboardPath);
    } else {
      // For non-logged-in users, redirect to signup with plan info
      const signupPath = selectedPlan?.userType === 'customer' 
        ? '/register' 
        : '/provider/signup';
      // Pass plan info via URL parameters instead of clearing localStorage
      router.push(`${signupPath}?planId=${selectedPlan?.planId}`);
    }
  };

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Spain',
    'Italy',
    'Netherlands',
    'Sweden'
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Plan Summary */}
        {selectedPlan && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Plan Summary</h2>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{selectedPlan.name}</span>
              <span className="text-2xl font-bold text-gray-900">{selectedPlan.price}</span>
            </div>
          </div>
        )}

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Credit Card</h1>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-medium">Card</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'bank'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-medium">US bank account</span>
                </div>
              </button>
            </div>
          </div>

          {paymentMethod === 'card' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    maxLength={19}
                  />
                  <div className="absolute right-3 top-2 flex space-x-1">
                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                    <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                    <div className="w-8 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">AM</div>
                    <div className="w-8 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">D</div>
                  </div>
                </div>
                {errors.cardNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                )}
              </div>

              {/* Expiration and CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration
                  </label>
                  <input
                    type="text"
                    value={formData.expiration}
                    onChange={(e) => handleExpirationChange(e.target.value)}
                    placeholder="MM/YY"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.expiration ? 'border-red-500' : 'border-gray-300'
                    }`}
                    maxLength={5}
                  />
                  {errors.expiration && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiration}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVC
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.cvc}
                      onChange={(e) => handleInputChange('cvc', e.target.value)}
                      placeholder="123"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.cvc ? 'border-red-500' : 'border-gray-300'
                      }`}
                      maxLength={4}
                    />
                    <div className="absolute right-3 top-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  {errors.cvc && (
                    <p className="mt-1 text-sm text-red-600">{errors.cvc}</p>
                  )}
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                )}
              </div>

              {/* ZIP Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="12345"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.zipCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Complete Payment'
                )}
              </button>
            </form>
          )}

          {paymentMethod === 'bank' && (
            <div className="text-center py-8">
              <p className="text-gray-600">Bank account payment option coming soon!</p>
              <button
                onClick={() => setPaymentMethod('card')}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Use Card Instead
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
