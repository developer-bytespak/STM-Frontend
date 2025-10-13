'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { adminApi } from '@/api/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';

interface UpdateLSMModalProps {
  isOpen: boolean;
  onClose: () => void;
  lsm: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    region: string;
    area?: string;
    status?: string;
  } | null;
  onSuccess?: () => void;
}

export default function UpdateLSMModal({
  isOpen,
  onClose,
  lsm,
  onSuccess,
}: UpdateLSMModalProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    region: '',
    area: '',
    status: 'active',
  });
  const [error, setError] = useState('');

  // Update form data when LSM changes
  useEffect(() => {
    if (lsm) {
      // Split name into firstName and lastName
      const nameParts = (lsm.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData({
        firstName,
        lastName,
        email: lsm.email || '',
        phoneNumber: lsm.phoneNumber || '',
        region: lsm.region || '',
        area: lsm.area || '',
        status: lsm.status || 'active',
      });
    }
  }, [lsm]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      adminApi.updateLSM(lsm!.id, data),
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-lsms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });

      // Show success message
      showToast(data?.message || 'LSM updated successfully', 'success');

      // Reset form
      setError('');

      // Call success callback
      if (onSuccess) onSuccess();

      // Close modal
      onClose();
    },
    onError: (error: any) => {
      console.error('Update LSM Error:', error);

      // Handle specific error cases
      if (error?.status === 400) {
        setError(error?.message || 'Invalid input. Please check the form.');
      } else if (error?.status === 404) {
        setError('LSM not found.');
      } else if (error?.status === 403) {
        setError('You do not have permission to update this LSM.');
      } else if (error?.status === 409) {
        setError('Email already exists.');
      } else {
        setError(error?.message || 'Failed to update LSM. Please try again.');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim()) {
      setError('First name is required.');
      return;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setError('Phone is required.');
      return;
    }

    if (!formData.region.trim()) {
      setError('Region is required.');
      return;
    }

    if (!formData.area.trim()) {
      setError('Area is required.');
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleClose = () => {
    if (!updateMutation.isPending) {
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update LSM" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* LSM Info */}
        {lsm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium">Updating LSM: {lsm.name}</p>
            <p className="text-xs text-blue-600 mt-1">ID: {lsm.id}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* First Name Input */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => {
              setFormData({ ...formData, firstName: e.target.value });
              if (error) setError('');
            }}
            placeholder="Enter first name"
            disabled={updateMutation.isPending}
          />
        </div>

        {/* Last Name Input */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => {
              setFormData({ ...formData, lastName: e.target.value });
              if (error) setError('');
            }}
            placeholder="Enter last name"
            disabled={updateMutation.isPending}
          />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (error) setError('');
            }}
            placeholder="Enter email"
            disabled={updateMutation.isPending}
          />
        </div>

        {/* Phone Input */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Phone <span className="text-red-500">*</span>
          </label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => {
              setFormData({ ...formData, phoneNumber: e.target.value });
              if (error) setError('');
            }}
            placeholder="Enter phone number"
            disabled={updateMutation.isPending}
          />
        </div>

        {/* Region Input */}
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
            Region <span className="text-red-500">*</span>
          </label>
          <Input
            id="region"
            name="region"
            type="text"
            value={formData.region}
            onChange={(e) => {
              setFormData({ ...formData, region: e.target.value });
              if (error) setError('');
            }}
            placeholder="Enter region"
            disabled={updateMutation.isPending}
          />
        </div>

        {/* Area Input */}
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
            Area <span className="text-red-500">*</span>
          </label>
          <Input
            id="area"
            name="area"
            type="text"
            value={formData.area}
            onChange={(e) => {
              setFormData({ ...formData, area: e.target.value });
              if (error) setError('');
            }}
            placeholder="Enter area"
            disabled={updateMutation.isPending}
          />
        </div>

        {/* Status Selection */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => {
              setFormData({ ...formData, status: e.target.value });
              if (error) setError('');
            }}
            disabled={updateMutation.isPending}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleClose}
            disabled={updateMutation.isPending}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update LSM
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

