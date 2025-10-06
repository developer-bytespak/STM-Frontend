'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { validatePhone, formatPhoneNumber } from '@/lib/validation';

interface ProviderProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  description: string;
  location: string;
  experience: string;
  minPrice: string;
  maxPrice: string;
  serviceType: string;
  certifications: string;
}

export default function ProviderProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);
  
  const [profileData, setProfileData] = useState<ProviderProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    description: '',
    location: '',
    experience: '',
    minPrice: '',
    maxPrice: '',
    serviceType: '',
    certifications: ''
  });

  const [editData, setEditData] = useState<ProviderProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    description: '',
    location: '',
    experience: '',
    minPrice: '',
    maxPrice: '',
    serviceType: '',
    certifications: ''
  });

  const [errors, setErrors] = useState<Partial<ProviderProfile>>({});

  // Load profile data from localStorage
  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Load provider data from localStorage
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
            businessType: providerData.businessType || '',
            description: providerData.description || '',
            location: providerData.location || '',
            experience: providerData.experience || '',
            minPrice: providerData.minPrice || '',
            maxPrice: providerData.maxPrice || '',
            serviceType: providerData.serviceType || '',
            certifications: providerData.certifications || ''
          };
          setProfileData(profile);
          setEditData(profile);
          setProfileLoaded(true);
        } else {
          console.warn('No provider data found for:', user.email);
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    }
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

    if (!editData.businessType.trim()) {
      newErrors.businessType = 'Business type is required';
    }

    if (!editData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!editData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!editData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    }

    if (!editData.serviceType.trim()) {
      newErrors.serviceType = 'Service type is required';
    }

    if (!editData.minPrice.trim()) {
      newErrors.minPrice = 'Minimum price is required';
    }

    if (!editData.maxPrice.trim()) {
      newErrors.maxPrice = 'Maximum price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      // Update in localStorage
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

      setProfileData(editData);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setErrors({ firstName: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Provider Profile</h1>
          <p className="text-gray-600 mt-2">Manage your business information and services</p>
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

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Card Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
              <p className="text-sm text-gray-500 mt-1">Update your business details and services</p>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            )}
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
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
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
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Business Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.businessName}
                          onChange={(e) => setEditData({ ...editData, businessName: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.businessName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      ) : (
                        <p className="px-4 py-2 text-gray-900">{profileData.businessName}</p>
                      )}
                      {errors.businessName && (
                        <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
                      )}
                    </div>

                    {/* Business Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <select
                          value={editData.businessType}
                          onChange={(e) => setEditData({ ...editData, businessType: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.businessType ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Business Type</option>
                          <option value="Individual">Individual</option>
                          <option value="Small Business">Small Business</option>
                          <option value="Corporation">Corporation</option>
                          <option value="LLC">LLC</option>
                          <option value="Partnership">Partnership</option>
                        </select>
                      ) : (
                        <p className="px-4 py-2 text-gray-900">{profileData.businessType}</p>
                      )}
                      {errors.businessType && (
                        <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>
                      )}
                    </div>

                    {/* Service Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Type <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <select
                          value={editData.serviceType}
                          onChange={(e) => setEditData({ ...editData, serviceType: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.serviceType ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Service Type</option>
                          <option value="Plumbing">Plumbing</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Cleaning">Cleaning</option>
                          <option value="HVAC">HVAC</option>
                          <option value="Landscaping">Landscaping</option>
                          <option value="Painting">Painting</option>
                          <option value="Flooring">Flooring</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Security">Security</option>
                          <option value="Appliance Repair">Appliance Repair</option>
                        </select>
                      ) : (
                        <p className="px-4 py-2 text-gray-900">{profileData.serviceType}</p>
                      )}
                      {errors.serviceType && (
                        <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>
                      )}
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.experience}
                          onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.experience ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 5 years"
                        />
                      ) : (
                        <p className="px-4 py-2 text-gray-900">{profileData.experience}</p>
                      )}
                      {errors.experience && (
                        <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
                      )}
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.location}
                          onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.location ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="City, State"
                        />
                      ) : (
                        <p className="px-4 py-2 text-gray-900">{profileData.location}</p>
                      )}
                      {errors.location && (
                        <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                      )}
                    </div>

                    {/* Price Range */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.minPrice}
                              onChange={(e) => setEditData({ ...editData, minPrice: e.target.value })}
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.minPrice ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Min Price (e.g., $50)"
                            />
                          ) : (
                            <p className="px-4 py-2 text-gray-900">{profileData.minPrice}</p>
                          )}
                          {errors.minPrice && (
                            <p className="text-red-500 text-sm mt-1">{errors.minPrice}</p>
                          )}
                        </div>
                        <div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.maxPrice}
                              onChange={(e) => setEditData({ ...editData, maxPrice: e.target.value })}
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.maxPrice ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Max Price (e.g., $200)"
                            />
                          ) : (
                            <p className="px-4 py-2 text-gray-900">{profileData.maxPrice}</p>
                          )}
                          {errors.maxPrice && (
                            <p className="text-red-500 text-sm mt-1">{errors.maxPrice}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Description <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          rows={4}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.description ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Describe your services and expertise..."
                        />
                      ) : (
                        <p className="px-4 py-2 text-gray-900 whitespace-pre-line">{profileData.description}</p>
                      )}
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                      )}
                    </div>

                    {/* Certifications */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certifications & Licenses
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editData.certifications}
                          onChange={(e) => setEditData({ ...editData, certifications: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="List your certifications, licenses, and qualifications..."
                        />
                      ) : (
                        <p className="px-4 py-2 text-gray-900 whitespace-pre-line">
                          {profileData.certifications || 'No certifications listed'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
        </div>

        {/* Account Info */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Account Type</h3>
              <p className="text-sm text-gray-600 mt-1">Service Provider Account</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Provider
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}