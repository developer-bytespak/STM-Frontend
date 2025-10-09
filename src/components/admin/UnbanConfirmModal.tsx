'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { adminApi } from '@/api/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';

interface UnbanConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    id: number;
    businessName: string;
  } | null;
  onSuccess?: () => void;
}

export default function UnbanConfirmModal({ 
  isOpen, 
  onClose, 
  provider,
  onSuccess 
}: UnbanConfirmModalProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [error, setError] = useState('');

  const unbanMutation = useMutation({
    mutationFn: (providerId: number) => adminApi.unbanProvider(providerId),
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      
      // Reset error
      setError('');
      
      // Show success message
      showToast(data?.message || 'Provider has been unbanned successfully', 'success');
      
      // Call success callback
      if (onSuccess) onSuccess();
      
      // Close modal
      onClose();
    },
    onError: (error: any) => {
      console.error('Unban Provider Error:', error);
      
      // Handle specific error cases based on backend responses
      if (error?.status === 400) {
        if (error?.message?.includes('not banned')) {
          setError('This provider is not currently banned.');
        } else {
          setError(error?.message || 'Cannot unban this provider. Please check the status.');
        }
      } else if (error?.status === 404) {
        setError('Provider not found.');
      } else if (error?.status === 403) {
        setError('You do not have permission to unban this provider.');
      } else {
        setError(error?.message || 'Failed to unban provider. Please try again.');
      }
    },
  });

  const handleConfirm = () => {
    if (!provider) {
      setError('No provider selected.');
      return;
    }

    unbanMutation.mutate(provider.id);
  };

  const handleClose = () => {
    if (!unbanMutation.isPending) {
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Unban Service Provider" maxWidth="md">
      <div className="space-y-4">
        {/* Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800">Reactivate Provider Account</p>
              <p className="text-sm text-green-700 mt-1">
                The provider will be able to receive jobs again and access their account.
              </p>
            </div>
          </div>
        </div>

        {/* Provider Info */}
        {provider && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Provider:</p>
            <p className="font-semibold text-gray-900 mt-1">{provider.businessName}</p>
            <p className="text-sm text-gray-500">ID: {provider.id}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <p className="text-sm text-gray-600">
          Are you sure you want to unban this provider? They will be notified and can start accepting jobs immediately.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleClose}
            disabled={unbanMutation.isPending}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={unbanMutation.isPending}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {unbanMutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Unbanning...
              </>
            ) : (
              'Unban Provider'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

