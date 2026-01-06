'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/api/admin';

interface ProviderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: any;
}

export default function ProviderDetailsModal({ isOpen, onClose, provider }: ProviderDetailsModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'jobs' | 'reviews'>('info');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [viewingDocument, setViewingDocument] = useState(false);

  useEffect(() => {
    if (isOpen && provider?.id) {
      fetchProviderDetails();
    }
  }, [isOpen, provider?.id]);

  const fetchProviderDetails = async () => {
    try {
      setIsLoading(true);
      // Call API to fetch full provider details
      const response = await adminApi.getProviderDetails(provider.id);
      setDetails(response);
      console.log('Provider details loaded:', response);
    } catch (error) {
      console.error('Failed to fetch provider details:', error);
      // Fallback to the basic provider info we already have
      setDetails(provider);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDocument = async (documentId: number) => {
    try {
      setViewingDocument(true);
      const doc = await adminApi.getProviderDocument(provider.id, documentId);
      setSelectedDocument(doc);
      console.log('Document loaded:', doc);
    } catch (error) {
      console.error('Failed to load document:', error);
      alert('Failed to load document');
    } finally {
      setViewingDocument(false);
    }
  };

  if (!isOpen || !provider) return null;

  const displayData = details || provider;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-navy-600 to-navy-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{displayData.businessName}</h2>
            <p className="text-sm text-navy-100 mt-1">Provider Details</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-navy-500 p-2 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="sticky top-14 bg-white border-b border-gray-200 px-6">
          <div className="flex gap-4">
            {['info', 'documents', 'jobs', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-navy-600 text-navy-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'documents' && displayData.documents && ` (${displayData.documents.length})`}
                {tab === 'jobs' && displayData.recentJobs && ` (${displayData.recentJobs.length})`}
                {tab === 'reviews' && displayData.recentReviews && ` (${displayData.recentReviews.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600"></div>
            </div>
          )}

          {!isLoading && (
            <>
              {/* INFO TAB */}
              {activeTab === 'info' && (
                <>
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Business Name</label>
                      <p className="text-gray-900 mt-1">{displayData.businessName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Owner Name</label>
                      <p className="text-gray-900 mt-1">{displayData.owner?.name || displayData.ownerName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Email</label>
                      <p className="text-gray-900 mt-1">{displayData.owner?.email || displayData.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Phone</label>
                      <p className="text-gray-900 mt-1">{displayData.owner?.phoneNumber || displayData.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Region</label>
                      <p className="text-gray-900 mt-1">{displayData.location || displayData.region}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Zipcode</label>
                      <p className="text-gray-900 mt-1">{displayData.zipcode || 'N/A'}</p>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <label className="text-sm font-semibold text-gray-700">Rating</label>
                      <p className="text-2xl font-bold text-navy-600 mt-2">
                        {displayData.statistics?.averageRating?.toFixed(1) || displayData.rating || 0}⭐
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <label className="text-sm font-semibold text-gray-700">Total Jobs</label>
                      <p className="text-2xl font-bold text-purple-600 mt-2">
                        {displayData.statistics?.totalJobs || displayData.totalJobs || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <label className="text-sm font-semibold text-gray-700">Total Revenue</label>
                      <p className="text-2xl font-bold text-green-600 mt-2">
                        ${(displayData.statistics?.totalRevenue || displayData.totalEarnings || displayData.earnings || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Status</label>
                      <p className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          displayData.status === 'active' ? 'bg-green-100 text-green-800' :
                          displayData.status === 'banned' ? 'bg-red-100 text-red-800' :
                          displayData.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {displayData.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">LSM</label>
                      <p className="text-gray-900 mt-1">{displayData.lsm?.name || displayData.lsmName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Completed Jobs</label>
                      <p className="text-gray-900 mt-1">{displayData.statistics?.completedJobs || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Experience</label>
                      <p className="text-gray-900 mt-1">{displayData.experience || 'N/A'} years</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Joined At</label>
                      <p className="text-gray-900 mt-1">
                        {displayData.owner?.joinedAt ? new Date(displayData.owner.joinedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Approved At</label>
                      <p className="text-gray-900 mt-1">
                        {displayData.approvedAt ? new Date(displayData.approvedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* DOCUMENTS TAB */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  {!displayData.documents || displayData.documents.length === 0 ? (
                    <p className="text-gray-500">No documents found</p>
                  ) : (
                    <div className="grid gap-3">
                      {displayData.documents.map((doc: any) => (
                        <div key={doc.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{doc.fileName}</h4>
                            <p className="text-sm text-gray-600">{doc.description}</p>
                            <div className="flex gap-2 mt-1">
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                                doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {doc.status}
                              </span>
                              <span className="text-xs text-gray-500">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewDocument(doc.id)}
                            disabled={viewingDocument}
                            className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors disabled:bg-gray-400"
                          >
                            {viewingDocument ? 'Loading...' : 'View'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* JOBS TAB */}
              {activeTab === 'jobs' && (
                <div className="space-y-4">
                  {!displayData.recentJobs || displayData.recentJobs.length === 0 ? (
                    <p className="text-gray-500">No jobs found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">Service</th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">Customer</th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">Price</th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">Status</th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayData.recentJobs.map((job: any) => (
                            <tr key={job.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-3 px-4">{job.service}</td>
                              <td className="py-3 px-4">{job.customer}</td>
                              <td className="py-3 px-4">${job.price.toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                  job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  job.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {job.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">{new Date(job.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {!displayData.recentReviews || displayData.recentReviews.length === 0 ? (
                    <p className="text-gray-500">No reviews found</p>
                  ) : (
                    displayData.recentReviews.map((review: any) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.customer}</h4>
                            <p className="text-sm text-gray-600">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <span key={i} className="text-yellow-500">⭐</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.feedback}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Document Viewer Modal */}
              {selectedDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
                    <div className="sticky top-0 bg-gray-100 px-6 py-4 flex items-center justify-between">
                      <h3 className="font-semibold">{selectedDocument.fileName}</h3>
                      <button
                        onClick={() => setSelectedDocument(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-6">
                      {selectedDocument.fileType?.includes('image') ? (
                        <img src={selectedDocument.fileData} alt={selectedDocument.fileName} className="w-full" />
                      ) : selectedDocument.fileType?.includes('pdf') ? (
                        <iframe src={selectedDocument.fileData} className="w-full h-96" />
                      ) : (
                        <p className="text-gray-600">File preview not available</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
