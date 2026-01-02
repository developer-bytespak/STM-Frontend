'use client';

import { useState, useEffect } from 'react';
import { lsmApi, ProviderDetailResponse } from '@/api/lsm';

interface ProviderDetailModalProps {
  providerId: number;
  onClose: () => void;
}

export default function ProviderDetailModal({ 
  providerId, 
  onClose 
}: ProviderDetailModalProps) {
  const [data, setData] = useState<ProviderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProviderDetails();
  }, [providerId]);

  const fetchProviderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await lsmApi.getProviderDetails(providerId);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provider details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'banned':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDocStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header Skeleton */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>

          {/* Modal Content Skeleton */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
            {/* Provider Info Section */}
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services Section */}
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded-full w-24"></div>
                ))}
              </div>
            </div>

            {/* Documents Section */}
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center flex-1">
                      <div className="w-8 h-8 bg-gray-200 rounded mr-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-40"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-28 mb-4"></div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <p className="text-red-600 mb-4">{error || 'Failed to load data'}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Close
            </button>
            <button onClick={fetchProviderDetails} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.provider.businessName}</h2>
            <div className="flex items-center gap-3">
              <span className={'px-3 py-1 rounded-full text-xs font-medium ' + getStatusColor(data.provider.status)}>
                {data.provider.status.toUpperCase()}
              </span>
              <div className="flex items-center gap-1">
                {renderStars(Math.round(data.provider.rating))}
                <span className="text-sm font-semibold text-gray-700 ml-1">
                  {data.provider.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Contact Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-700">{data.provider.user.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{data.provider.user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{data.provider.user.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">{data.provider.location}</span>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-3">Account Information</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Experience:</span> {data.provider.experience} years ({data.provider.experienceLevel})
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Total Jobs:</span> {data.provider.totalJobs}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Earnings:</span> ${data.provider.earnings.toFixed(2)}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Warnings:</span> {data.provider.warnings}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Joined:</span> {formatDate(data.provider.user.joinedAt)}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Last Login:</span> {formatDate(data.provider.user.lastLogin)}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{data.statistics.totalJobs}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{data.statistics.completedJobs}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Active</p>
              <p className="text-2xl font-bold text-blue-600">{data.statistics.activeJobs}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{data.statistics.cancelledJobs}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{data.statistics.averageRating.toFixed(1)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600 mb-1">Reviews</p>
              <p className="text-2xl font-bold text-indigo-600">{data.statistics.totalReviews}</p>
            </div>
          </div>

          {/* Description */}
          {data.provider.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{data.provider.description}</p>
            </div>
          )}

          {/* Services and Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Services Offered</h3>
              <div className="flex flex-wrap gap-2">
                {data.services.map((service, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {service.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Service Areas</h3>
              <div className="flex flex-wrap gap-2">
                {data.serviceAreas.map((area, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Documents ({data.documents.length})</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">File Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Uploaded</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{doc.fileName}</td>
                        <td className="px-4 py-3">
                          <span className={'px-2 py-1 rounded-full text-xs font-medium ' + getDocStatusColor(doc.status)}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(doc.uploadedAt)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(doc.verifiedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Jobs (Last 20)</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Job ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.recentJobs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                          No jobs yet
                        </td>
                      </tr>
                    ) : (
                      data.recentJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">#{job.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{job.service}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{job.customer}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">${job.price}</td>
                          <td className="px-4 py-3">
                            <span className={'px-2 py-1 rounded-full text-xs font-medium ' + getJobStatusColor(job.status)}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(job.completedAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Feedback (Last 10)</h3>
            <div className="space-y-3">
              {data.recentFeedback.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-500">No feedback yet</p>
                </div>
              ) : (
                data.recentFeedback.map((feedback) => (
                  <div key={feedback.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {renderStars(feedback.rating)}
                        <span className="text-sm font-semibold text-gray-700">{feedback.rating}.0</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(feedback.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{feedback.feedback}</p>
                    <p className="text-xs text-gray-500">by {feedback.customer}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
            <p>Account Created: {formatDate(data.provider.createdAt)}</p>
            {data.provider.approvedAt && (
              <p>Approved: {formatDate(data.provider.approvedAt)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

