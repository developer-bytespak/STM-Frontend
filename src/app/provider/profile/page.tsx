'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { validatePhone, formatPhoneNumber } from '@/lib/validation';
import { SERVICES, getGranularServices } from '@/data/services';
import { providerApi, ProfileData, UpdateProfileDto  } from '@/api/provider';
import ProfileSkeleton from '@/components/ui/ProfileSkeleton';

interface ServiceData {
  id: string;
  categoryType: string;
  serviceType: string;
  experience: string;
  zipCodes: string[];
  minPrice: string;
  maxPrice: string;
}

interface DocumentData {
  file: File | null;
  description: string;
  type: string;
}

interface ProviderProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  description: string;
  services: ServiceData[];
  documents: DocumentData[];
}

export default function ProviderProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [apiProfileData, setApiProfileData] = useState<ProfileData | null>(null);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'active' | 'inactive'>('active');
  
  const [profileData, setProfileData] = useState<ProviderProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    description: '',
    services: [{
      id: '1',
      categoryType: '',
      serviceType: '',
      experience: '',
      zipCodes: [''],
      minPrice: '',
      maxPrice: '',
    }],
    documents: [{
      file: null,
      description: '',
      type: ''
    }]
  });

  const [editData, setEditData] = useState<ProviderProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    description: '',
    services: [{
      id: '1',
      categoryType: '',
      serviceType: '',
      experience: '',
      zipCodes: [''],
      minPrice: '',
      maxPrice: '',
    }],
    documents: [{
      file: null,
      description: '',
      type: ''
    }]
  });

  const [errors, setErrors] = useState<Partial<ProviderProfile>>({});

  // Get categories from services.ts
  const categories = Object.keys(SERVICES);
  
  const experienceLevels = [
    'Less than 1 year',
    '1-2 years',
    '3-5 years',
    '6-10 years',
    'More than 10 years'
  ];

  // Set initial status from API data
  useEffect(() => {
    if (apiProfileData?.status?.current) {
      setCurrentStatus(apiProfileData.status.current as 'active' | 'inactive');
    }
  }, [apiProfileData]);

  // Handle availability toggle
  const handleAvailabilityToggle = async () => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    setIsTogglingAvailability(true);
    setErrorMessage('');
    
    try {
      const response = await providerApi.setAvailability(newStatus);
      setCurrentStatus(newStatus);
      setSuccessMessage(response.message);
      
      // Reload profile to get updated data
      const updatedProfile = await providerApi.getProfile();
      setApiProfileData(updatedProfile);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to update availability:', error);
      setErrorMessage(error.message || 'Failed to update availability. Please try again.');
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  // Helper functions for managing multiple services
  const addService = () => {
    const newService: ServiceData = {
      id: Date.now().toString(),
      categoryType: '',
      serviceType: '',
      experience: '',
      zipCodes: [''],
      minPrice: '',
      maxPrice: '',
    };
    setEditData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
  };

  const removeService = (serviceId: string) => {
    if (editData.services.length > 1) {
      setEditData(prev => ({
        ...prev,
        services: prev.services.filter(service => service.id !== serviceId)
      }));
    }
  };

  const updateService = (serviceId: string, field: keyof ServiceData, value: any) => {
    setEditData(prev => ({
      ...prev,
      services: prev.services.map(service => 
        service.id === serviceId ? { ...service, [field]: value } : service
      )
    }));
  };

  const addZipCode = (serviceId: string) => {
    updateService(serviceId, 'zipCodes', [...editData.services.find(s => s.id === serviceId)?.zipCodes || [], '']);
  };

  const removeZipCode = (serviceId: string, index: number) => {
    const service = editData.services.find(s => s.id === serviceId);
    if (service && service.zipCodes.length > 1) {
      const newZipCodes = service.zipCodes.filter((_, i) => i !== index);
      updateService(serviceId, 'zipCodes', newZipCodes);
    }
  };

  const updateZipCode = (serviceId: string, index: number, value: string) => {
    const service = editData.services.find(s => s.id === serviceId);
    if (service) {
      const newZipCodes = [...service.zipCodes];
      newZipCodes[index] = value;
      updateService(serviceId, 'zipCodes', newZipCodes);
    }
  };

  // Helper function to get available services for a category
  const getAvailableServices = (categoryType: string): string[] => {
    if (!categoryType) return [];
    
    const granularServices = getGranularServices(categoryType);
    
    if (granularServices.length > 0) {
      return granularServices;
    }
    
    return [categoryType];
  };

  const addDocument = () => {
    setEditData(prev => ({
      ...prev,
      documents: [...prev.documents, { file: null, description: '', type: '' }]
    }));
  };

  const removeDocument = (index: number) => {
    if (editData.documents.length > 1) {
      setEditData(prev => ({
        ...prev,
        documents: prev.documents.filter((_, i) => i !== index)
      }));
    }
  };

  const updateDocument = (index: number, field: keyof DocumentData, value: string | File | null) => {
    setEditData(prev => ({
      ...prev,
      documents: prev.documents.map((doc, i) => 
        i === index ? { ...doc, [field]: value } : doc
      )
    }));
  };

  const handleFileUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ firstName: 'File size must be less than 10MB' });
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ firstName: 'Only PDF, PNG, JPG, and DOCX files are allowed' });
        return;
      }
      
      updateDocument(index, 'file', file);
      updateDocument(index, 'type', file.type);
    }
  };

  // Load profile data from API
  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadProfileData = async () => {
      try {
        setIsLoadingProfile(true);
        setErrorMessage('');
        
        // Try to load from API first
        const apiData = await providerApi.getProfile();
        setApiProfileData(apiData);
        
        // Convert API data to local format
        const profile = {
          firstName: apiData.user.name.split(' ')[0] || '',
          lastName: apiData.user.name.split(' ').slice(1).join(' ') || '',
          email: apiData.user.email || '',
          phone: apiData.user.phone || '',
          businessName: apiData.business.businessName || '',
          description: apiData.business.description || '',
          services: apiData.services.map((service, index) => ({
            id: service.id.toString(),
            categoryType: service.category || '',
            serviceType: service.name || '',
            experience: apiData.business.experience?.toString() || '',
            zipCodes: apiData.serviceAreas.map(area => area.zipcode) || [''],
            minPrice: apiData.business.minPrice?.toString() || '',
            maxPrice: apiData.business.maxPrice?.toString() || '',
          })),
          documents: apiData.documents.list.map(doc => ({
            file: null,
            description: doc.fileName,
            type: doc.status
          }))
        };
        
        setProfileData(profile);
        setEditData(profile);
        setProfileLoaded(true);
        
      } catch (error: any) {
        console.error('Failed to load profile from API:', error);
        setErrorMessage('Failed to load profile data. Using local data.');
        
        // Fallback to localStorage if API fails
        const storedProviders = localStorage.getItem('providers');
        if (storedProviders && user?.email) {
          try {
            const providers = JSON.parse(storedProviders);
            const providerData = providers.find((p: any) => p.email === user.email);
            
            if (providerData) {
              const profile = {
                firstName: providerData.firstName || '',
                lastName: providerData.lastName || '',
                email: providerData.email || '',
                phone: providerData.phone || '',
                businessName: providerData.businessName || '',
                description: providerData.description || '',
                services: providerData.services || [{
                  id: '1',
                  categoryType: '',
                  serviceType: '',
                  experience: '',
                  zipCodes: [''],
                  minPrice: '',
                  maxPrice: '',
                }],
                documents: providerData.documents || [{
                  file: null,
                  description: '',
                  type: ''
                }]
              };
              setProfileData(profile);
              setEditData(profile);
              setProfileLoaded(true);
            }
          } catch (localError) {
            console.error('Failed to load profile from localStorage:', localError);
            setErrorMessage('Failed to load profile data.');
          }
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileData();
  }, [isAuthenticated, user, router, isLoading]);

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profileData);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProviderProfile> = {};

    if (!editData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!editData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!editData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(editData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!editData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setErrorMessage('');

    try {
      // Prepare API update data
      const updateData: UpdateProfileDto = {
        businessName: editData.businessName,
        description: editData.description,
        location: apiProfileData?.business.location || '',
        minPrice: editData.services[0]?.minPrice ? parseFloat(editData.services[0].minPrice) : undefined,
        maxPrice: editData.services[0]?.maxPrice ? parseFloat(editData.services[0].maxPrice) : undefined,
        experience: editData.services[0]?.experience ? parseInt(editData.services[0].experience) : undefined,
        serviceAreas: editData.services[0]?.zipCodes.filter(zip => zip.trim()) || []
      };

      // Try to update via API first
      try {
        await providerApi.updateProfile(updateData);
        
        // Reload profile data from API
        const updatedProfile = await providerApi.getProfile();
        setApiProfileData(updatedProfile);
        
        setSuccessMessage('Profile updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
        
      } catch (apiError: any) {
        console.error('API update failed, falling back to localStorage:', apiError);
        
        // Fallback to localStorage update
        const storedProviders = localStorage.getItem('providers');
        if (storedProviders) {
          const providers = JSON.parse(storedProviders);
          const updatedProviders = providers.map((p: any) => 
            p.email === profileData.email 
              ? { ...p, ...editData }
              : p
          );
          localStorage.setItem('providers', JSON.stringify(updatedProviders));
        }

        // Update auth user data
        const authUser = localStorage.getItem('auth_user');
        if (authUser) {
          const userData = JSON.parse(authUser);
          const updatedUser = {
            ...userData,
            name: `${editData.firstName} ${editData.lastName}`
          };
          localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        }

        setSuccessMessage('Profile updated locally (API unavailable)');
        setTimeout(() => setSuccessMessage(''), 3000);
      }

      setProfileData(editData);
      setIsEditing(false);
      
    } catch (error) {
      console.error('Failed to save profile:', error);
      setErrorMessage('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (isLoading || isLoadingProfile) {
    return <ProfileSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your service provider information</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Card Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Service Provider Information</h2>
              <p className="text-sm text-gray-500 mt-1">Update your business and personal details</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Availability Toggle Button */}
              <button
                onClick={handleAvailabilityToggle}
                disabled={isTogglingAvailability || isEditing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  currentStatus === 'active'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  currentStatus === 'active' ? 'bg-green-600' : 'bg-gray-600'
                }`}></div>
                {isTogglingAvailability ? 'Updating...' : currentStatus === 'active' ? 'Available' : 'Unavailable'}
              </button>
              
              {/* Edit Profile Button */}
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="px-6 py-6">
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                  {profileData.firstName && profileData.lastName 
                    ? `${profileData.firstName[0].toUpperCase()}${profileData.lastName[0].toUpperCase()}`
                    : profileData.firstName
                    ? profileData.firstName[0].toUpperCase()
                    : 'P'
                  }
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h3>
                  <p className="text-gray-600">{profileData.email}</p>
                  {profileData.businessName && (
                    <p className="text-blue-600 font-medium">{profileData.businessName}</p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.firstName}
                          onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                            errors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      ) : (
                        <p className="px-4 py-2 text-gray-900">{profileData.firstName}</p>
                      )}
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.lastName}
                          onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                            errors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      ) : (
                        <p className="px-4 py-2 text-gray-900">{profileData.lastName}</p>
                      )}
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg border border-gray-300">
                        {profileData.email}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="+1 (555) 000-0000"
                        />
                      ) : (
                        <p className="px-4 py-2 text-gray-900">{profileData.phone}</p>
                      )}
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    {/* Business Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.businessName}
                          onChange={(e) => setEditData({ ...editData, businessName: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                            errors.businessName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Your Business Name"
                        />
                      ) : (
                        <p className="px-4 py-2 text-gray-900">{profileData.businessName}</p>
                      )}
                      {errors.businessName && (
                        <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Services Section */}
                {isEditing && (
                  <div>
                    <div className="space-y-4">
                      {editData.services.map((service, serviceIndex) => (
                        <div key={service.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-gray-900">Service {serviceIndex + 1}</h5>
                            {editData.services.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeService(service.id)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                                  updateService(service.id, 'serviceType', '');
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                              >
                                <option value="">Select category type</option>
                                {categories.map((category) => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                ))}
                              </select>
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
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                                  !service.categoryType ? 'bg-gray-100' : ''
                                }`}
                              >
                                <option value="">Select service type</option>
                                {getAvailableServices(service.categoryType).map((serviceType) => (
                                  <option key={serviceType} value={serviceType}>
                                    {serviceType}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Experience Level */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Experience Level <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={service.experience}
                                onChange={(e) => updateService(service.id, 'experience', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                              >
                                <option value="">Select experience level</option>
                                {experienceLevels.map((level) => (
                                  <option key={level} value={level}>
                                    {level}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Zip Codes */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Zip Code(s) <span className="text-red-500">*</span>
                              </label>
                              <div className="space-y-2">
                                {service.zipCodes.map((zipCode, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={zipCode}
                                      onChange={(e) => updateZipCode(service.id, index, e.target.value)}
                                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                                      placeholder="75001 - Dallas, TX"
                                    />
                                    {service.zipCodes.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeZipCode(service.id, index)}
                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addZipCode(service.id)}
                                  className="flex items-center gap-2 text-navy-600 hover:text-navy-700 text-sm font-medium"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Add Zip Code
                                </button>
                              </div>
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                                placeholder="100"
                              />
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                                placeholder="500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tell About Yourself <span className="text-gray-500">(Optional)</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"
                      placeholder="Describe your skills, specialties, and what makes you unique..."
                    />
                  ) : (
                    <p className="px-4 py-2 text-gray-900 whitespace-pre-line">{profileData.description || 'No description provided'}</p>
                  )}
                </div>

                {/* Documents Section (View Only) */}
                {!isEditing && profileData.documents && profileData.documents.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h4>
                    <div className="space-y-2">
                      {profileData.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{doc.description || `Document ${index + 1}`}</p>
                            {doc.file && (
                              <p className="text-sm text-gray-600">{doc.file.name}</p>
                            )}
                          </div>
                          <span className="text-sm text-green-600 font-medium">✓ Uploaded</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-navy-600 text-white py-3 rounded-lg font-semibold hover:bg-navy-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Account Type</h3>
              <p className="text-sm text-gray-600 mt-1">Service Provider Account</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              currentStatus === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {currentStatus === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}