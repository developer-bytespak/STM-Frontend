'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { customerApi, CustomerJobDetails } from '@/api/customer';
import Link from 'next/link';
import { useChat } from '@/contexts/ChatContext';
import DetailPageSkeleton from '@/components/ui/DetailPageSkeleton';
import { useAlert } from '@/hooks/useAlert';

interface BookingDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookingDetails({ params }: BookingDetailsProps) {
  const { openConversationByJobId } = useChat();
  const { showAlert, AlertComponent } = useAlert();
  const router = useRouter();
  const resolvedParams = use(params);
  const jobId = parseInt(resolvedParams.id);
  
  const [jobDetails, setJobDetails] = useState<CustomerJobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  // TODO: Re-enable cancel and reassign functionality when needed
  // const [showCancelModal, setShowCancelModal] = useState(false);
  // const [showReassignModal, setShowReassignModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  // const [cancelReason, setCancelReason] = useState('');
  // const [reassignReason, setReassignReason] = useState('');
  // const [newProviderId, setNewProviderId] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [pendingAIChat, setPendingAIChat] = useState<any>(null);
  const [feedback, setFeedback] = useState({
    rating: 5,
    feedback: '',
    punctualityRating: 5,
    responseTime: 0,
  });

  // Prevent background scroll when modals are open
  useEffect(() => {
    if (showFeedbackModal || showSupportModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFeedbackModal, showSupportModal]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await customerApi.getJobDetails(jobId);
        setJobDetails(data);
        
        // Check for pending AI chat after payment
        const pendingChat = sessionStorage.getItem('pendingAIChat');
        if (pendingChat) {
          const chatData = JSON.parse(pendingChat);
          // Check if this is the job that was blocking the chat
          if (data.job.status !== 'pending' || data.job.id !== jobId) {
            setPendingAIChat(chatData);
          }
        }
      } catch (err: any) {
        console.error('Error fetching job details:', err);
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  // TODO: Re-enable cancel functionality when needed
  // const handleCancelJob = async () => {
  //   if (!cancelReason.trim()) {
  //     showAlert({
  //       title: 'Validation Error',
  //       message: 'Please provide a reason for cancellation',
  //       type: 'warning'
  //     });
  //     return;
  //   }

  //   try {
  //     setActionLoading(true);
  //     const result = await customerApi.performJobAction(jobId, {
  //       action: 'cancel',
  //       cancellationReason: cancelReason,
  //     });
      
  //     const feeMessage = result.cancellationFee && result.cancellationFee > 0 
  //       ? `\n\nCancellation fee: $${result.cancellationFee}` 
  //       : '';
      
  //     showAlert({
  //       title: 'Job Cancelled',
  //       message: (result.message || 'Job cancelled successfully') + feeMessage,
  //       type: 'success'
  //     });
  //     setShowCancelModal(false);
  //     // Refresh job details
  //     const data = await customerApi.getJobDetails(jobId);
  //     setJobDetails(data);
  //   } catch (err: any) {
  //     showAlert({
  //       title: 'Error',
  //       message: err.message || 'Failed to cancel job',
  //       type: 'error'
  //     });
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  const handleApproveEdits = async () => {
    try {
      setActionLoading(true);
      const result = await customerApi.performJobAction(jobId, {
        action: 'approve_edits',
      });
      
      showAlert({
        title: 'Success',
        message: result.message || 'Edits approved successfully',
        type: 'success'
      });
      // Refresh job details
      const data = await customerApi.getJobDetails(jobId);
      setJobDetails(data);
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: err.message || 'Failed to approve edits',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseDeal = async () => {
    try {
      setActionLoading(true);
      const result = await customerApi.performJobAction(jobId, {
        action: 'close_deal',
      });
      
      showAlert({
        title: 'Success',
        message: result.message || 'Deal closed successfully',
        type: 'success'
      });
      // Refresh job details
      const data = await customerApi.getJobDetails(jobId);
      setJobDetails(data);
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: err.message || 'Failed to close deal',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // TODO: Re-enable reassign functionality when needed
  // const handleReassignJob = async () => {
  //   if (!newProviderId.trim() || !reassignReason.trim()) {
  //     showAlert({
  //       title: 'Validation Error',
  //       message: 'Please provide both provider ID and reason',
  //       type: 'warning'
  //     });
  //     return;
  //   }

  //   try {
  //     setActionLoading(true);
  //     await customerApi.reassignJob(jobId, {
  //       newProviderId: parseInt(newProviderId),
  //       reason: reassignReason,
  //     });
      
  //     showAlert({
  //       title: 'Success',
  //       message: 'Job reassigned successfully',
  //       type: 'success'
  //     });
  //     setShowReassignModal(false);
  //     // Refresh job details
  //     const data = await customerApi.getJobDetails(jobId);
  //     setJobDetails(data);
  //   } catch (err: any) {
  //     showAlert({
  //       title: 'Error',
  //       message: err.message || 'Failed to reassign job',
  //       type: 'error'
  //     });
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  const handleSubmitFeedback = async () => {
    if (!feedback.feedback.trim()) {
      showAlert({
        title: 'Validation Error',
        message: 'Please provide feedback comments',
        type: 'warning'
      });
      return;
    }

    try {
      setActionLoading(true);
      await customerApi.submitFeedback(jobId, {
        rating: feedback.rating,
        feedback: feedback.feedback,
        punctualityRating: feedback.punctualityRating,
        responseTime: feedback.responseTime > 0 ? feedback.responseTime : undefined,
      });
      
      showAlert({
        title: 'Success',
        message: 'Feedback submitted successfully',
        type: 'success'
      });
      setFeedbackSubmitted(true); // Track that feedback was submitted
      setShowFeedbackModal(false);
      // Refresh job details
      const data = await customerApi.getJobDetails(jobId);
      setJobDetails(data);
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: err.message || 'Failed to submit feedback',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenChat = () => {
    const chatOpened = openConversationByJobId(jobId);
    if (!chatOpened) {
      showAlert({
        title: 'Chat Unavailable',
        message: 'Chat is currently only available for newly created bookings. Full chat integration with existing jobs is coming soon!',
        type: 'info'
      });
    }
  };

  // Helper function to format field names
  const formatFieldName = (key: string): string => {
    // Convert camelCase to Title Case with spaces
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  // Helper function to render job details in a formatted way
  const renderJobDetails = (answers: any) => {
    if (!answers || typeof answers !== 'object') return null;

    return (
      <div className="space-y-3">
        {Object.entries(answers)
          .filter(([key]) => key !== 'budget') // TODO: Re-enable budget display when budget field is restored
          .map(([key, value]) => (
          <div key={key} className="flex flex-col sm:flex-row sm:items-start border-b border-gray-100 pb-3 last:border-0">
            <div className="font-medium text-gray-700 sm:w-1/3 mb-1 sm:mb-0">
              {formatFieldName(key)}:
            </div>
            <div className="text-gray-900 sm:w-2/3">
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : value?.toString() || 'N/A'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      'new': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'New' },
      'in_progress': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'In Progress' },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      'paid': { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      'rejected_by_sp': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Rejected' },
    };
    
    const config = statusConfig[status] || statusConfig['new'];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="py-8">
        <DetailPageSkeleton />
      </div>
    );
  }

  if (error || !jobDetails) {
    return (
      <div className="py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto">
          <p className="font-semibold">Error Loading Job</p>
          <p className="text-sm mt-1">{error || 'Job not found'}</p>
          <Link href="/customer/bookings" className="text-sm text-red-600 hover:text-red-800 underline mt-2 inline-block">
            ← Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const { job, provider, payment, actions } = jobDetails;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5">
        <div>
          <div className="flex items-center gap-2 text-sm mb-2">
            <button
              onClick={() => router.back()}
              className="flex items-center text-navy-600 hover:text-navy-700 transition-colors mr-2"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
          <p className="text-gray-600 mt-1">Job ID: #{job.id}</p>
        </div>
        {getStatusBadge(job.status)}
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.service}</h2>
            <p className="text-sm text-gray-600 mb-4">Category: {job.category}</p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="font-semibold">Provider:</span> {provider.businessName}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Owner:</span> {provider.ownerName}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Phone:</span> {provider.phone}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Rating:</span> ⭐ {provider.rating}/5
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Location:</span> {job.location}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-right md:text-left">
              <p className="text-3xl font-bold text-navy-600">${job.price}</p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="font-semibold">Created:</span> {new Date(job.createdAt).toLocaleDateString()} at {new Date(job.createdAt).toLocaleTimeString()}
              </p>
              {job.scheduledAt && (
                <p className="text-gray-700">
                  <span className="font-semibold">Scheduled:</span> {new Date(job.scheduledAt).toLocaleDateString()} at {new Date(job.scheduledAt).toLocaleTimeString()}
                </p>
              )}
              {job.completedAt && (
                <p className="text-gray-700">
                  <span className="font-semibold">Completed:</span> {new Date(job.completedAt).toLocaleDateString()} at {new Date(job.completedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
            
            {/* Status Indicators */}
            <div className="space-y-1">
              {job.spAccepted && (
                <p className="text-sm text-green-600 font-medium">✓ Provider accepted this job</p>
              )}
              {job.pendingApproval && (
                <p className="text-sm text-yellow-600 font-medium">⚠ Changes pending your approval</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Info */}
        {payment && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-lg font-bold text-gray-900">${payment.amount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{payment.status}</p>
              </div>
              {payment.method && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Method</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{payment.method}</p>
                </div>
              )}
              {payment.markedAt && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Paid At</p>
                  <p className="text-lg font-bold text-gray-900">{new Date(payment.markedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Job Details */}
        {job.originalAnswers && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Job Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {renderJobDetails(job.originalAnswers)}
            </div>
          </div>
        )}

        {/* Edited Answers */}
        {job.editedAnswers && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-yellow-700 mb-4">⚠ Proposed Changes by Provider</h3>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              {renderJobDetails(job.editedAnswers)}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.canApproveEdits && (
            <button
              onClick={handleApproveEdits}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 cursor-pointer"
            >
              Approve Changes
            </button>
          )}

          {actions.canCloseDeal && (
            <button
              onClick={handleCloseDeal}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 cursor-pointer"
            >
              Close Deal & Start Job
            </button>
          )}

          {pendingAIChat && (
            <button
              onClick={() => {
                sessionStorage.removeItem('pendingAIChat');
                window.location.href = `/${pendingAIChat.providerSlug}?from_ai=true&session_id=${pendingAIChat.aiSessionId}`;
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Complete Booking & Open Chat
            </button>
          )}

          <button
            onClick={handleOpenChat}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Open Chat
          </button>

          <button
            onClick={() => setShowSupportModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Customer Support
          </button>

          {/* TODO: Re-enable cancel functionality when needed */}
          {/* {actions.canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 cursor-pointer"
            >
              Cancel Job
            </button>
          )} */}

          {actions.canGiveFeedback && !feedbackSubmitted && (
            <button
              onClick={() => setShowFeedbackModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-gray-400 cursor-pointer"
            >
              Leave Feedback
            </button>
          )}

          {feedbackSubmitted && (
            <div className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Feedback Submitted
            </div>
          )}

          {/* TODO: Re-enable reassign functionality when needed */}
          {/* {(job.status === 'new' || job.status === 'rejected_by_sp') && (
            <button
              onClick={() => setShowReassignModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
            >
              Reassign to Other Provider
            </button>
          )} */}
        </div>
      </div>

      {/* TODO: Re-enable cancel modal when needed */}
      {/* Cancel Modal */}
      {/* {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Job</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for cancellation:</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              placeholder="Reason for cancellation..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Note: Cancellation fees may apply based on timing.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCancelJob}
                disabled={actionLoading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={actionLoading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* TODO: Re-enable reassign modal when needed */}
      {/* Reassign Modal */}
      {/* {showReassignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reassign Job</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Provider ID
                </label>
                <input
                  type="number"
                  value={newProviderId}
                  onChange={(e) => setNewProviderId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="Enter provider ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Reassignment
                </label>
                <textarea
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="Reason for reassignment..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReassignJob}
                disabled={actionLoading}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
              >
                {actionLoading ? 'Reassigning...' : 'Reassign'}
              </button>
              <button
                onClick={() => setShowReassignModal(false)}
                disabled={actionLoading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Customer Support Modal */}
      {showSupportModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Customer Support</h3>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-2">Need help? Call our support team:</p>
              <a
                href="tel:+18005551234"
                className="text-3xl font-bold text-navy-600 hover:text-navy-700"
              >
                1-800-555-1234
              </a>
              <p className="text-sm text-gray-500 mt-4">Available 24/7</p>
            </div>
            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Leave Feedback</h3>
            <div className="space-y-6">
              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                      className="text-3xl hover:scale-110 transition-transform"
                    >
                      {star <= feedback.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 self-center">
                    {feedback.rating} / 5
                  </span>
                </div>
              </div>

              {/* Punctuality Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Punctuality Rating <span className="text-gray-400">(Optional)</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">How punctual was the provider?</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedback({ ...feedback, punctualityRating: star })}
                      className="text-3xl hover:scale-110 transition-transform"
                    >
                      {star <= feedback.punctualityRating ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 self-center">
                    {feedback.punctualityRating} / 5
                  </span>
                </div>
              </div>

              {/* Response Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Time <span className="text-gray-400">(Optional)</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">How long did it take for the provider to respond?</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={feedback.responseTime}
                    onChange={(e) => setFeedback({ ...feedback, responseTime: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="0"
                  />
                  <span className="text-sm text-gray-600">minutes</span>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={feedback.feedback}
                  onChange={(e) => setFeedback({ ...feedback, feedback: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="Share your experience in detail..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmitFeedback}
                disabled={actionLoading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
              >
                {actionLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button
                onClick={() => setShowFeedbackModal(false)}
                disabled={actionLoading}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertComponent />
    </div>
  );
}
