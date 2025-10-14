'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { validatePhone } from '@/lib/validation';
import { apiClient } from '@/api';

interface LSMProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  area: string;
  department: string;
  employeeId: string;
}

export default function LSMProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);
  
  const [profileData, setProfileData] = useState<LSMProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    region: '',
    area: '',
    department: '',
    employeeId: ''
  });

  const [editData, setEditData] = useState<LSMProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    region: '',
    area: '',
    department: '',
    employeeId: ''
  });

  const [errors, setErrors] = useState<Partial<LSMProfile>>({});

  // Load profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      // Wait for auth to finish loading
      if (isLoading) return;

      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        // Fetch profile from backend API
        const response = await apiClient.getProfile() as any;
        
        if (response) {
          const profile = {
            firstName: response.firstName || response.first_name || '',
            lastName: response.lastName || response.last_name || '',
            email: response.email || '',
            phone: response.phoneNumber || response.phone_number || response.phone || '',
            address: response.address || '',
            region: response.region || '',
            area: response.area || '',
            department: response.department || '',
            employeeId: response.employeeId || response.employee_id || ''
          };
          setProfileData(profile);
          setEditData(profile);
          setProfileLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
        // Fallback to user data from auth
        if (user) {
          const profile = {
            firstName: (user as any).firstName || user.name?.split(' ')[0] || '',
            lastName: (user as any).lastName || user.name?.split(' ')[1] || '',
            email: user.email,
            phone: (user as any).phone || '',
            address: '',
            region: '',
            area: '',
            department: '',
            employeeId: ''
          };
          setProfileData(profile);
          setEditData(profile);
        }
      }
    };

    fetchProfile();
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
    const newErrors: Partial<LSMProfile> = {};

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

    if (!editData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!editData.region.trim()) {
      newErrors.region = 'Region is required';
    }

    if (!editData.area.trim()) {
      newErrors.area = 'Area is required';
    }

    if (!editData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!editData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      // Update profile via backend API
      await apiClient.updateProfile({
        firstName: editData.firstName,
        lastName: editData.lastName,
        phoneNumber: editData.phone,
      });

      // Update local state
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
          <div className="w-12 h-12 border-4 border-navy-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
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
          <p className="text-gray-600 mt-2">Manage your LSM information</p>
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
              <h2 className="text-xl font-semibold text-gray-900">LSM Information</h2>
              <p className="text-sm text-gray-500 mt-1">Update your local service management details</p>
            </div>
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

          {/* Card Body */}
          <div className="px-6 py-6">
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                  {profileData.firstName && profileData.lastName 
                    ? `${profileData.firstName[0].toUpperCase()}${profileData.lastName[0].toUpperCase()}`
                    : profileData.firstName
                    ? profileData.firstName[0].toUpperCase()
                    : 'L'
                  }
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h3>
                  <p className="text-gray-600">{profileData.email}</p>
                  {(profileData.region || profileData.area) && (
                    <p className="text-purple-600 font-medium">
                      {profileData.region && profileData.area 
                        ? `${profileData.region} - ${profileData.area}`
                        : profileData.region 
                        ? `${profileData.region} Region`
                        : profileData.area}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
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

                {/* Employee ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.employeeId}
                      onChange={(e) => setEditData({ ...editData, employeeId: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                        errors.employeeId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Employee ID"
                    />
                  ) : (
                    <p className="px-4 py-2 text-gray-900">{profileData.employeeId}</p>
                  )}
                  {errors.employeeId && (
                    <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>
                  )}
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.region}
                      onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                        errors.region ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter region"
                    />
                  ) : (
                    <p className="px-4 py-2 text-gray-900">{profileData.region}</p>
                  )}
                  {errors.region && (
                    <p className="text-red-500 text-sm mt-1">{errors.region}</p>
                  )}
                </div>

                {/* Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.area}
                      onChange={(e) => setEditData({ ...editData, area: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                        errors.area ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter area"
                    />
                  ) : (
                    <p className="px-4 py-2 text-gray-900">{profileData.area}</p>
                  )}
                  {errors.area && (
                    <p className="text-red-500 text-sm mt-1">{errors.area}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <select
                      value={editData.department}
                      onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                        errors.department ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Department</option>
                      <option value="Operations">Operations</option>
                      <option value="Customer Service">Customer Service</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                      <option value="Field Management">Field Management</option>
                    </select>
                  ) : (
                    <p className="px-4 py-2 text-gray-900">{profileData.department}</p>
                  )}
                  {errors.department && (
                    <p className="text-red-500 text-sm mt-1">{errors.department}</p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123 Main St, City, State, ZIP"
                    />
                  ) : (
                    <p className="px-4 py-2 text-gray-900 whitespace-pre-line">{profileData.address}</p>
                  )}
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>
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
              <p className="text-sm text-gray-600 mt-1">Local Service Manager Account</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
