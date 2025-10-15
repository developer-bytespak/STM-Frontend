'use client';

import { use, useState, useEffect } from 'react';
import { customerApi, CustomerJobDetails } from '@/api/customer';
import Link from 'next/link';
import { useChat } from '@/contexts/ChatContext';

interface BookingDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookingDetails({ params }: BookingDetailsProps) {
  const { openConversationByJobId } = useChat();
  const resolvedParams = use(params);
  const jobId = parseInt(resolvedParams.id);
  
  const [jobDetails, setJobDetails] = useState<CustomerJobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [newProviderId, setNewProviderId] = useState('');
  const [feedback, setFeedback] = useState({
    rating: 5,
    feedback: '',
  });

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await customerApi.getJobDetails(jobId);
        setJobDetails(data);
      } catch (err: any) {
        console.error('Error fetching job details:', err);
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleCancelJob = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      setActionLoading(true);
      const result = await customerApi.performJobAction(jobId, {
        action: 'cancel',
        cancellationReason: cancelReason,
      });
      
      alert(result.message || 'Job cancelled successfully');
      if (result.cancellationFee && result.cancellationFee > 0) {
        alert(`Cancellation fee: $${result.cancellationFee}`);
      }
      setShowCancelModal(false);
      // Refresh job details
      const data = await customerApi.getJobDetails(jobId);
      setJobDetails(data);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel job');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveEdits = async () => {
    try {
      setActionLoading(true);
      const result = await customerApi.performJobAction(jobId, {
        action: 'approve_edits',
      });
      
      alert(result.message || 'Edits approved successfully');
      // Refresh job details
      const data = await customerApi.getJobDetails(jobId);
      setJobDetails(data);
    } catch (err: any) {
      alert(err.message || 'Failed to approve edits');
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
      
      alert(result.message || 'Deal closed successfully');
      // Refresh job details
      const data = await customerApi.getJobDetails(jobId);
      setJobDetails(data);
    } catch (err: any) {
      alert(err.message || 'Failed to close deal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReassignJob = async () => {
    if (!newProviderId.trim() || !reassignReason.trim()) {
      alert('Please provide both provider ID and reason');
      return;
    }

    try {
      setActionLoading(true);
      await customerApi.reassignJob(jobId, {
        newProviderId: parseInt(newProviderId),
        reason: reassignReason,
      });
      
      alert('Job reassigned successfully');
      setShowReassignModal(false);
      // Refresh job details
      const data = await customerApi.getJobDetails(jobId);
      setJobDetails(data);
    } catch (err: any) {
      alert(err.message || 'Failed to reassign job');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.feedback.trim()) {
      alert('Please provide feedback comments');
      return;
    }

    try {
      setActionLoading(true);
      await customerApi.submitFeedback(jobId, {
        rating: feedback.rating,
        feedback: feedback.feedback,
      });
      
      alert('Feedback submitted successfully');
      setShowFeedbackModal(false);
      // Refresh job details
      const data = await customerApi.getJobDetails(jobId);
      setJobDetails(data);
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenChat = () => {
    const chatOpened = openConversationByJobId(jobId);
    if (!chatOpened) {
      alert('Chat not available for this job yet. Chat is currently only available for newly created bookings. Full chat integration with existing jobs is coming soon!');
    }
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
      <div className="py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm mb-2">
            <Link href="/customer/dashboard" className="text-navy-600 hover:text-navy-700">
              Dashboard
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/customer/bookings" className="text-navy-600 hover:text-navy-700">
              Bookings
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Job #{job.id}</span>
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
            <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Amount</p>
                <p className="font-semibold">${payment.amount}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-semibold capitalize">{payment.status}</p>
              </div>
              {payment.method && (
                <div>
                  <p className="text-gray-600">Method</p>
                  <p className="font-semibold capitalize">{payment.method}</p>
                </div>
              )}
              {payment.markedAt && (
                <div>
                  <p className="text-gray-600">Paid At</p>
                  <p className="font-semibold">{new Date(payment.markedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Job Details */}
        {job.originalAnswers && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Job Details</h3>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(job.originalAnswers, null, 2)}
            </pre>
          </div>
        )}

        {/* Edited Answers */}
        {job.editedAnswers && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-yellow-700 mb-2">⚠ Proposed Changes by Provider</h3>
            <pre className="bg-yellow-50 p-4 rounded-lg text-sm overflow-auto border border-yellow-200">
              {JSON.stringify(job.editedAnswers, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
          <button
            onClick={handleOpenChat}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Open Chat with Provider
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.canApproveEdits && (
            <button
              onClick={handleApproveEdits}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              Approve Changes
            </button>
          )}

          {actions.canCloseDeal && (
            <button
              onClick={handleCloseDeal}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              Close Deal & Start Job
            </button>
          )}

          {actions.canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
            >
              Cancel Job
            </button>
          )}

          {actions.canGiveFeedback && (
            <button
              onClick={() => setShowFeedbackModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-gray-400"
            >
              Leave Feedback
            </button>
          )}

          {(job.status === 'new' || job.status === 'rejected_by_sp') && (
            <button
              onClick={() => setShowReassignModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
            >
              Reassign to Other Provider
            </button>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
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
      )}

      {/* Reassign Modal */}
      {showReassignModal && (
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
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Leave Feedback</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                      className="text-3xl"
                    >
                      {star <= feedback.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={feedback.feedback}
                  onChange={(e) => setFeedback({ ...feedback, feedback: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                  placeholder="Share your experience..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmitFeedback}
                disabled={actionLoading}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {actionLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button
                onClick={() => setShowFeedbackModal(false)}
                disabled={actionLoading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
