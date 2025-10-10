'use client';

import { useState, useEffect } from 'react';
import { lsmApi, DisputeDetail } from '@/api/lsm';

interface DisputeDetailModalProps {
  disputeId: number;
  onClose: () => void;
  onDisputeUpdated: () => void;
}

export default function DisputeDetailModal({ 
  disputeId, 
  onClose, 
  onDisputeUpdated 
}: DisputeDetailModalProps) {
  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchDisputeDetails();
  }, [disputeId]);

  const fetchDisputeDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await lsmApi.getDisputeDetails(disputeId);
      setDispute(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dispute details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChat = async () => {
    if (!dispute) return;

    try {
      setIsProcessing(true);
      await lsmApi.joinDisputeChat(disputeId);
      alert('Successfully joined the dispute chat');
      await fetchDisputeDetails();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to join chat');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      setError('Please provide resolution notes');
      return;
    }

    if (!confirm('Are you sure you want to resolve this dispute? This action cannot be undone.')) {
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      await lsmApi.resolveDispute(disputeId, resolutionNotes);
      alert('Dispute resolved successfully. Parties have been notified.');
      onDisputeUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve dispute');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'under_review':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSenderName = (senderType: string) => {
    if (!dispute) return '';
    switch (senderType) {
      case 'customer':
        return dispute.customer.name;
      case 'service_provider':
        return dispute.provider.ownerName || dispute.provider.businessName;
      case 'local_service_manager':
        return 'LSM (You)';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dispute details...</p>
        </div>
      </div>
    );
  }

  if (!dispute) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dispute #{dispute.dispute.id}</h2>
            <span className={'inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ' + getStatusColor(dispute.dispute.status)}>
              {dispute.dispute.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Job Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Job Information</h3>
            <p className="text-sm text-gray-700">Service: <span className="font-medium">{dispute.job.service}</span></p>
            <p className="text-sm text-gray-700">Category: <span className="font-medium">{dispute.job.category}</span></p>
            <p className="text-sm text-gray-700">Price: <span className="font-medium">${dispute.job.price}</span></p>
            <p className="text-sm text-gray-700">Job ID: <span className="font-medium">#{dispute.job.id}</span></p>
            <p className="text-sm text-gray-700">Job Status: <span className="font-medium capitalize">{dispute.job.status}</span></p>
          </div>

          {/* Parties Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer
              </h3>
              <p className="text-sm text-gray-900 font-medium">{dispute.customer.name}</p>
              <p className="text-xs text-gray-600">{dispute.customer.email}</p>
              <p className="text-xs text-gray-600">{dispute.customer.phone}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Provider
              </h3>
              <p className="text-sm text-gray-900 font-medium">{dispute.provider.businessName}</p>
              <p className="text-xs text-gray-600">{dispute.provider.ownerName}</p>
              <p className="text-xs text-gray-600">{dispute.provider.email}</p>
              <p className="text-xs text-gray-600">{dispute.provider.phone}</p>
            </div>
          </div>

          {/* Dispute Raised By */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Dispute Raised By</h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {dispute.dispute.raisedBy === 'customer' ? 'Customer' : 'Service Provider'}
            </p>
          </div>

          {/* Chat History */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat History
              {dispute.chatStatus && !dispute.chatStatus.lsmJoined && (
                <span className="text-xs text-yellow-600 font-normal">(You haven't joined the chat yet)</span>
              )}
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              {dispute.chatHistory.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No messages yet</p>
              ) : (
                <div className="space-y-3">
                  {dispute.chatHistory.map((message) => (
                    <div
                      key={message.id}
                      className={'flex ' + (message.senderType === 'local_service_manager' ? 'justify-end' : 'justify-start')}
                    >
                      <div className={'max-w-xs rounded-lg p-3 ' + (
                        message.senderType === 'local_service_manager' 
                          ? 'bg-blue-600 text-white'
                          : message.senderType === 'customer'
                          ? 'bg-white border border-gray-300 text-gray-900'
                          : 'bg-purple-100 text-purple-900'
                      )}>
                        <p className="text-xs font-semibold mb-1">{getSenderName(message.senderType)}</p>
                        <p className="text-sm">{message.message}</p>
                        <p className={'text-xs mt-1 ' + (message.senderType === 'local_service_manager' ? 'text-blue-100' : 'text-gray-500')}>
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          {dispute.dispute.status !== 'resolved' && !showResolveForm && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {dispute.chatStatus && dispute.chatStatus.lsmInvited && !dispute.chatStatus.lsmJoined && (
                <button
                  onClick={handleJoinChat}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Joining...' : 'Join Chat'}
                </button>
              )}
              <button
                onClick={() => setShowResolveForm(true)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resolve Dispute
              </button>
            </div>
          )}

          {/* Resolve Form */}
          {showResolveForm && dispute.dispute.status !== 'resolved' && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Resolve Dispute</h3>
              <div className="mb-4">
                <label htmlFor="resolutionNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="resolutionNotes"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Provide detailed notes on how this dispute was resolved..."
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  These notes will be sent to both the customer and provider.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResolveForm(false);
                    setResolutionNotes('');
                    setError('');
                  }}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
            <p>Created: {formatDate(dispute.dispute.createdAt)}</p>
            {dispute.dispute.resolvedAt && (
              <p>Resolved: {formatDate(dispute.dispute.resolvedAt)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



