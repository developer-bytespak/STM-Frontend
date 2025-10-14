'use client';

import { useState, useEffect } from 'react';
import { providerApi, JobDetailsResponse } from '@/api/provider';
import Link from 'next/link';

interface JobRequestCardProps {
  jobId: number;
  onJobUpdated?: () => void; // Callback to refresh parent component
}

export default function JobRequestCard({ jobId, onJobUpdated }: JobRequestCardProps) {
  const [jobDetails, setJobDetails] = useState<JobDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [negotiationData, setNegotiationData] = useState({
    editedPrice: '',
    editedSchedule: '',
    editedAnswers: {} as any,
    notes: ''
  });
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await providerApi.getJobDetails(jobId);
      setJobDetails(data);
    } catch (err: any) {
      console.error('Failed to fetch job details:', err);
      setError(err.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setResponding(true);
      setResponseMessage(null);
      await providerApi.respondToJob(jobId, 'accept');
      setResponseMessage({ type: 'success', text: 'Job accepted successfully! Waiting for customer to close the deal.' });
      setShowAcceptModal(false);
      
      // Refresh job details
      await fetchJobDetails();
      
      // Notify parent component
      if (onJobUpdated) {
        onJobUpdated();
      }
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setResponseMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to accept job:', err);
      setResponseMessage({ type: 'error', text: err.message || 'Failed to accept job' });
    } finally {
      setResponding(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setResponseMessage({ type: 'error', text: 'Please provide a rejection reason' });
      return;
    }

    try {
      setResponding(true);
      setResponseMessage(null);
      await providerApi.respondToJob(jobId, 'reject', { reason: rejectReason });
      setResponseMessage({ type: 'success', text: 'Job rejected successfully' });
      setShowRejectModal(false);
      
      // Refresh job details
      await fetchJobDetails();
      
      // Notify parent component
      if (onJobUpdated) {
        onJobUpdated();
      }
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setResponseMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to reject job:', err);
      setResponseMessage({ type: 'error', text: err.message || 'Failed to reject job' });
    } finally {
      setResponding(false);
    }
  };

  const handleNegotiate = async () => {
    if (!negotiationData.notes.trim()) {
      setResponseMessage({ type: 'error', text: 'Please provide negotiation notes' });
      return;
    }

    if (!negotiationData.editedPrice && !negotiationData.editedSchedule && Object.keys(negotiationData.editedAnswers).length === 0) {
      setResponseMessage({ type: 'error', text: 'Please propose at least one change (price, schedule, or details)' });
      return;
    }

    try {
      setResponding(true);
      setResponseMessage(null);
      
      const negotiation: any = {
        notes: negotiationData.notes
      };

      if (negotiationData.editedPrice) {
        negotiation.editedPrice = parseFloat(negotiationData.editedPrice);
      }

      if (negotiationData.editedSchedule) {
        negotiation.editedSchedule = negotiationData.editedSchedule;
      }

      if (Object.keys(negotiationData.editedAnswers).length > 0) {
        negotiation.editedAnswers = negotiationData.editedAnswers;
      }

      await providerApi.respondToJob(jobId, 'negotiate', { negotiation });
      setResponseMessage({ type: 'success', text: 'Changes proposed successfully! Waiting for customer approval.' });
      setShowNegotiateModal(false);
      
      // Refresh job details
      await fetchJobDetails();
      
      // Notify parent component
      if (onJobUpdated) {
        onJobUpdated();
      }
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setResponseMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to negotiate job:', err);
      setResponseMessage({ type: 'error', text: err.message || 'Failed to propose changes' });
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !jobDetails) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load job details</p>
          <button
            onClick={fetchJobDetails}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { job, customer, payment } = jobDetails;

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'rejected_by_sp':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{job.service}</h3>
            <p className="text-sm text-gray-500">{job.category}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
            {job.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDate(job.createdAt)}
        </div>
      </div>

      {/* Customer Info */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Customer Information</h4>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-gray-900 font-medium">{customer.name}</span>
          </div>
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-gray-600">{customer.phone}</span>
          </div>
          <div className="flex items-start text-sm">
            <svg className="w-4 h-4 mr-2 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-600">{customer.address}</span>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="text-lg font-bold text-green-600">${job.price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Location</p>
            <p className="text-sm text-gray-900">{job.location}</p>
          </div>
          {job.scheduledAt && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Scheduled For</p>
              <p className="text-sm text-gray-900">{formatDate(job.scheduledAt)}</p>
            </div>
          )}
          {job.responseDeadline && job.status === 'new' && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Response Deadline</p>
              <p className="text-sm text-red-600 font-medium">{formatDate(job.responseDeadline)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Info (if exists) */}
      {payment && (
        <div className="p-6 border-b border-gray-200 bg-green-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Amount</p>
              <p className="text-sm font-bold text-green-600">${payment.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p className="text-sm text-gray-900 font-medium">{payment.status}</p>
            </div>
            {payment.method && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Method</p>
                <p className="text-sm text-gray-900">{payment.method}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Response Message */}
      {responseMessage && (
        <div className={`mx-6 mt-6 p-4 rounded-lg ${
          responseMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            {responseMessage.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <p className="text-sm font-medium">{responseMessage.text}</p>
          </div>
        </div>
      )}

      {/* Job Status Indicators */}
      {job.spAccepted && (
        <div className="mx-6 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">✅ You have accepted this job. Waiting for customer to close the deal.</p>
        </div>
      )}
      
      {job.pendingApproval && (
        <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">⏳ Your proposed changes are pending customer approval.</p>
        </div>
      )}

      {/* Actions */}
      <div className="p-6">
        <div className="flex gap-3 mb-3">
          <Link
            href={`/provider/jobs/${jobId}`}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Details
          </Link>

          {jobDetails.chatId && (
            <Link
              href={`/provider/chat/${jobDetails.chatId}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              💬 Chat
            </Link>
          )}
        </div>
        
        {/* Response Actions - Only show if status is 'new' */}
        {job.status === 'new' && !job.spAccepted && !job.pendingApproval && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setShowAcceptModal(true)}
              disabled={responding}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✅ Accept
            </button>
            
            <button
              onClick={() => setShowNegotiateModal(true)}
              disabled={responding}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💡 Negotiate
            </button>
            
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={responding}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ❌ Reject
            </button>
          </div>
        )}
      </div>

      {/* Accept Confirmation Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Accept Job Request</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to accept this job? The customer will be notified and can then close the deal to start the job.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAcceptModal(false)}
                disabled={responding}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={responding}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {responding ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Accepting...
                  </>
                ) : (
                  'Confirm Accept'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Job Request</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this job. This will be shared with the customer.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 text-gray-900"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={responding}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={responding || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {responding ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Rejecting...
                  </>
                ) : (
                  'Confirm Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Negotiate Modal */}
      {showNegotiateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Propose Changes</h3>
            <p className="text-gray-600 mb-6">
              Suggest modifications to the job details. The customer will need to approve your changes.
            </p>
            
            <div className="space-y-4 mb-6">
              {/* Edited Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Propose New Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={negotiationData.editedPrice}
                    onChange={(e) => setNegotiationData({ ...negotiationData, editedPrice: e.target.value })}
                    placeholder={`Current: $${job.price.toFixed(2)}`}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                  />
                </div>
              </div>

              {/* Edited Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Propose New Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={negotiationData.editedSchedule}
                  onChange={(e) => setNegotiationData({ ...negotiationData, editedSchedule: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                />
                {job.scheduledAt && (
                  <p className="mt-1 text-xs text-gray-500">
                    Current: {formatDate(job.scheduledAt)}
                  </p>
                )}
              </div>

              {/* Notes - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Negotiation Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={negotiationData.notes}
                  onChange={(e) => setNegotiationData({ ...negotiationData, notes: e.target.value })}
                  placeholder="Explain your proposed changes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNegotiateModal(false);
                  setNegotiationData({ editedPrice: '', editedSchedule: '', editedAnswers: {}, notes: '' });
                }}
                disabled={responding}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleNegotiate}
                disabled={responding || !negotiationData.notes.trim()}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {responding ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Proposing...
                  </>
                ) : (
                  'Propose Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

