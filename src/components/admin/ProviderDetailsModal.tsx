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
  const [activeTab, setActiveTab] = useState<'info' | 'documents'>('info');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [loadingDocumentId, setLoadingDocumentId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && provider?.id) {
      setDetails(null); // Reset details when opening
      fetchProviderDetails();
    }
  }, [isOpen, provider?.id]);

  const fetchProviderDetails = async () => {
    try {
      setIsLoading(true);
      // Call API to fetch full provider details
      const response = await adminApi.getProviderDetails(provider.id);
      console.log('📥 Component received response:', response);
      console.log('📥 Response.documents:', response?.documents);
      setDetails(response);
      console.log('📥 setDetails called with:', response);
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
      console.log(`🎯 VIEW BUTTON CLICKED for document ${documentId}`);
      console.log(`🎯 Provider ID: ${provider.id}`);
      console.log(`🎯 About to call API...`);
      
      setLoadingDocumentId(documentId);
      
      const doc = await adminApi.getProviderDocument(provider.id, documentId);
      
      console.log(`🎯 API RESPONSE received:`, doc);
      console.log(`🎯 Response type:`, typeof doc);
      console.log(`🎯 Response keys:`, doc ? Object.keys(doc) : 'null');
      
      if (!doc) {
        console.error('🎯 ERROR: doc is null or undefined');
        alert('Document is empty or null');
        return;
      }
      
      console.log(`🎯 Setting selectedDocument...`);
      setSelectedDocument(doc);
      console.log(`🎯 selectedDocument state set to:`, doc);
      
    } catch (error) {
      console.error(`❌ CATCH ERROR - Failed to load document ${documentId}:`, error);
      alert('Failed to load document: ' + (error as any).message);
    } finally {
      console.log(`🎯 Finally block - clearing loading state`);
      setLoadingDocumentId(null);
    }
  };

  const handleDownloadDocument = () => {
    if (!selectedDocument?.fileData || !selectedDocument?.fileName) {
      alert('Cannot download: Document data not available');
      return;
    }

    try {
      // Create a link element
      const link = document.createElement('a');
      link.href = selectedDocument.fileData;
      link.download = selectedDocument.fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Document downloaded:', selectedDocument.fileName);
    } catch (error) {
      console.error('❌ Failed to download document:', error);
      alert('Failed to download document');
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
      <div className="bg-white rounded-lg max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-navy-600 to-navy-700 px-6 py-4 flex items-center justify-between">
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
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6">
          <div className="flex gap-4">
            {['info', 'documents'].map((tab) => (
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
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading provider details...</p>
              </div>
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
                      <label className="text-sm font-semibold text-gray-700">Experience</label>
                      <p className="text-gray-900 mt-1">{displayData.experience || 'N/A'} years</p>
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
                  {(() => {
                    // Use details directly since it has the full API response
                    const docs = details?.documents || [];
                    
                    console.log('📋 DOCUMENTS TAB:', {
                      hasDetails: !!details,
                      details: details,
                      documents: docs,
                      documentsLength: docs.length,
                    });
                    
                    if (!Array.isArray(docs) || docs.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-500 text-lg font-medium">No documents found</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="grid gap-3">
                        {docs.map((doc: any, idx: number) => {
                          return (
                            <div 
                              key={doc.id || idx} 
                              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-navy-300 hover:shadow-md transition-all bg-white"
                            >
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-base">
                                  {doc.fileName || doc.file_name || 'Untitled Document'}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {doc.description || 'No description'}
                                </p>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                    doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                                    doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {doc.status || 'pending'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Uploaded: {doc.uploadedAt || doc.uploaded_at || doc.createdAt ? 
                                      new Date(doc.uploadedAt || doc.uploaded_at || doc.createdAt).toLocaleDateString() : 
                                      'N/A'}
                                  </span>
                                  {doc.verifiedAt && (
                                    <span className="text-xs text-green-600 font-medium">
                                      ✓ Verified
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleViewDocument(doc.id)}
                                disabled={loadingDocumentId === doc.id}
                                className="ml-4 px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {loadingDocumentId === doc.id ? 'Loading...' : 'View'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}



              {/* Document Viewer Modal */}
              {selectedDocument && (
                <div className="fixed inset-0 bg-blur bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                }}>
                  <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
                    <div className="sticky top-0 bg-gradient-to-r from-navy-600 to-navy-700 px-6 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white text-lg">{selectedDocument.fileName}</h3>
                        <p className="text-xs text-navy-100 mt-1">
                          {selectedDocument.fileSize ? `${(selectedDocument.fileSize / 1024).toFixed(2)} KB` : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDownloadDocument}
                          className="p-2 text-white hover:bg-navy-500 rounded-lg transition-colors"
                          title="Download document"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setSelectedDocument(null)}
                          className="p-2 text-white hover:bg-navy-500 rounded-lg transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 min-h-[400px] flex items-center justify-center">
                      {selectedDocument.fileType?.includes('image') ? (
                        <img src={selectedDocument.fileData} alt={selectedDocument.fileName} className="max-w-full max-h-[600px] object-contain" />
                      ) : selectedDocument.fileType?.includes('pdf') ? (
                        <iframe src={selectedDocument.fileData} className="w-full h-96 border border-gray-200 rounded" />
                      ) : (
                        <div className="text-center py-12">
                          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-600">File preview not available</p>
                          <p className="text-sm text-gray-500 mt-2">Click the download button to download this file</p>
                        </div>
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
