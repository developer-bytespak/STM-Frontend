'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { adminApi } from '@/api/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';

interface BanProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    id: number;
    businessName: string;
    status?: string;
    approvalStatus?: string;
  } | null;
  onSuccess?: () => void;
}

export default function BanProviderModal({ 
  isOpen, 
  onClose, 
  provider,
  onSuccess 
}: BanProviderModalProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const banMutation = useMutation({
    mutationFn: (data: { providerId: number; reason: string }) => 
      adminApi.banProvider(data.providerId, data.reason),
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      
      // Reset form
      setReason('');
      setError('');
      
      // Show success message
      showToast(data?.message || 'Provider has been banned successfully', 'success');
      
      // Call success callback
      if (onSuccess) onSuccess();
      
      // Close modal
      onClose();
    },
    onError: (error: any) => {
      console.error('Ban Provider Error:', error);
      
      // Handle specific error cases based on backend responses
      if (error?.status === 400) {
        if (error?.message?.includes('active jobs')) {
          setError(error.message);
        } else if (error?.message?.includes('already banned')) {
          setError('This provider is already banned.');
        } else if (error?.message?.includes('pending') || error?.message?.includes('approval')) {
          setError('Cannot ban providers with pending approval status. Please approve or reject them first.');
        } else {
          setError(error?.message || 'Cannot ban this provider. Please check the requirements.');
        }
      } else if (error?.status === 404) {
        setError('Provider not found.');
      } else if (error?.status === 403) {
        setError('You do not have permission to ban this provider.');
      } else {
        setError(error?.message || 'Failed to ban provider. Please try again.');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please provide a reason for banning this provider.');
      return;
    }

    if (!provider) {
      setError('No provider selected.');
      return;
    }

    // Check if provider has pending approval status
    if (provider.approvalStatus === 'pending' || provider.status === 'pending') {
      setError('Cannot ban providers with pending approval status. Please approve or reject them first.');
      return;
    }

    banMutation.mutate({ providerId: provider.id, reason: reason.trim() });
  };

  const handleClose = () => {
    if (!banMutation.isPending) {
      setReason('');
      setError('');
      onClose();
    }
  };

  const isPending = provider?.approvalStatus === 'pending' || provider?.status === 'pending';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Ban Service Provider" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pending Status Warning */}
        {isPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-800">Cannot Ban Pending Provider</p>
                <p className="text-sm text-yellow-700 mt-1">
                  This provider has a pending approval status. Please approve or reject them first before attempting to ban.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        {!isPending && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-800">Warning: This action will suspend the provider</p>
                <p className="text-sm text-red-700 mt-1">
                  The provider will not be able to receive new jobs until unbanned.
                </p>
              </div>
            </div>
          </div>
        )}

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

        {/* Reason Input */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Ban <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="Provide a clear reason for banning this provider..."
            rows={4}
            disabled={banMutation.isPending || isPending}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400 resize-none"
          />
          {!isPending && (
            <p className="mt-1 text-xs text-gray-500">
              This reason will be shown to the provider in their notification.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleClose}
            disabled={banMutation.isPending}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={banMutation.isPending || !reason.trim() || isPending}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {banMutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Banning...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Ban Provider
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

