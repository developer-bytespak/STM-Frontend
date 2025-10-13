'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { adminApi } from '@/api/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';

interface ReplaceLSMModalProps {
  isOpen: boolean;
  onClose: () => void;
  lsm: {
    id: number;
    name: string;
    region: string;
    area?: string;
  } | null;
  onSuccess?: () => void;
}

export default function ReplaceLSMModal({
  isOpen,
  onClose,
  lsm,
  onSuccess,
}: ReplaceLSMModalProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    newLsmFirstName: '',
    newLsmLastName: '',
    newLsmEmail: '',
    newLsmPhoneNumber: '',
    newLsmPassword: '',
    oldLsmAction: 'deactivate' as 'delete' | 'deactivate' | 'reassign',
    newRegionForOldLsm: '',
    newAreaForOldLsm: '',
  });
  const [error, setError] = useState('');

  const replaceMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      adminApi.replaceLSM(lsm!.id, data),
    onSuccess: (data: any) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-lsms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });

      // Show success message with details
      const message = `LSM replaced successfully! ${data.providersReassigned || 0} provider(s) reassigned.`;
      showToast(message, 'success');

      // Reset form
      setFormData({
        newLsmFirstName: '',
        newLsmLastName: '',
        newLsmEmail: '',
        newLsmPhoneNumber: '',
        newLsmPassword: '',
        oldLsmAction: 'deactivate',
        newRegionForOldLsm: '',
        newAreaForOldLsm: '',
      });
      setError('');

      // Call success callback
      if (onSuccess) onSuccess();

      // Close modal
      onClose();
    },
    onError: (error: any) => {
      console.error('Replace LSM Error:', error);

      // Handle specific error cases
      if (error?.status === 400) {
        setError(error?.message || 'Invalid input. Please check the form.');
      } else if (error?.status === 404) {
        setError('LSM not found.');
      } else if (error?.status === 409) {
        setError(error?.message || 'Email already in use or region conflict.');
      } else {
        setError(error?.message || 'Failed to replace LSM. Please try again.');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.newLsmFirstName.trim()) {
      setError('New LSM first name is required.');
      return;
    }

    if (!formData.newLsmLastName.trim()) {
      setError('New LSM last name is required.');
      return;
    }

    if (!formData.newLsmEmail.trim()) {
      setError('New LSM email is required.');
      return;
    }

    if (!formData.newLsmPhoneNumber.trim()) {
      setError('New LSM phone number is required.');
      return;
    }

    if (!formData.newLsmPassword || formData.newLsmPassword.length < 6) {
      setError('New LSM password must be at least 6 characters.');
      return;
    }

    if (formData.oldLsmAction === 'reassign') {
      if (!formData.newRegionForOldLsm.trim()) {
        setError('New region for old LSM is required when reassigning.');
        return;
      }
      if (!formData.newAreaForOldLsm.trim()) {
        setError('New area for old LSM is required when reassigning.');
        return;
      }
    }

    replaceMutation.mutate(formData);
  };

  const handleClose = () => {
    if (!replaceMutation.isPending) {
      setFormData({
        newLsmFirstName: '',
        newLsmLastName: '',
        newLsmEmail: '',
        newLsmPhoneNumber: '',
        newLsmPassword: '',
        oldLsmAction: 'deactivate',
        newRegionForOldLsm: '',
        newAreaForOldLsm: '',
      });
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Replace LSM" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Banner */}
        {lsm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-800">Replacing LSM: {lsm.name}</p>
                <p className="text-sm text-blue-700 mt-1">
                  Region: {lsm.region} • Area: {lsm.area || 'N/A'} • ID: {lsm.id}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  This will create a new LSM for the region+area and reassign all providers automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* New LSM Section */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            New LSM Details
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="newLsmFirstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="newLsmFirstName"
                name="newLsmFirstName"
                type="text"
                value={formData.newLsmFirstName}
                onChange={(e) => {
                  setFormData({ ...formData, newLsmFirstName: e.target.value });
                  if (error) setError('');
                }}
                placeholder="Enter first name"
                disabled={replaceMutation.isPending}
              />
            </div>

            <div>
              <label htmlFor="newLsmLastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="newLsmLastName"
                name="newLsmLastName"
                type="text"
                value={formData.newLsmLastName}
                onChange={(e) => {
                  setFormData({ ...formData, newLsmLastName: e.target.value });
                  if (error) setError('');
                }}
                placeholder="Enter last name"
                disabled={replaceMutation.isPending}
              />
            </div>
          </div>

          <div>
            <label htmlFor="newLsmEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              id="newLsmEmail"
              name="newLsmEmail"
              type="email"
              value={formData.newLsmEmail}
              onChange={(e) => {
                setFormData({ ...formData, newLsmEmail: e.target.value });
                if (error) setError('');
              }}
              placeholder="Enter email"
              disabled={replaceMutation.isPending}
            />
          </div>

          <div>
            <label htmlFor="newLsmPhoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="newLsmPhoneNumber"
              name="newLsmPhoneNumber"
              type="tel"
              value={formData.newLsmPhoneNumber}
              onChange={(e) => {
                setFormData({ ...formData, newLsmPhoneNumber: e.target.value });
                if (error) setError('');
              }}
              placeholder="Enter phone number"
              disabled={replaceMutation.isPending}
            />
          </div>

          <div>
            <label htmlFor="newLsmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <Input
              id="newLsmPassword"
              name="newLsmPassword"
              type="password"
              value={formData.newLsmPassword}
              onChange={(e) => {
                setFormData({ ...formData, newLsmPassword: e.target.value });
                if (error) setError('');
              }}
              placeholder="Minimum 6 characters"
              disabled={replaceMutation.isPending}
            />
          </div>
        </div>

        {/* Old LSM Action Section */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            What to do with old LSM?
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={formData.oldLsmAction}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  oldLsmAction: e.target.value as 'delete' | 'deactivate' | 'reassign',
                  newRegionForOldLsm: e.target.value === 'reassign' ? formData.newRegionForOldLsm : '',
                  newAreaForOldLsm: e.target.value === 'reassign' ? formData.newAreaForOldLsm : ''
                });
                if (error) setError('');
              }}
              disabled={replaceMutation.isPending}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
            >
              <option value="deactivate">Deactivate (Set to Inactive)</option>
              <option value="reassign">Reassign to Another Region</option>
              <option value="delete">Delete (Same as Deactivate)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {formData.oldLsmAction === 'deactivate' && 'Old LSM will be deactivated and can no longer log in.'}
              {formData.oldLsmAction === 'reassign' && 'Old LSM will be moved to manage a different region.'}
              {formData.oldLsmAction === 'delete' && 'Old LSM will be deactivated (soft delete).'}
            </p>
          </div>

          {formData.oldLsmAction === 'reassign' && (
            <>
              <div>
                <label htmlFor="newRegionForOldLsm" className="block text-sm font-medium text-gray-700 mb-2">
                  New Region for Old LSM <span className="text-red-500">*</span>
                </label>
                <Input
                  id="newRegionForOldLsm"
                  name="newRegionForOldLsm"
                  type="text"
                  value={formData.newRegionForOldLsm}
                  onChange={(e) => {
                    setFormData({ ...formData, newRegionForOldLsm: e.target.value });
                    if (error) setError('');
                  }}
                  placeholder="Enter new region"
                  disabled={replaceMutation.isPending}
                />
              </div>
              
              <div>
                <label htmlFor="newAreaForOldLsm" className="block text-sm font-medium text-gray-700 mb-2">
                  New Area for Old LSM <span className="text-red-500">*</span>
                </label>
                <Input
                  id="newAreaForOldLsm"
                  name="newAreaForOldLsm"
                  type="text"
                  value={formData.newAreaForOldLsm}
                  onChange={(e) => {
                    setFormData({ ...formData, newAreaForOldLsm: e.target.value });
                    if (error) setError('');
                  }}
                  placeholder="Enter new area"
                  disabled={replaceMutation.isPending}
                />
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleClose}
            disabled={replaceMutation.isPending}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={replaceMutation.isPending}
            className="px-6 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {replaceMutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Replacing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Replace LSM
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

