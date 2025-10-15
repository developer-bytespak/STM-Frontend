'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SuccessScreen } from '@/components/auth/SuccessScreen';
import { validateEmail, validatePassword, validatePhone, getPasswordStrength, sanitizeInput, formatPhoneToE164 } from '@/lib/validation';
import { registerServiceProvider, uploadDocument, ApiError, handleApiError } from '@/lib/apiService';
import { RegisterRequest } from '@/config/api';
import { SERVICES, getGranularServices } from '@/data/services';
import { lookupZipCodePlace } from '@/lib/zipCodeLookup';

interface DocumentData {
  file: File | null;
  description: string;
  type: string;
}

interface ZipCodeData {
  zipCode: string;
  city: string;
  state: string;
}

interface ServiceData {
  id: string;
  categoryType: string;
  serviceType: string;
  experience: string;
  zipCodes: ZipCodeData[];
  minPrice: string;
  maxPrice: string;
}

interface ServiceProviderFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  description: string;
  area: string;
  services: ServiceData[];
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
  documents: DocumentData[];
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  area?: string;
  description?: string;
  services?: { [key: string]: string };
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: string;
  documents?: string;
  general?: string;
}

type SignupStep = 'form' | 'success';

export default function ServiceProviderSignupPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const planId = searchParams.get('planId');
  
  // Get plan information from plan ID
  let selectedPlan = null;
  if (planId) {
    // Define service provider plans locally to avoid require() issues
    const serviceProviderPlans = [
      {
        planId: 'provider-basic',
        name: 'Basic',
        price: '$0'
      },
      {
        planId: 'provider-professional',
        name: 'Professional',
        price: '$99'
      },
      {
        planId: 'provider-enterprise',
        name: 'Enterprise',
        price: 'Custom'
      }
    ];
    
    const plan = serviceProviderPlans.find(p => p.planId === planId);
    if (plan) {
      selectedPlan = {
        planId: plan.planId,
        planName: plan.name,
        price: plan.price,
        userType: 'provider'
      };
    }
  }
  
  const [currentStep, setCurrentStep] = useState<SignupStep>('form');
  const [formStep, setFormStep] = useState<number>(1); // 1: Personal, 2: Service, 3: Documents, 4: Review
  const [formData, setFormData] = useState<ServiceProviderFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    description: '',
    area: '',
    services: [{
      id: '1',
      categoryType: '',
      serviceType: '',
      experience: '',
      zipCodes: [{ zipCode: '', city: '', state: '' }],
      minPrice: '',
      maxPrice: '',
    }],
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
    documents: [{
      file: null,
      description: '',
      type: ''
    }],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get categories from services.ts
  const categories = Object.keys(SERVICES);
  
  const experienceLevels = [
    'Less than 1 year',
    '1-2 years',
    '3-5 years',
    '6-10 years',
    'More than 10 years'
  ];

  // Helper functions for managing multiple services
  const addService = () => {
    const newService: ServiceData = {
      id: Date.now().toString(),
      categoryType: '',
      serviceType: '',
      experience: '',
      zipCodes: [{ zipCode: '', city: '', state: '' }],
      minPrice: '',
      maxPrice: '',
    };
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
  };

  const removeService = (serviceId: string) => {
    if (formData.services.length > 1) {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter(service => service.id !== serviceId)
      }));
    }
  };

  const updateService = (serviceId: string, field: keyof ServiceData, value: string | ZipCodeData[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(service => 
        service.id === serviceId ? { ...service, [field]: value } : service
      )
    }));
  };

  const addZipCode = (serviceId: string) => {
    updateService(serviceId, 'zipCodes', [...formData.services.find(s => s.id === serviceId)?.zipCodes || [], { zipCode: '', city: '', state: '' }]);
  };

  const removeZipCode = (serviceId: string, index: number) => {
    const service = formData.services.find(s => s.id === serviceId);
    if (service && service.zipCodes.length > 1) {
      const newZipCodes = service.zipCodes.filter((_, i) => i !== index);
      updateService(serviceId, 'zipCodes', newZipCodes);
    }
  };

  const updateZipCode = (serviceId: string, index: number, value: string) => {
    const service = formData.services.find(s => s.id === serviceId);
    if (service) {
      const newZipCodes = [...service.zipCodes];
      const onlyDigits = value.replace(/\D/g, '').slice(0, 5);
      newZipCodes[index] = { ...newZipCodes[index], zipCode: onlyDigits };
      updateService(serviceId, 'zipCodes', newZipCodes);
      
      // Auto-fill city/state for this specific ZIP code
      if (onlyDigits.length === 5) {
        lookupZipCodePlace(onlyDigits)
          .then((place) => {
            if (place) {
              // Use functional state update to avoid stale closure
              setFormData(prev => ({
                ...prev,
                services: prev.services.map(s => 
                  s.id === serviceId 
                    ? {
                        ...s,
                        zipCodes: s.zipCodes.map((zip, i) => 
                          i === index 
                            ? { zipCode: onlyDigits, city: place.city, state: place.state }
                            : zip
                        )
                      }
                    : s
                )
              }));
            }
          })
          .catch(() => {});
      }
    }
  };

  const updateZipCity = (serviceId: string, index: number, city: string) => {
    const service = formData.services.find(s => s.id === serviceId);
    if (service) {
      const newZipCodes = [...service.zipCodes];
      newZipCodes[index] = { ...newZipCodes[index], city };
      updateService(serviceId, 'zipCodes', newZipCodes);
    }
  };

  const updateZipState = (serviceId: string, index: number, state: string) => {
    const service = formData.services.find(s => s.id === serviceId);
    if (service) {
      const newZipCodes = [...service.zipCodes];
      newZipCodes[index] = { ...newZipCodes[index], state };
      updateService(serviceId, 'zipCodes', newZipCodes);
    }
  };

  // Helper function to get available services for a category
  const getAvailableServices = (categoryType: string): string[] => {
    if (!categoryType) return [];
    
    const granularServices = getGranularServices(categoryType);
    
    // If category has granular services, return them
    if (granularServices.length > 0) {
      return granularServices;
    }
    
    // If category has no granular services (empty array), return the category itself as a service
    return [categoryType];
  };

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
    // Don't allow removing the first document if it's the only one (minimum requirement)
    if (formData.documents.length > 1) {
      setFormData(prev => ({
        ...prev,
        documents: prev.documents.filter((_, i) => i !== index)
      }));
    }
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

    // Validate street address (area)
    if (!formData.area.trim()) {
      newErrors.area = 'Street address is required';
    } else if (formData.area.trim().length < 5) {
      newErrors.area = 'Street address must be at least 5 characters';
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error;
    }

    // Validate confirm password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate services
    const serviceErrors: { [key: string]: string } = {};
    
    formData.services.forEach((service) => {
      const serviceKey = service.id;
      
      if (!service.categoryType) {
        serviceErrors[`${serviceKey}.categoryType`] = 'Please select a category type';
      }
      
      if (!service.serviceType) {
        serviceErrors[`${serviceKey}.serviceType`] = 'Please select a service type';
      }
      
      if (!service.experience) {
        serviceErrors[`${serviceKey}.experience`] = 'Please select your experience level';
      }
      
      const validZipCodes = service.zipCodes.filter(zip => zip.zipCode.trim().length > 0);
      if (validZipCodes.length === 0) {
        serviceErrors[`${serviceKey}.zipCodes`] = 'At least one zip code is required';
      }
      
      if (!service.minPrice.trim()) {
        serviceErrors[`${serviceKey}.minPrice`] = 'Minimum price is required';
      } else {
        const minPriceNum = parseInt(service.minPrice);
        if (isNaN(minPriceNum) || minPriceNum < 0) {
          serviceErrors[`${serviceKey}.minPrice`] = 'Please enter a valid minimum price';
        }
      }
      
      if (!service.maxPrice.trim()) {
        serviceErrors[`${serviceKey}.maxPrice`] = 'Maximum price is required';
      } else {
        const maxPriceNum = parseInt(service.maxPrice);
        if (isNaN(maxPriceNum) || maxPriceNum < 0) {
          serviceErrors[`${serviceKey}.maxPrice`] = 'Please enter a valid maximum price';
        }
      }
      
      // Validate price range
      if (!serviceErrors[`${serviceKey}.minPrice`] && !serviceErrors[`${serviceKey}.maxPrice`]) {
        const minPriceNum = parseInt(service.minPrice);
        const maxPriceNum = parseInt(service.maxPrice);
        if (maxPriceNum < minPriceNum) {
          serviceErrors[`${serviceKey}.maxPrice`] = 'Maximum price must be greater than minimum price';
        }
      }
    });

    if (Object.keys(serviceErrors).length > 0) {
      newErrors.services = serviceErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate documents - at least one document is required
    const documentsWithFiles = formData.documents.filter(doc => doc.file);
    
    // Check if at least one document is uploaded
    if (documentsWithFiles.length === 0) {
      newErrors.documents = 'Please upload at least one document to verify your credentials';
    } else {
      // If documents are uploaded, validate descriptions
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
        description: sanitizeInput(formData.description),
        services: formData.services.map(service => ({
          ...service,
          categoryType: sanitizeInput(service.categoryType),
          serviceType: sanitizeInput(service.serviceType),
          experience: sanitizeInput(service.experience),
          zipCodes: service.zipCodes
            .filter(zipData => zipData.zipCode.trim() !== '')
            .map(zipData => ({
              zipCode: sanitizeInput(zipData.zipCode.trim()),
              city: sanitizeInput(zipData.city.trim()),
              state: sanitizeInput(zipData.state.trim())
            })),
          minPrice: sanitizeInput(service.minPrice),
          maxPrice: sanitizeInput(service.maxPrice),
        }))
      };

      // Prepare registration data for backend API
      // For now, we'll use the first service as primary data for backend compatibility
      const primaryService = sanitizedData.services[0];
      const allZipCodes = sanitizedData.services.flatMap(service => service.zipCodes.map(zipData => zipData.zipCode));

      // Cleaned list (5-digit only)
      const cleanedZipCodes = allZipCodes.map(z => z.replace(/\D/g, '').slice(0, 5)).filter(Boolean);

      // Get city/state from primary service's first ZIP code
      let resolvedCity = '';
      let resolvedState = '';
      if (primaryService.zipCodes.length > 0) {
        resolvedCity = primaryService.zipCodes[0].city;
        resolvedState = primaryService.zipCodes[0].state;
      }
      
      const registerData: RegisterRequest = {
        // Required fields
        email: sanitizedData.email,
        password: formData.password, // Don't sanitize password
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        phoneNumber: formatPhoneToE164(sanitizedData.phone), // Convert to E.164 format
        role: 'PROVIDER',
        region: resolvedState || 'Not specified',
        location: resolvedCity ? `${resolvedCity}, ${resolvedState}` : undefined,
        
        // Optional provider fields
        businessName: sanitizedData.businessName || undefined,
        serviceType: primaryService.serviceType || undefined,
        experienceLevel: primaryService.experience || undefined,
        description: sanitizedData.description || undefined,
        zipCodes: cleanedZipCodes.length > 0 ? cleanedZipCodes : undefined, // ✅ Sends ["75001", "75002"] without location
        minPrice: primaryService.minPrice ? parseInt(primaryService.minPrice) : undefined,
        maxPrice: primaryService.maxPrice ? parseInt(primaryService.maxPrice) : undefined,
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
          setErrors({ general: 'Please check your pricing information and try again.' });
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
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-visible">
          {currentStep === 'form' && (
            <>
              {/* Form Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Service Provider Application
                </h2>
                <p className="text-gray-600 text-sm">
                  Complete your application to start offering professional services.
                </p>
                
                {/* Selected Plan Display */}
                {selectedPlan && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-green-600">📋</span>
                      <span className="text-sm font-medium text-green-900">Selected Plan</span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-900">{selectedPlan.planName}</h3>
                      <p className="text-sm text-green-700">{selectedPlan.price}</p>
                    </div>
                    <div className="mt-2 text-center">
                      <Link 
                        href="/pricing" 
                        className="text-xs text-green-600 hover:text-green-500 underline"
                      >
                        Change Plan
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-start justify-center">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                      {/* Step Circle and Label */}
                      <div className="flex flex-col items-center">
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
                          w-16 h-1 mx-4 rounded transition-all duration-200 mt-5
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

                      {/* Street Address Field */}
                      <div className="md:col-span-2">
                        <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="area"
                          value={formData.area}
                          onChange={(e) => handleInputChange('area', e.target.value)}
                          className={`
                            w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                            ${errors.area ? 'border-red-500' : 'border-gray-300'}
                          `}
                          placeholder="e.g., 123 Main St, Dallas, TX"
                        />
                        {errors.area && (
                          <p className="text-red-500 text-xs mt-1">{errors.area}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Specify your Street Address/Mailing Address
                        </p>
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

                      {/* Confirm Password Field */}
                      <div className="md:col-span-2">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className={`
                              w-full px-4 py-2 border rounded-lg pr-10 text-gray-900 placeholder-gray-500
                              focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                              ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}
                            `}
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
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Service Information */}
                {formStep === 2 && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Service Information</h3>
                      <button
                        type="button"
                        onClick={addService}
                        className="flex items-center gap-2 px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors text-sm font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Another Service
                      </button>
                    </div>

                    {/* Services List */}
                    {formData.services.map((service, serviceIndex) => (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50 relative overflow-visible">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Service {serviceIndex + 1}
                          </h4>
                          {formData.services.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeService(service.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove service"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Category Type and Service Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          {/* Category Type */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category Type <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={service.categoryType}
                              onChange={(e) => {
                                const categoryType = e.target.value;
                                updateService(service.id, 'categoryType', categoryType);
                                // Reset service type when category changes
                                updateService(service.id, 'serviceType', '');
                              }}
                              className={`
                                w-full px-4 py-2 border rounded-lg text-gray-900 relative z-10
                                focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                                ${errors.services?.[`${service.id}.categoryType`] ? 'border-red-500' : 'border-gray-300'}
                              `}
                              style={{ position: 'relative', zIndex: 1 }}
                            >
                              <option value="">Select category type</option>
                              {categories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                            {errors.services?.[`${service.id}.categoryType`] && (
                              <p className="text-red-500 text-xs mt-1">{errors.services[`${service.id}.categoryType`]}</p>
                            )}
                          </div>

                          {/* Service Type */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Service Type <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={service.serviceType}
                              onChange={(e) => updateService(service.id, 'serviceType', e.target.value)}
                              disabled={!service.categoryType}
                              className={`
                                w-full px-4 py-2 border rounded-lg text-gray-900 relative z-10
                                focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                                ${!service.categoryType ? 'bg-gray-100' : ''}
                                ${errors.services?.[`${service.id}.serviceType`] ? 'border-red-500' : 'border-gray-300'}
                              `}
                              style={{ position: 'relative', zIndex: 1 }}
                            >
                              <option value="">Select service type</option>
                              {getAvailableServices(service.categoryType).map((serviceType) => (
                                <option key={serviceType} value={serviceType}>
                                  {serviceType}
                                </option>
                              ))}
                            </select>
                            {errors.services?.[`${service.id}.serviceType`] && (
                              <p className="text-red-500 text-xs mt-1">{errors.services[`${service.id}.serviceType`]}</p>
                            )}
                          </div>
                        </div>

                        {/* Experience and Price Range */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                          {/* Experience Level - Give more space */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Experience Level <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={service.experience}
                              onChange={(e) => updateService(service.id, 'experience', e.target.value)}
                              className={`
                                w-full px-4 py-2 border rounded-lg text-gray-900
                                focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                                ${errors.services?.[`${service.id}.experience`] ? 'border-red-500' : 'border-gray-300'}
                              `}
                            >
                              <option value="">Select experience level</option>
                              {experienceLevels.map((level) => (
                                <option key={level} value={level}>
                                  {level}
                                </option>
                              ))}
                            </select>
                            {errors.services?.[`${service.id}.experience`] && (
                              <p className="text-red-500 text-xs mt-1">{errors.services[`${service.id}.experience`]}</p>
                            )}
                          </div>

                          {/* Min Price */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Min Price (USD) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={service.minPrice}
                              onChange={(e) => updateService(service.id, 'minPrice', e.target.value)}
                              min="0"
                              className={`
                                w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                                focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                                ${errors.services?.[`${service.id}.minPrice`] ? 'border-red-500' : 'border-gray-300'}
                              `}
                              placeholder="100"
                            />
                            {errors.services?.[`${service.id}.minPrice`] && (
                              <p className="text-red-500 text-xs mt-1">{errors.services[`${service.id}.minPrice`]}</p>
                            )}
                          </div>

                          {/* Max Price */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Max Price (USD) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={service.maxPrice}
                              onChange={(e) => updateService(service.id, 'maxPrice', e.target.value)}
                              min="0"
                              className={`
                                w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                                focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                                ${errors.services?.[`${service.id}.maxPrice`] ? 'border-red-500' : 'border-gray-300'}
                              `}
                              placeholder="500"
                            />
                            {errors.services?.[`${service.id}.maxPrice`] && (
                              <p className="text-red-500 text-xs mt-1">{errors.services[`${service.id}.maxPrice`]}</p>
                            )}
                          </div>
                        </div>

                        {/* Zip Codes Section */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Zip Code(s) <span className="text-red-500">*</span>
                          </label>
                          
                          {/* Zip Code Inputs with Individual City/State */}
                          <div className="space-y-4 max-w-4xl">
                          {service.zipCodes.map((zipData, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                {/* ZIP Code Row */}
                                <div className="mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ZIP Code {index + 1} <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={zipData.zipCode}
                                        onChange={(e) => updateZipCode(service.id, index, e.target.value)}
                                        className={`
                                          w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                                          focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                                          ${errors.services?.[`${service.id}.zipCodes`] ? 'border-red-500' : 'border-gray-300'}
                                        `}
                                        placeholder="12345"
                                        maxLength={5}
                                      />
                                    </div>
                                    {service.zipCodes.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeZipCode(service.id, index)}
                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 mt-6"
                                        title="Remove zip code"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* City and State Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {/* City */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={zipData.city}
                                      onChange={(e) => updateZipCity(service.id, index, e.target.value)}
                                      className={`
                                        w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                                        focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                                        ${errors.services?.[`${service.id}.zipCodes.${index}.city`] ? 'border-red-500' : 'border-gray-300'}
                                      `}
                                      placeholder="City"
                                    />
                                  </div>

                                  {/* State */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      State (2-letter) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={zipData.state}
                                      onChange={(e) => {
                                        const two = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
                                        updateZipState(service.id, index, two);
                                      }}
                                      className={`
                                        w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500
                                        focus:outline-none focus:ring-2 focus:ring-navy-500 focus:text-gray-900
                                        ${errors.services?.[`${service.id}.zipCodes.${index}.state`] ? 'border-red-500' : 'border-gray-300'}
                                      `}
                                      placeholder="TX"
                                      maxLength={2}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add Zip Code Button */}
                          <button
                            type="button"
                            onClick={() => addZipCode(service.id)}
                            className="mt-2 flex items-center gap-2 text-navy-600 hover:text-navy-700 text-sm font-medium"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Another Zip Code
                          </button>

                          {errors.services?.[`${service.id}.zipCodes`] && (
                            <p className="text-red-500 text-xs mt-1">{errors.services[`${service.id}.zipCodes`]}</p>
                          )}

                          <p className="text-xs text-gray-500 mt-2">
                            Enter 5-digit ZIP codes (city/state will auto-fill for each ZIP)
                          </p>
                        </div>
                      </div>
                    ))}

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
                      Credibility Documents <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload at least one document to verify your credentials (certificates, business registration, 
                      portfolio samples, etc.) <span className="text-red-500 font-medium">Required for verification</span>
                    </p>

                    {/* Documents List */}
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">
                            Document {index + 1}
                            {index === 0 && <span className="text-red-500 ml-1">*</span>}
                          </h4>
                          {formData.documents.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          )}
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
                        <span>Add Additional Document (Optional)</span>
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

                      {/* Services Summary */}
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Services Offered</h4>
                        <div className="space-y-4">
                          {formData.services.map((service, index) => (
                            <div key={service.id} className="bg-gray-50 p-4 rounded-lg">
                              <h5 className="font-medium text-gray-900 mb-2">Service {index + 1}: {service.serviceType}</h5>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-gray-600">Category:</div>
                                <div className="text-gray-900">{service.categoryType}</div>
                                <div className="text-gray-600">Experience:</div>
                                <div className="text-gray-900">{service.experience}</div>
                                <div className="text-gray-600">Zip Codes:</div>
                                <div className="text-gray-900">{service.zipCodes.filter(z => z.zipCode.trim()).map(z => z.zipCode).join(', ')}</div>
                                <div className="text-gray-600">Price Range:</div>
                                <div className="text-gray-900">${service.minPrice} - ${service.maxPrice}</div>
                              </div>
                            </div>
                          ))}
                          {formData.description && (
                            <div className="border-t pt-4">
                              <div className="text-gray-600 text-sm mb-1">Description:</div>
                              <div className="text-gray-900 text-sm">{formData.description}</div>
                            </div>
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
                          <Link href="/terms" className="text-navy-600 hover:underline">
                            Terms & Conditions
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="text-navy-600 hover:underline">
                            Privacy Policy
                          </Link>
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

            </>
          )}

          {currentStep === 'success' && (
            <SuccessScreen
              title="Account Created Successfully!"
              message="Your application is under review. You'll receive an email once approved by our Local Service Manager."
              redirectTo={returnUrl}
              redirectDelay={3000}
            />
          )}
    </div>
  );
}