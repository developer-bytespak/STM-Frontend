'use client';

import React, { useState } from 'react';
import { OTPVerification } from '@/components/auth/OTPVerification';
import { SuccessScreen } from '@/components/auth/SuccessScreen';
import { validateEmail, validatePassword, validatePhone, getPasswordStrength, sanitizeInput, formatPhoneNumber } from '@/lib/validation';
import { generateOTP, storeOTPSession, clearOTPSession } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/emailjs';

interface DocumentData {
  file: File | null;
  description: string;
  type: string;
}

interface ServiceProviderFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  experience: string;
  description: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  password: string;
  acceptedTerms: boolean;
  documents: DocumentData[];
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  serviceType?: string;
  experience?: string;
  description?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  password?: string;
  acceptedTerms?: string;
  documents?: string;
  general?: string;
}

type SignupStep = 'form' | 'otp' | 'success';

export default function ServiceProviderSignupPage() {
  const [currentStep, setCurrentStep] = useState<SignupStep>('form');
  const [formData, setFormData] = useState<ServiceProviderFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    serviceType: '',
    experience: '',
    description: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    password: '',
    acceptedTerms: false,
    documents: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const serviceTypes = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Cleaning',
    'Landscaping',
    'Handyman',
    'Painting',
    'Carpentry',
    'Consultation',
    'Delivery',
    'Other'
  ];

  const experienceLevels = [
    'Less than 1 year',
    '1-2 years',
    '3-5 years',
    '6-10 years',
    'More than 10 years'
  ];

  const handleInputChange = (field: keyof ServiceProviderFormData, value: string | boolean | DocumentData[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
  };

  const addDocument = () => {
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, { file: null, description: '', type: '' }]
    }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const updateDocument = (index: number, field: keyof DocumentData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map((doc, i) => 
        i === index ? { ...doc, [field]: value } : doc
      )
    }));
  };

  const handleFileUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ general: 'File size must be less than 10MB' });
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ general: 'Only PDF, PNG, JPG, and DOCX files are allowed' });
        return;
      }
      
      updateDocument(index, 'file', file);
      updateDocument(index, 'type', file.type);
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

    // Validate service type
    if (!formData.serviceType) {
      newErrors.serviceType = 'Please select a service type';
    }

    // Validate experience
    if (!formData.experience) {
      newErrors.experience = 'Please select your experience level';
    }

    // Validate location
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.trim().length < 2) {
      newErrors.location = 'Please provide a valid location';
    }

    // Validate min price
    if (!formData.minPrice.trim()) {
      newErrors.minPrice = 'Minimum price is required';
    } else {
      const minPriceNum = parseInt(formData.minPrice);
      if (isNaN(minPriceNum) || minPriceNum < 0) {
        newErrors.minPrice = 'Please enter a valid minimum price';
      }
    }

    // Validate max price
    if (!formData.maxPrice.trim()) {
      newErrors.maxPrice = 'Maximum price is required';
    } else {
      const maxPriceNum = parseInt(formData.maxPrice);
      if (isNaN(maxPriceNum) || maxPriceNum < 0) {
        newErrors.maxPrice = 'Please enter a valid maximum price';
      }
    }

    // Validate price range
    if (!errors.minPrice && !errors.maxPrice) {
      const minPriceNum = parseInt(formData.minPrice);
      const maxPriceNum = parseInt(formData.maxPrice);
      if (maxPriceNum < minPriceNum) {
        newErrors.maxPrice = 'Maximum price must be greater than minimum price';
      }
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error;
    }

    // Validate documents (optional but if added, must have description)
    if (formData.documents.length > 0) {
      const invalidDocuments = formData.documents.some(doc => 
        doc.file && !doc.description.trim()
      );
      if (invalidDocuments) {
        newErrors.documents = 'Please provide a description for all uploaded documents';
      }
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
        location: sanitizeInput(formData.location),
        description: sanitizeInput(formData.description),
        documents: formData.documents.map(doc => ({
          ...doc,
          description: sanitizeInput(doc.description),
          fileName: doc.file?.name || '',
          fileSize: doc.file?.size || 0,
        }))
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
      // Create service provider user in localStorage (pending approval)
      const newProvider = {
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        serviceType: formData.serviceType,
        experience: formData.experience,
        description: formData.description,
        location: formData.location,
        minPrice: parseInt(formData.minPrice),
        maxPrice: parseInt(formData.maxPrice),
        documents: formData.documents.map(doc => ({
          fileName: doc.file?.name || '',
          fileSize: doc.file?.size || 0,
          fileType: doc.type,
          description: doc.description,
          uploadedAt: new Date().toISOString(),
        })),
        role: 'service_provider',
        approvalStatus: 'pending',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      };

      // Get existing users and add new provider
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      existingUsers.push(newProvider);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      // Store user session but mark as pending approval
      localStorage.setItem('auth_token', 'mock-provider-token-' + Date.now());
      localStorage.setItem('user_email', formData.email);
      localStorage.setItem('user_role', 'service_provider');
      localStorage.setItem('user_id', newProvider.id);
      localStorage.setItem('approval_status', 'pending');

      // Clear OTP session
      clearOTPSession();

      // Move to success screen (will redirect to pending approval page)
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
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            ServiceProStars
          </h1>
          <p className="text-gray-600">Join as a Service Provider</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {currentStep === 'form' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Become a Service Provider
              </h2>
              <p className="text-gray-600 mb-6">
                Join our platform and start offering your professional services to customers.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Personal Information Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    {/* Password Field */}
                    <div className="md:col-span-2">
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
                  </div>
                </div>

                {/* Service Information Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Service Type */}
                    <div>
                      <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Service Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="serviceType"
                        value={formData.serviceType}
                        onChange={(e) => handleInputChange('serviceType', e.target.value)}
                        className={`
                          w-full px-4 py-2 border rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-navy-500
                          ${errors.serviceType ? 'border-red-500' : 'border-gray-300'}
                        `}
                      >
                        <option value="">Select service type</option>
                        {serviceTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.serviceType && (
                        <p className="text-red-500 text-xs mt-1">{errors.serviceType}</p>
                      )}
                    </div>

                    {/* Experience */}
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                        Experience Level <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className={`
                          w-full px-4 py-2 border rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-navy-500
                          ${errors.experience ? 'border-red-500' : 'border-gray-300'}
                        `}
                      >
                        <option value="">Select experience level</option>
                        {experienceLevels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                      {errors.experience && (
                        <p className="text-red-500 text-xs mt-1">{errors.experience}</p>
                      )}
                    </div>

                    {/* Location */}
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Service Area/Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className={`
                          w-full px-4 py-2 border rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-navy-500
                          ${errors.location ? 'border-red-500' : 'border-gray-300'}
                        `}
                        placeholder="Karachi, Pakistan"
                      />
                      {errors.location && (
                        <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                      )}
                    </div>

                    {/* Min Price */}
                    <div>
                      <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Price (PKR) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="minPrice"
                        value={formData.minPrice}
                        onChange={(e) => handleInputChange('minPrice', e.target.value)}
                        min="0"
                        className={`
                          w-full px-4 py-2 border rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-navy-500
                          ${errors.minPrice ? 'border-red-500' : 'border-gray-300'}
                        `}
                        placeholder="1000"
                      />
                      {errors.minPrice && (
                        <p className="text-red-500 text-xs mt-1">{errors.minPrice}</p>
                      )}
                    </div>

                    {/* Max Price */}
                    <div>
                      <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Price (PKR) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="maxPrice"
                        value={formData.maxPrice}
                        onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                        min="0"
                        className={`
                          w-full px-4 py-2 border rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-navy-500
                          ${errors.maxPrice ? 'border-red-500' : 'border-gray-300'}
                        `}
                        placeholder="5000"
                      />
                      {errors.maxPrice && (
                        <p className="text-red-500 text-xs mt-1">{errors.maxPrice}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Tell About Yourself <span className="text-gray-500">(Optional)</span>
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className={`
                        w-full px-4 py-2 border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-navy-500
                        ${errors.description ? 'border-red-500' : 'border-gray-300'}
                      `}
                      placeholder="Describe your skills, specialties, and what makes you unique..."
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                    )}
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Credibility Documents (Optional)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload relevant documents to showcase your credibility (certificates, business registration, 
                    portfolio samples, etc.)
                  </p>

                  {/* Documents List */}
                  {formData.documents.map((doc, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">Document {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* File Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload File <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(index, e)}
                            accept=".pdf,.png,.jpg,.jpeg,.docx,.doc"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Supported formats: PDF, PNG, JPG, DOCX (Max 10MB)
                          </p>
                          {doc.file && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ {doc.file.name} ({(doc.file.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>

                        {/* Document Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Document Description <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={doc.description}
                            onChange={(e) => updateDocument(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                            placeholder="e.g., Plumbing Certificate, Business License, Portfolio Sample"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Document Button */}
                  <button
                    type="button"
                    onClick={addDocument}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-navy-400 hover:text-navy-600 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl">📄</span>
                      <span>Add Another Document</span>
                    </div>
                  </button>

                  {errors.documents && (
                    <p className="text-red-500 text-xs mt-2">{errors.documents}</p>
                  )}

                  {/* Document Types Info */}
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="font-medium text-blue-900 mb-2">Suggested Document Types:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-blue-800">
                      <div>• Professional Certificates</div>
                      <div>• Business Registration</div>
                      <div>• Insurance Documents</div>
                      <div>• Portfolio Samples</div>
                      <div>• License Documents</div>
                      <div>• Reference Letters</div>
                    </div>
                  </div>
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

                {/* Approval Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-500 text-xl">ℹ️</div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Approval Process</h4>
                      <p className="text-sm text-blue-800">
                        After email verification, your application will be reviewed by our Local Service Manager. 
                        You&apos;ll receive an email notification once approved and can then access your full dashboard.
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
                  className="w-full bg-navy-600 text-white py-3 rounded-lg font-semibold
                    hover:bg-navy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Create Provider Account'}
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
              message="Your application is under review. You'll receive an email once approved by our Local Service Manager."
              redirectTo="/provider/dashboard"
              redirectDelay={3000}
            />
          )}
        </div>
      </div>
    </div>
  );
}