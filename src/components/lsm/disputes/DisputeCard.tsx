'use client';

import { Dispute } from '@/api/lsm';

interface DisputeCardProps {
  dispute: Dispute;
  onViewDetails: () => void;
}

export default function DisputeCard({ dispute, onViewDetails }: DisputeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'under_review':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Dispute #{dispute.id}
          </h3>
          <p className="text-sm text-gray-600">{dispute.job.service} • ${dispute.job.price}</p>
        </div>
        <span className={'px-3 py-1 rounded-full text-xs font-medium border ' + getStatusColor(dispute.status)}>
          {dispute.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-700">Customer</p>
            <p className="text-sm text-gray-900">{dispute.customer.name}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-700">Provider</p>
            <p className="text-sm text-gray-900">{dispute.provider.businessName}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Raised By</p>
            <p className="text-sm text-gray-900">{dispute.raisedBy === 'customer' ? 'Customer' : 'Provider'}</p>
          </div>
        </div>

        {dispute.chatStatus && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              {dispute.chatStatus.lsmJoined ? '✓ You are in the chat' : 
               dispute.chatStatus.lsmInvited ? '⏳ Invited to chat' : ''}
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">Created: {formatDate(dispute.createdAt)}</p>
          {dispute.resolvedAt && (
            <p className="text-xs text-gray-500">Resolved: {formatDate(dispute.resolvedAt)}</p>
          )}
        </div>
      </div>

      <button
        onClick={onViewDetails}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
      >
        View Details & Chat
      </button>
    </div>
  );
}

