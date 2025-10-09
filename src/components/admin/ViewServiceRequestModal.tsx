'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { ServiceRequest } from '@/api/admin';

interface ViewServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  onApprove: (requestId: number) => Promise<void>;
  onReject: (requestId: number, reason: string) => Promise<void>;
}

export default function ViewServiceRequestModal({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}: ViewServiceRequestModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  if (!request) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    setError('');
    try {
      await onApprove(request.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    setError('');
    try {
      await onReject(request.id, rejectionReason);
      setShowRejectInput(false);
      setRejectionReason('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderQuestions = () => {
    if (!request.questions_json) return null;

    let questions: any[];
    if (typeof request.questions_json === 'string') {
      try {
        questions = JSON.parse(request.questions_json);
      } catch {
        return null;
      }
    } else {
      questions = request.questions_json;
    }

    if (!Array.isArray(questions) || questions.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Service Questions:</h4>
        <div className="space-y-2">
          {questions.map((q: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Q{index + 1}:</span> {q.question || q.text || q}
              </p>
              {q.type && (
                <p className="text-xs text-gray-500 mt-1">
                  Type: <span className="font-medium">{q.type}</span>
                </p>
              )}
              {q.options && (
                <p className="text-xs text-gray-500 mt-1">
                  Options: {Array.isArray(q.options) ? q.options.join(', ') : q.options}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Service Request Details"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Service Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            {request.serviceName}
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">Category</p>
              <p className="text-sm text-blue-900">{request.category}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">Region</p>
              <p className="text-sm text-blue-900">{request.region}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Description:</h4>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
            {request.description}
          </p>
        </div>

        {/* Questions */}
        {renderQuestions()}

        {/* Provider Information */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Provider Information:</h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div>
              <span className="text-xs text-gray-600">Business Name:</span>
              <p className="text-sm font-medium text-gray-900">{request.provider.businessName}</p>
            </div>
            <div>
              <span className="text-xs text-gray-600">Contact Person:</span>
              <p className="text-sm text-gray-900">
                {request.provider.user.first_name} {request.provider.user.last_name}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-600">Email:</span>
              <p className="text-sm text-gray-900">{request.provider.user.email}</p>
            </div>
          </div>
        </div>

        {/* LSM Information */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Approved by LSM:</h4>
          <div className="bg-green-50 p-4 rounded-lg space-y-2">
            <div>
              <span className="text-xs text-green-600">LSM Name:</span>
              <p className="text-sm font-medium text-green-900">{request.lsm.name}</p>
            </div>
            <div>
              <span className="text-xs text-green-600">LSM Region:</span>
              <p className="text-sm text-green-900">{request.lsm.region}</p>
            </div>
            <div>
              <span className="text-xs text-green-600">Approved At:</span>
              <p className="text-sm text-green-900">
                {new Date(request.lsm_reviewed_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Submission Date */}
        <div className="text-xs text-gray-500 border-t pt-3">
          Request submitted: {new Date(request.created_at).toLocaleString()}
        </div>

        {/* Action Buttons or Rejection Input */}
        {!showRejectInput ? (
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? 'Processing...' : '✓ Approve & Create Service'}
            </Button>
            <Button
              onClick={() => setShowRejectInput(true)}
              disabled={isProcessing}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
            >
              ✗ Reject Request
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-4 border-t">
            <div>
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Explain why this request is being rejected..."
                disabled={isProcessing}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
              <Button
                onClick={() => {
                  setShowRejectInput(false);
                  setRejectionReason('');
                  setError('');
                }}
                disabled={isProcessing}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

