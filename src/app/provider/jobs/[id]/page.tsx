'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { providerApi, JobDetailsResponse } from '@/api/provider';
import { useChat } from '@/contexts/ChatContext';
import ChatPopup from '@/components/chat/ChatPopup';
import DetailPageSkeleton from '@/components/ui/DetailPageSkeleton';

interface JobDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export default function JobDetails({ params }: JobDetailsProps) {
  const router = useRouter();
  const { openConversation } = useChat();
  const resolvedParams = use(params);
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

  const jobId = parseInt(resolvedParams.id);

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
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setResponseMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to negotiate job:', err);
      setResponseMessage({ type: 'error', text: err.message || 'Failed to propose changes' });
    } finally {
      setResponding(false);
    }
  };

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOpenChat = () => {
    if (!jobDetails) return;
    
    // Check if chat exists
    if (!jobDetails.chatId) {
      alert('No chat available for this job. Chat is created when the job is created.');
      return;
    }
    
    // Open existing chat conversation
    openConversation(String(jobDetails.chatId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <DetailPageSkeleton />
        </div>
      </div>
    );
  }

  if (error || !jobDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Job Details</h3>
            <p className="text-gray-600 mb-4">{error || 'Job not found'}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchJobDetails}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { job, customer, payment } = jobDetails;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.service}</h1>
                <p className="text-gray-600">Job ID: #{job.id}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
              {job.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Response Message */}
        {responseMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
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
              <p className="font-medium">{responseMessage.text}</p>
            </div>
          </div>
        )}

        {/* Job Status Indicators */}
        {job.pendingApproval && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">⏳ Your proposed changes are pending customer approval.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{customer.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="font-medium text-gray-900">{customer.address}</p>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Service</p>
                    <p className="font-medium text-gray-900">{job.service}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Category</p>
                    <p className="font-medium text-gray-900">{job.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-2xl font-bold text-green-600">${job.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="font-medium text-gray-900">{job.location}</p>
                  </div>
                </div>

                {job.scheduledAt && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Scheduled For</p>
                    <p className="font-medium text-gray-900">{formatDate(job.scheduledAt)}</p>
                  </div>
                )}

                {job.responseDeadline && job.status === 'new' && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Response Deadline</p>
                    <p className="font-medium text-red-600">{formatDate(job.responseDeadline)}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-1">Created At</p>
                  <p className="font-medium text-gray-900">{formatDate(job.createdAt)}</p>
                </div>

                {job.completedAt && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Completed At</p>
                    <p className="font-medium text-gray-900">{formatDate(job.completedAt)}</p>
                  </div>
                )}

                {job.paidAt && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Paid At</p>
                    <p className="font-medium text-gray-900">{formatDate(job.paidAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            {payment && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Amount</p>
                    <p className="text-xl font-bold text-green-600">${payment.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <p className="font-medium text-gray-900">{payment.status}</p>
                  </div>
                  {payment.method && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Method</p>
                      <p className="font-medium text-gray-900">{payment.method}</p>
                    </div>
                  )}
                  {payment.markedAt && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Marked At</p>
                      <p className="font-medium text-gray-900">{formatDate(payment.markedAt)}</p>
                    </div>
                  )}
                  {payment.notes && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Notes</p>
                      <p className="font-medium text-gray-900">{payment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Job Questions & Answers */}
            {job.originalAnswers && Object.keys(job.originalAnswers).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Requirements</h2>
                <div className="space-y-3">
                  {Object.entries(job.originalAnswers).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 pb-3 last:border-b-0">
                      <p className="text-sm font-medium text-gray-700 mb-1">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                      <p className="text-gray-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Edited Answers (if any) */}
            {job.editedAnswers && Object.keys(job.editedAnswers).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Proposed Changes</h2>
                <div className="space-y-3">
                  {Object.entries(job.editedAnswers).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 pb-3 last:border-b-0">
                      <p className="text-sm font-medium text-gray-700 mb-1">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                      <p className="text-gray-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleOpenChat}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  💬 Chat with Customer
                </button>

                {/* Response Actions - Only show if status is 'new' */}
                {job.status === 'new' && !job.spAccepted && !job.pendingApproval && (
                  <>
                    <button
                      onClick={() => setShowAcceptModal(true)}
                      disabled={responding}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      ✅ Accept Job
                    </button>
                    
                    <button
                      onClick={() => setShowNegotiateModal(true)}
                      disabled={responding}
                      className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      💡 Propose Changes
                    </button>
                    
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={responding}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      ❌ Reject Job
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Job Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Job Created</p>
                    <p className="text-xs text-gray-500">{formatDate(job.createdAt)}</p>
                  </div>
                </div>
                
                {job.scheduledAt && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Scheduled</p>
                      <p className="text-xs text-gray-500">{formatDate(job.scheduledAt)}</p>
                    </div>
                  </div>
                )}

                {job.completedAt && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Completed</p>
                      <p className="text-xs text-gray-500">{formatDate(job.completedAt)}</p>
                    </div>
                  </div>
                )}

                {job.paidAt && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Paid</p>
                      <p className="text-xs text-gray-500">{formatDate(job.paidAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
      
      {/* Chat Popup */}
      <ChatPopup />
    </div>
  );
}