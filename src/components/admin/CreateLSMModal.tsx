'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { adminApi } from '@/api/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateLSMModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateLSMModal({ isOpen, onClose, onSuccess }: CreateLSMModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    region: '',
    area: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createLSMMutation = useMutation({
    mutationFn: (data: typeof formData) => adminApi.createLsm(data),
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-lsms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        region: '',
        area: '',
      });
      setErrors({});
      
      // Call success callback
      if (onSuccess) onSuccess();
      
      // Close modal
      onClose();
    },
    onError: (error: any) => {
      console.error('LSM Creation Error:', error);
      
      // Extract error message from various possible error formats
      let errorMessage = 'Failed to create LSM. Please try again.';
      
      // Check for region uniqueness error
      if (error?.message?.includes('region') || error?.message?.includes('LSM already exists')) {
        errorMessage = `An LSM already exists for the region "${formData.region}". Each region can only have one LSM.`;
        setErrors({ 
          general: errorMessage,
          region: 'This region already has an LSM'
        });
        return;
      } 
      // Check for email uniqueness error
      else if (error?.message?.includes('email') || error?.message?.includes('Email already exists')) {
        errorMessage = 'This email is already registered. Please use a different email.';
        setErrors({ 
          general: errorMessage,
          email: 'This email is already taken'
        });
        return;
      }
      // Check for general validation errors
      else if (error?.status === 400 || error?.status === 409) {
        errorMessage = error?.message || 'Failed to create LSM. Please check your inputs.';
      }
      // Check for Prisma/database errors
      else if (error?.message?.includes('Unique constraint')) {
        if (error?.message?.includes('region')) {
          errorMessage = `An LSM already exists for the region "${formData.region}". Each region can only have one LSM.`;
          setErrors({ 
            general: errorMessage,
            region: 'This region already has an LSM'
          });
          return;
        } else if (error?.message?.includes('email')) {
          errorMessage = 'This email is already registered. Please use a different email.';
          setErrors({ 
            general: errorMessage,
            email: 'This email is already taken'
          });
          return;
        } else {
          errorMessage = 'This record already exists. Please check your inputs.';
        }
      }
      
      setErrors({ general: errorMessage });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    if (!formData.region.trim()) {
      newErrors.region = 'Region is required';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Area is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    createLSMMutation.mutate(formData);
  };

  const handleClose = () => {
    if (!createLSMMutation.isPending) {
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        region: '',
        area: '',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Local Service Manager" maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.general}
          </div>
        )}

        {/* Success Message */}
        {createLSMMutation.isSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            LSM created successfully!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              disabled={createLSMMutation.isPending}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              disabled={createLSMMutation.isPending}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="lsm@example.com"
            disabled={createLSMMutation.isPending}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
            disabled={createLSMMutation.isPending}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 8 characters long
          </p>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1234567890"
            disabled={createLSMMutation.isPending}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Region */}
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
            Region <span className="text-red-500">*</span>
          </label>
          <Input
            id="region"
            name="region"
            type="text"
            value={formData.region}
            onChange={handleChange}
            placeholder="e.g., Texas, California"
            disabled={createLSMMutation.isPending}
          />
          {errors.region && (
            <p className="mt-1 text-sm text-red-600">{errors.region}</p>
          )}
        </div>

        {/* Area */}
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
            Area <span className="text-red-500">*</span>
          </label>
          <Input
            id="area"
            name="area"
            type="text"
            value={formData.area}
            onChange={handleChange}
            placeholder="e.g., North Dallas, Houston Downtown"
            disabled={createLSMMutation.isPending}
          />
          {errors.area && (
            <p className="mt-1 text-sm text-red-600">{errors.area}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Each area in a region can have only one LSM
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleClose}
            disabled={createLSMMutation.isPending}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createLSMMutation.isPending}
            className="px-6 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {createLSMMutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </>
            ) : (
              'Create LSM'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

