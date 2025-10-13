'use client';

import React, { useEffect, useState } from 'react';
import { providerApi, JobRequestResponse, RespondJobDto } from '@/api/provider';

interface JobRequestCardProps {
  jobId: number;
  className?: string;
}

export default function JobRequestCard({ jobId, className = '' }: JobRequestCardProps) {
  const [jobData, setJobData] = useState<JobRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);
  const [showNegotiationForm, setShowNegotiationForm] = useState(false);
  const [negotiationData, setNegotiationData] = useState({
    editedPrice: '',
    editedSchedule: '',
    notes: '',
    editedAnswers: {} as any
  });

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const data = await providerApi.getJobRequestDetails(jobId);
        setJobData(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch job details:', err);
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleRespond = async (action: 'accept' | 'reject' | 'negotiate', reason?: string) => {
    if (!jobData) return;

    try {
      setResponding(true);
      
      let dto: RespondJobDto;
      
      if (action === 'accept') {
        dto = { action: 'accept' };
      } else if (action === 'reject') {
        if (!reason?.trim()) {
          alert('Please provide a reason for rejection');
          return;
        }
        dto = { action: 'reject', reason: reason.trim() };
      } else {
        // negotiate
        if (!negotiationData.notes.trim()) {
          alert('Please provide negotiation notes');
          return;
        }
        dto = {
          action: 'negotiate',
          negotiation: {
            editedPrice: negotiationData.editedPrice ? parseFloat(negotiationData.editedPrice) : undefined,
            editedSchedule: negotiationData.editedSchedule || undefined,
            notes: negotiationData.notes.trim(),
            editedAnswers: Object.keys(negotiationData.editedAnswers).length > 0 ? negotiationData.editedAnswers : undefined
          }
        };
      }

      const response = await providerApi.respondToJob(jobId, dto);
      
      // Show success message
      alert(response.message);
      
      // Refresh job data
      const updatedData = await providerApi.getJobRequestDetails(jobId);
      setJobData(updatedData);
      
      // Reset forms
      setShowNegotiationForm(false);
      setNegotiationData({
        editedPrice: '',
        editedSchedule: '',
        notes: '',
        editedAnswers: {}
      });
      
    } catch (err: any) {
      console.error('Failed to respond to job:', err);
      alert(err.message || 'Failed to respond to job');
    } finally {
      setResponding(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!jobData) return null;

  const { job, customer, payment } = jobData;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{job.service}</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="bg-gray-100 px-3 py-1 rounded-full">{job.category}</span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-navy-600">${job.price}</div>
          <div className="text-sm text-gray-500">Customers Budget</div>
        </div>
      </div>

      {/* Status Indicators */}
      {(job.spAccepted || job.pendingApproval) && (
        <div className="mb-6">
          {job.spAccepted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-800 font-medium">You have accepted this job request</span>
              </div>
            </div>
          )}
          {job.pendingApproval && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-yellow-800 font-medium">Waiting for customer approval on your proposed changes</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Information */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">{customer.name}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-start text-gray-700 md:col-span-2">
            <svg className="w-4 h-4 mr-2 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{customer.address}</span>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Job Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Created:</span>
            <span className="font-medium">{formatDate(job.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Scheduled:</span>
            <span className="font-medium">{formatDate(job.scheduledAt)}</span>
          </div>
          {job.responseDeadline && (
            <div className="flex justify-between">
              <span className="text-gray-600">Response Deadline:</span>
              <span className="font-medium text-red-600">{formatDate(job.responseDeadline)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Customer Answers */}
      {job.originalAnswers && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Customer Requirements</h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(job.originalAnswers, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Proposed Changes */}
      {job.editedAnswers && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Your Proposed Changes</h3>
          <div className="bg-yellow-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(job.editedAnswers, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Negotiation Form */}
      {showNegotiationForm && (
        <div className="mb-6 bg-yellow-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Propose Changes</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Price (optional)</label>
              <input
                type="number"
                value={negotiationData.editedPrice}
                onChange={(e) => setNegotiationData({ ...negotiationData, editedPrice: e.target.value })}
                placeholder="Enter new price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Schedule (optional)</label>
              <input
                type="text"
                value={negotiationData.editedSchedule}
                onChange={(e) => setNegotiationData({ ...negotiationData, editedSchedule: e.target.value })}
                placeholder="e.g., Next Monday at 2 PM"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-red-500">*</span></label>
              <textarea
                value={negotiationData.notes}
                onChange={(e) => setNegotiationData({ ...negotiationData, notes: e.target.value })}
                placeholder="Explain the proposed changes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {job.status === 'new' && !job.spAccepted && !job.pendingApproval && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <button
              onClick={() => handleRespond('accept')}
              disabled={responding}
              className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400"
            >
              {responding ? 'Processing...' : 'Accept Job'}
            </button>
            <button
              onClick={() => setShowNegotiationForm(!showNegotiationForm)}
              disabled={responding}
              className="flex-1 bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:bg-gray-400"
            >
              {showNegotiationForm ? 'Cancel' : 'Propose Changes'}
            </button>
            <button
              onClick={() => {
                const reason = prompt('Please provide a reason for rejecting this job:');
                if (reason) {
                  handleRespond('reject', reason);
                }
              }}
              disabled={responding}
              className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-400"
            >
              Reject Job
            </button>
          </div>
          
          {showNegotiationForm && (
            <button
              onClick={() => handleRespond('negotiate')}
              disabled={responding || !negotiationData.notes.trim()}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400"
            >
              {responding ? 'Processing...' : 'Submit Proposed Changes'}
            </button>
          )}
        </div>
      )}

      {/* Payment Information */}
      {payment && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Payment Information</h3>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium ml-2">${payment.amount}</span>
              </div>
              <div>
                <span className="text-gray-600">Method:</span>
                <span className="font-medium ml-2">{payment.method}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ml-2 ${
                  payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {payment.status}
                </span>
              </div>
              {payment.markedAt && (
                <div>
                  <span className="text-gray-600">Marked:</span>
                  <span className="font-medium ml-2">{formatDate(payment.markedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
