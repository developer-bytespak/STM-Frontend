'use client';

import { useState } from 'react';
import { ProviderInRegion } from '@/api/lsm';

interface ProviderManagementCardProps {
  provider: ProviderInRegion;
  onStatusChange: (providerId: number, status: 'active' | 'inactive') => Promise<void>;
  onRequestBan: (providerId: number, reason: string) => Promise<void>;
  onRefresh: () => void;
  onViewDetails?: (providerId: number) => void;
}

export default function ProviderManagementCard({ 
  provider, 
  onStatusChange, 
  onRequestBan,
  onRefresh,
  onViewDetails
}: ProviderManagementCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBanReason, setShowBanReason] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [error, setError] = useState('');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'banned':
        return 'bg-red-200 text-red-900 border-red-400';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleStatusToggle = async () => {
    if (provider.status === 'banned' || provider.status === 'pending' || provider.status === 'rejected') {
      alert('Cannot change status of banned, pending, or rejected providers');
      return;
    }

    const newStatus = provider.status === 'active' ? 'inactive' : 'active';
    const confirmed = window.confirm(
      `Are you sure you want to mark ${provider.businessName} as ${newStatus}?`
    );

    if (!confirmed) return;

    setIsProcessing(true);
    setError('');
    try {
      await onStatusChange(provider.id, newStatus);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBanRequest = async () => {
    if (!banReason.trim()) {
      setError('Please provide a reason for the ban request');
      return;
    }

    setIsProcessing(true);
    setError('');
    try {
      await onRequestBan(provider.id, banReason);
      setShowBanReason(false);
      setBanReason('');
      onRefresh();
      alert('Ban request submitted to admin successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit ban request');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {/* Header with Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">
            {provider.businessName}
          </h3>
          <p className="text-sm text-gray-600">
            {provider.user.first_name} {provider.user.last_name}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(provider.status)}`}
        >
          {provider.status.toUpperCase()}
        </span>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>{provider.user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>{provider.user.phone_number}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span>{provider.rating.toFixed(1)} • {provider.experience} years • {provider.jobCount} jobs</span>
        </div>
      </div>

      {/* Services */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-600 mb-2">Services Offered:</p>
        <div className="flex flex-wrap gap-1">
          {provider.services.slice(0, 4).map((service, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
            >
              {service.name}
            </span>
          ))}
          {provider.services.length > 4 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
              +{provider.services.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Service Areas */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-600 mb-2">Service Areas:</p>
        <div className="flex flex-wrap gap-1">
          {provider.serviceAreas.slice(0, 5).map((area, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
            >
              {area}
            </span>
          ))}
          {provider.serviceAreas.length > 5 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
              +{provider.serviceAreas.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Rejection Reason (if rejected) */}
      {provider.status === 'rejected' && provider.rejectionReason && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
          <p className="text-xs text-red-700">{provider.rejectionReason}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-xs">{error}</p>
        </div>
      )}

      {/* View Details Button */}
      {onViewDetails && (
        <div className="mb-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onViewDetails(provider.id)}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            View Full Profile & History
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {!showBanReason ? (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          {/* Toggle Active/Inactive */}
          {(provider.status === 'active' || provider.status === 'inactive') && (
            <button
              onClick={handleStatusToggle}
              disabled={isProcessing}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                provider.status === 'active'
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isProcessing ? 'Processing...' : provider.status === 'active' ? 'Mark Inactive' : 'Mark Active'}
            </button>
          )}

          {/* Request Ban */}
          {provider.status !== 'banned' && (
            <button
              onClick={() => setShowBanReason(true)}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Request Ban
            </button>
          )}

          {/* Already Banned */}
          {provider.status === 'banned' && (
            <div className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium text-center">
              Provider is Banned
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div>
            <label htmlFor={`banReason-${provider.id}`} className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Ban Request <span className="text-red-500">*</span>
            </label>
            <textarea
              id={`banReason-${provider.id}`}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              placeholder="Explain why this provider should be banned..."
              disabled={isProcessing}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowBanReason(false);
                setBanReason('');
                setError('');
              }}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleBanRequest}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Submitting...' : 'Submit Ban Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

