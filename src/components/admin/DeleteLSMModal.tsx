'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { adminApi } from '@/api/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';

interface DeleteLSMModalProps {
  isOpen: boolean;
  onClose: () => void;
  lsm: {
    id: number;
    name: string;
    region: string;
  } | null;
  onSuccess?: () => void;
}

export default function DeleteLSMModal({
  isOpen,
  onClose,
  lsm,
  onSuccess,
}: DeleteLSMModalProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [error, setError] = useState('');

  const deleteMutation = useMutation({
    mutationFn: (lsmId: number) => adminApi.deleteLSM(lsmId),
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-lsms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });

      // Show success message
      showToast(data?.message || 'LSM deleted successfully', 'success');

      // Reset error
      setError('');

      // Call success callback
      if (onSuccess) onSuccess();

      // Close modal
      onClose();
    },
    onError: (error: any) => {
      console.error('Delete LSM Error:', error);

      // Handle specific error cases
      if (error?.status === 400) {
        if (error?.message?.includes('active providers')) {
          setError('Cannot delete LSM with active providers. Please reassign providers first.');
        } else {
          setError(error?.message || 'Cannot delete this LSM. Please check the requirements.');
        }
      } else if (error?.status === 404) {
        setError('LSM not found.');
      } else if (error?.status === 403) {
        setError('You do not have permission to delete this LSM.');
      } else {
        setError(error?.message || 'Failed to delete LSM. Please try again.');
      }
    },
  });

  const handleDelete = () => {
    if (!lsm) {
      setError('No LSM selected.');
      return;
    }

    deleteMutation.mutate(lsm.id);
  };

  const handleClose = () => {
    if (!deleteMutation.isPending) {
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Delete LSM" maxWidth="md">
      <div className="space-y-4">
        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800">Warning: This action cannot be undone</p>
              <p className="text-sm text-red-700 mt-1">
                Deleting this LSM will remove all their data from the system. This action is permanent.
              </p>
            </div>
          </div>
        </div>

        {/* LSM Info */}
        {lsm && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">You are about to delete:</p>
            <p className="font-semibold text-gray-900 mt-1">{lsm.name}</p>
            <p className="text-sm text-gray-500">Region: {lsm.region}</p>
            <p className="text-xs text-gray-400 mt-1">ID: {lsm.id}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Confirmation Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Please confirm that you want to permanently delete this LSM.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleClose}
            disabled={deleteMutation.isPending}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {deleteMutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete LSM
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

