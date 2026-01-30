'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { providerApi, JobDetailsResponse } from '@/api/provider';
import { useChat } from '@/contexts/ChatContext';
import Link from 'next/link';
import ChatPopup from '@/components/chat/ChatPopup';

interface JobRequestCardProps {
  jobId: number;
  onJobUpdated?: () => void; // Callback to refresh parent component
}

export default function JobRequestCard({ jobId, onJobUpdated }: JobRequestCardProps) {
  const { createConversation } = useChat();
  const queryClient = useQueryClient();
  const [responding, setResponding] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rejectReason, setRejectReason] = useState('');
  const [negotiationData, setNegotiationData] = useState({
    editedPrice: '',
    editedSchedule: '',
    editedAnswers: {} as any,
    notes: ''
  });
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Use React Query to fetch and cache job details
  const { data: jobDetails, isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['jobDetails', jobId],
    queryFn: () => providerApi.getJobDetails(jobId),
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
  });

  const error = queryError ? (queryError as Error).message || 'Failed to load job details' : null;

  const fetchJobDetails = async () => {
    queryClient.invalidateQueries({ queryKey: ['jobDetails', jobId] });
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

  const handleOpenChat = () => {
    if (!jobDetails) return;
    
    // Check if chat exists
    if (!jobDetails.chatId) {
      alert('No chat available for this job. Chat is created when the job is created.');
      return;
    }
    
    // Create conversation with job context
    const formData = {
      serviceType: jobDetails.job.service,
      description: `${jobDetails.job.category} - ${jobDetails.job.location}`,
      budget: `$${jobDetails.job.price.toFixed(2)}`,
      additionalDetails: `Job ID: ${jobDetails.job.id}\nCustomer: ${jobDetails.customer.name}\nPhone: ${jobDetails.customer.phone}\nAddress: ${jobDetails.customer.address}`
    };
    
    createConversation(
      `provider-${jobDetails.job.id}`, // providerId
      'You', // providerName (current user)
      formData,
      jobDetails.job.id, // jobId
      String(jobDetails.chatId) // ✅ chatId from backend
    );
  };

  const openImageGallery = (index: number = 0) => {
    setCurrentImageIndex(index);
    setImageGalleryOpen(true);
  };

  const closeImageGallery = () => {
    setImageGalleryOpen(false);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (!jobDetails?.job.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % jobDetails.job.images!.length);
  };

  const previousImage = () => {
    if (!jobDetails?.job.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + jobDetails.job.images!.length) % jobDetails.job.images!.length);
  };

  const downloadImage = async () => {
    if (!jobDetails?.job.images) return;
    try {
      const imageUrl = jobDetails.job.images[currentImageIndex];
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `job-${jobId}-image-${currentImageIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
      // Fallback: open in new tab
      if (jobDetails?.job.images) {
        window.open(jobDetails.job.images[currentImageIndex], '_blank');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{job.service}</h3>
            <p className="text-sm text-gray-500">{job.category}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
            {job.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDate(job.createdAt)}
        </div>

        {/* Essential Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-gray-900 font-medium">{customer.name}</span>
          </div>
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-600 truncate">{job.location}</span>
          </div>
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="text-green-600 font-bold text-lg">${job.price.toFixed(2)}</span>
          </div>
          {job.responseDeadline && job.status === 'new' && (
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-600 font-medium">Deadline: {new Date(job.responseDeadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

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
      {job.pendingApproval && (
        <div className="mx-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">⏳ Your proposed changes are pending customer approval.</p>
        </div>
      )}

      {/* Actions */}
      <div className="p-6">
        <div className="flex gap-3">
          <Link
            href={`/provider/jobs/${jobId}`}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Details
          </Link>

          {job.images && job.images.length > 0 && (
            <button
              onClick={() => openImageGallery(0)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
              title="View uploaded images"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {job.images.length}
            </button>
          )}

          <button
            onClick={handleOpenChat}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            title="Open chat with customer"
          >
            💬
          </button>
        </div>
        
        {/* Quick Actions - Only show if status is 'new' */}
        {job.status === 'new' && !job.spAccepted && !job.pendingApproval && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setShowAcceptModal(true)}
              disabled={responding}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Accept
            </button>
            
            <button
              onClick={() => setShowNegotiateModal(true)}
              disabled={responding}
              className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Negotiate
            </button>
            
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={responding}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Accept Confirmation Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
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
      
      {/* Image Gallery Lightbox */}
      {imageGalleryOpen && jobDetails?.job.images && jobDetails.job.images.length > 0 && (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeImageGallery}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 cursor-pointer"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {currentImageIndex + 1} / {jobDetails.job.images.length}
          </div>

          {/* Previous button */}
          {jobDetails.job.images.length > 1 && (
            <button
              onClick={previousImage}
              className="absolute left-4 text-white hover:text-gray-300 cursor-pointer"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Main image */}
          <div className="max-w-7xl max-h-screen w-full h-full flex items-center justify-center p-4">
            <img 
              src={jobDetails.job.images[currentImageIndex]} 
              alt={`Job image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23333"/%3E%3Ctext x="200" y="200" font-family="Arial" font-size="20" fill="%23fff" text-anchor="middle" dominant-baseline="middle"%3EImage Error%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>

          {/* Next button */}
          {jobDetails.job.images.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 text-white hover:text-gray-300 cursor-pointer"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Thumbnail strip at bottom */}
          {jobDetails.job.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg max-w-full overflow-x-auto">
              {jobDetails.job.images.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-16 h-16 rounded cursor-pointer overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === currentImageIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={url} 
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Download button */}
          <button
            onClick={downloadImage}
            className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      )}
      
      {/* Chat Popup */}
      <ChatPopup />
    </div>
  );
}

