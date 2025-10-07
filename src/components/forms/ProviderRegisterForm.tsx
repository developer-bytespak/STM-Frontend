'use client';

import React, { useState } from 'react';
import { SuccessScreen } from '@/components/auth/SuccessScreen';
import { validateEmail, validatePassword, validatePhone, getPasswordStrength, sanitizeInput, formatPhoneNumber, formatPhoneToE164 } from '@/lib/validation';
import { registerServiceProvider, uploadDocument, ApiError, handleApiError } from '@/lib/apiService';
import { RegisterRequest } from '@/config/api';

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
  businessName: string;
  serviceType: string;
  experience: string;
  description: string;
  location: string;
  zipCodes: string[];
  multipleAreas: boolean;
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
  businessName?: string;
  serviceType?: string;
  experience?: string;
  description?: string;
  location?: string;
  zipCodes?: string;
  minPrice?: string;
  maxPrice?: string;
  password?: string;
  acceptedTerms?: string;
  documents?: string;
  general?: string;
}

type SignupStep = 'form' | 'success';

export default function ServiceProviderSignupPage() {
  const [currentStep, setCurrentStep] = useState<SignupStep>('form');
  const [formStep, setFormStep] = useState<number>(1); // 1: Personal, 2: Service, 3: Documents, 4: Review
  const [formData, setFormData] = useState<ServiceProviderFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    serviceType: '',
    experience: '',
    description: '',
    location: '',
    zipCodes: [''],
    multipleAreas: false,
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

  const addZipCode = () => {
    setFormData(prev => ({
      ...prev,
      zipCodes: [...prev.zipCodes, '']
    }));
  };

  const removeZipCode = (index: number) => {
    if (formData.zipCodes.length > 1) {
      setFormData(prev => ({
        ...prev,
        zipCodes: prev.zipCodes.filter((_, i) => i !== index)
      }));
    }
  };

  const updateZipCode = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      zipCodes: prev.zipCodes.map((zip, i) => i === index ? value : zip)
    }));
    // Clear error when user starts typing
    if (errors.zipCodes) {
      setErrors(prev => ({ ...prev, zipCodes: undefined }));
    }
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

  // Step-specific validation
  const validateStep1 = (): boolean => {
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
    }

    // Validate phone
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) {
      newErrors.phone = phoneValidation.error;
    }

    // Validate business name
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    } else if (formData.businessName.trim().length < 2) {
      newErrors.businessName = 'Business name must be at least 2 characters';
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

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

    // Validate zip codes
    if (formData.zipCodes.length === 0 || formData.zipCodes.every(zip => !zip.trim())) {
      newErrors.zipCodes = 'At least one zip code is required';
    } else {
      const invalidZipCodes = formData.zipCodes.filter(zip => {
        if (!zip.trim()) return false;
        return !/^\d{5}(-\d{4})?$/.test(zip.trim());
      });
      
      if (invalidZipCodes.length > 0) {
        newErrors.zipCodes = 'Please enter valid 5-digit zip codes';
      }

      const hasValidZipCode = formData.zipCodes.some(zip => zip.trim() !== '');
      if (!hasValidZipCode) {
        newErrors.zipCodes = 'At least one zip code is required';
      }
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
    if (!newErrors.minPrice && !newErrors.maxPrice) {
      const minPriceNum = parseInt(formData.minPrice);
      const maxPriceNum = parseInt(formData.maxPrice);
      if (maxPriceNum < minPriceNum) {
        newErrors.maxPrice = 'Maximum price must be greater than minimum price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate documents (optional but if added, must have description)
    const documentsWithFiles = formData.documents.filter(doc => doc.file);
    if (documentsWithFiles.length > 0) {
      const invalidDocuments = documentsWithFiles.some(doc => 
        !doc.description.trim()
      );
      if (invalidDocuments) {
        newErrors.documents = 'Please provide a description for all uploaded documents';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate terms acceptance
    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = 'You must accept the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (formStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }

    if (isValid && formStep < 4) {
      setFormStep(formStep + 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate step 4 (final step)
    const isValid = validateStep4();
    if (!isValid) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Sanitize and prepare data
      const sanitizedData = {
        ...formData,
        firstName: sanitizeInput(formData.firstName),
        lastName: sanitizeInput(formData.lastName),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        businessName: sanitizeInput(formData.businessName),
        location: sanitizeInput(formData.location),
        zipCodes: formData.zipCodes.filter(zip => zip.trim() !== '').map(zip => sanitizeInput(zip.trim())),
        description: sanitizeInput(formData.description),
      };

      // Prepare registration data for backend API
      const registerData: RegisterRequest = {
        // Required fields
        email: sanitizedData.email,
        password: formData.password, // Don't sanitize password
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        phoneNumber: formatPhoneToE164(sanitizedData.phone), // Convert to E.164 format
        role: 'PROVIDER',
        region: sanitizedData.location, // For LSM matching
        
        // Optional provider fields
        businessName: sanitizedData.businessName || undefined,
        serviceType: formData.serviceType || undefined,
        experienceLevel: formData.experience || undefined,
        description: sanitizedData.description || undefined,
        location: sanitizedData.location || undefined,
        zipCodes: sanitizedData.zipCodes.length > 0 ? sanitizedData.zipCodes : undefined,
        minPrice: formData.minPrice ? parseInt(formData.minPrice) : undefined,
        maxPrice: formData.maxPrice ? parseInt(formData.maxPrice) : undefined,
        acceptedTerms: formData.acceptedTerms || undefined,
      };

      // ==================== BACKEND API CALL ====================
      const { user, accessToken, refreshToken } = await registerServiceProvider(registerData);

      // Store tokens and user data
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_email', user.email);
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_id', user.id.toString());
      localStorage.setItem('approval_status', 'pending');

      // ==================== UPLOAD DOCUMENTS (if any) ====================
      const documentsWithFiles = formData.documents.filter(doc => doc.file);
      
      if (documentsWithFiles.length > 0) {
        try {
          for (const doc of documentsWithFiles) {
            await uploadDocument(
              doc.file!,
              sanitizeInput(doc.description),
              accessToken
            );
          }
        } catch (uploadError) {
          console.error('Document upload failed:', uploadError);
          // Don't fail the entire registration, just log the error
        }
      }

      // Move to success screen
      setCurrentStep('success');

    } catch (error) {
      if (error instanceof ApiError) {
        const errorMessage = handleApiError(error);
        
        // Handle specific field errors
        if (error.status === 409) {
          setErrors({ email: errorMessage });
        } else if (error.status === 400 && error.data?.message?.includes('price')) {
          setErrors({ maxPrice: errorMessage });
        } else {
          setErrors({ general: errorMessage });
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const steps = [
    { number: 1, title: 'Personal Info', description: 'Basic details' },
    { number: 2, title: 'Service Info', description: 'Your services' },
    { number: 3, title: 'Documents', description: 'Credentials' },
    { number: 4, title: 'Review', description: 'Final check' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {currentStep === 'form' && (
            <>
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Become a Service Provider
                </h2>
                <p className="text-gray-600">
                  Join our platform and start offering your professional services to customers.
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-start justify-between">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-start flex-1">
                      <div className="flex flex-col items-center flex-1">
                        {/* Step Circle */}
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                          transition-all duration-200 flex-shrink-0
                          ${formStep > step.number 
                            ? 'bg-green-500 text-white' 
                            : formStep === step.number 
                            ? 'bg-navy-600 text-white ring-4 ring-navy-100' 
                            : 'bg-gray-200 text-gray-500'
                          }
                        `}>
                          {formStep > step.number ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            step.number
                          )}
                        </div>
                        
                        {/* Step Label */}
                        <div className="mt-3 text-center hidden sm:flex flex-col justify-start min-h-[2.5rem]">
                          <div className={`text-xs font-medium ${formStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.title}
                          </div>
                          <div className="text-xs text-gray-400">{step.description}</div>
                        </div>
                      </div>

                      {/* Connector Line */}
                      {index < steps.length - 1 && (
                        <div className={`
                          h-1 flex-1 mx-2 rounded transition-all duration-200 mt-5
                          ${formStep > step.number ? 'bg-green-500' : 'bg-gray-200'}
                        `} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* STEP 1: Personal Information */}
                {formStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
                  
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
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
                            w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
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
                            w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
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
                            w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                            ${errors.phone ? 'border-red-500' : 'border-gray-300'}
                          `}
                          placeholder="(555) 123-4567"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                      </div>

                      {/* Business Name Field */}
                      <div className="md:col-span-2">
                        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                          Business Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="businessName"
                          value={formData.businessName}
                          onChange={(e) => handleInputChange('businessName', e.target.value)}
                          className={`
                            w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                            ${errors.businessName ? 'border-red-500' : 'border-gray-300'}
                          `}
                          placeholder="ABC Plumbing Services"
                        />
                        {errors.businessName && (
                          <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>
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
                              w-full px-4 py-2 border rounded-lg pr-10 text-gray-900 placeholder-gray-500
                              focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
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
                )}

                {/* STEP 2: Service Information */}
                {formStep === 2 && (
                  <div className="space-y-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Service Information</h3>
                  
                    {/* Service Type and Experience */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            w-full px-4 py-2 border rounded-lg text-gray-900
                            focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
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
                            w-full px-4 py-2 border rounded-lg text-gray-900
                            focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
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
                    </div>

                    {/* Location and Zip Codes */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                              focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                              ${errors.location ? 'border-red-500' : 'border-gray-300'}
                            `}
                            placeholder="New York, USA"
                          />
                          {errors.location && (
                            <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                          )}
                        </div>

                        {/* Price Range */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                              Min Price (USD) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              id="minPrice"
                              value={formData.minPrice}
                              onChange={(e) => handleInputChange('minPrice', e.target.value)}
                              min="0"
                              className={`
                                w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                                focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                                ${errors.minPrice ? 'border-red-500' : 'border-gray-300'}
                              `}
                              placeholder="100"
                            />
                            {errors.minPrice && (
                              <p className="text-red-500 text-xs mt-1">{errors.minPrice}</p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                              Max Price (USD) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              id="maxPrice"
                              value={formData.maxPrice}
                              onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                              min="0"
                              className={`
                                w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                                focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                                ${errors.maxPrice ? 'border-red-500' : 'border-gray-300'}
                              `}
                              placeholder="500"
                            />
                            {errors.maxPrice && (
                              <p className="text-red-500 text-xs mt-1">{errors.maxPrice}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Zip Codes Section */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Service Zip Code(s) <span className="text-red-500">*</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.multipleAreas}
                              onChange={(e) => handleInputChange('multipleAreas', e.target.checked)}
                              className="w-4 h-4 text-navy-600 border-gray-300 rounded focus:ring-navy-500"
                            />
                            <span>Multiple areas</span>
                          </label>
                        </div>

                        {/* Zip Code Inputs */}
                        <div className="space-y-2">
                          {formData.zipCodes.map((zipCode, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={zipCode}
                                onChange={(e) => updateZipCode(index, e.target.value)}
                                className={`
                                  flex-1 px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                                  focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                                  ${errors.zipCodes ? 'border-red-500' : 'border-gray-300'}
                                `}
                                placeholder="e.g., 10001"
                                maxLength={10}
                              />
                              {formData.multipleAreas && formData.zipCodes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeZipCode(index)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove zip code"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Add Zip Code Button - only show when multiple areas is checked */}
                        {formData.multipleAreas && (
                          <button
                            type="button"
                            onClick={addZipCode}
                            className="mt-2 flex items-center gap-2 text-navy-600 hover:text-navy-700 text-sm font-medium"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Another Zip Code
                          </button>
                        )}

                        {errors.zipCodes && (
                          <p className="text-red-500 text-xs mt-1">{errors.zipCodes}</p>
                        )}

                        <p className="text-xs text-gray-500 mt-2">
                          Enter the zip code(s) where you provide services. Format: 5 digits (e.g., 10001)
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Tell About Yourself <span className="text-gray-500">(Optional)</span>
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className={`
                          w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                          focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                          ${errors.description ? 'border-red-500' : 'border-gray-300'}
                        `}
                        placeholder="Describe your skills, specialties, and what makes you unique..."
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: Document Upload */}
                {formStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Credibility Documents
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900"
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
                        <span>Add Document</span>
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
                    <p className="text-sm text-gray-500 mt-4">
                      You can skip this step if you don&apos;t have documents ready. You can always upload them later.
                    </p>
                  </div>
                )}

                {/* STEP 4: Review & Submit */}
                {formStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Review & Submit</h3>
                    
                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      {/* Personal Info Summary */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Name:</div>
                          <div className="text-gray-900">{formData.firstName} {formData.lastName}</div>
                          <div className="text-gray-600">Business:</div>
                          <div className="text-gray-900">{formData.businessName}</div>
                          <div className="text-gray-600">Email:</div>
                          <div className="text-gray-900">{formData.email}</div>
                          <div className="text-gray-600">Phone:</div>
                          <div className="text-gray-900">{formData.phone}</div>
                        </div>
                      </div>

                      {/* Service Info Summary */}
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Service Information</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Service Type:</div>
                          <div className="text-gray-900">{formData.serviceType}</div>
                          <div className="text-gray-600">Experience:</div>
                          <div className="text-gray-900">{formData.experience}</div>
                          <div className="text-gray-600">Location:</div>
                          <div className="text-gray-900">{formData.location}</div>
                          <div className="text-gray-600">Zip Codes:</div>
                          <div className="text-gray-900">{formData.zipCodes.filter(z => z.trim()).join(', ')}</div>
                          <div className="text-gray-600">Price Range:</div>
                          <div className="text-gray-900">${formData.minPrice} - ${formData.maxPrice}</div>
                          {formData.description && (
                            <>
                              <div className="text-gray-600">Description:</div>
                              <div className="text-gray-900">{formData.description}</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Documents Summary */}
                      {formData.documents.filter(doc => doc.file).length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Documents</h4>
                          <div className="text-sm text-gray-600">
                            {formData.documents.filter(doc => doc.file).length} document(s) uploaded
                          </div>
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

                    {/* Approval Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-500 text-xl">ℹ️</div>
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Approval Process</h4>
                          <p className="text-sm text-blue-800">
                            Your application will be reviewed by our Local Service Manager. 
                            You&apos;ll receive an email notification once approved and can then access your full dashboard.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* General Error */}
                {errors.general && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.general}</p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-4 pt-6 border-t">
                  {/* Back Button */}
                  {formStep > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium
                        hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                  )}

                  {/* Next/Submit Button */}
                  {formStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className={`flex items-center gap-2 px-6 py-3 bg-navy-600 text-white rounded-lg font-semibold
                        hover:bg-navy-700 transition-colors ${formStep === 1 ? 'w-full' : 'ml-auto'}`}
                    >
                      Next
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg font-semibold
                        hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Create Account
                        </>
                      )}
                    </button>
                  )}
                </div>
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

          {currentStep === 'success' && (
            <SuccessScreen
              title="Account Created Successfully!"
              message="Your application is under review. You'll receive an email once approved by our Local Service Manager."
              redirectTo=""
              redirectDelay={10}
            />
          )}
        </div>
      </div>
    </div>
  );
}