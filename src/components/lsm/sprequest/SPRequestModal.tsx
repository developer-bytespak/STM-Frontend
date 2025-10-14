'use client';

import { useState } from 'react';
import { PendingOnboardingResponse } from '@/api/lsm';
import DocumentViewerModal from './DocumentViewerModal';

interface SPRequestModalProps {
  request: PendingOnboardingResponse;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
  onBackdropClick: (e: React.MouseEvent) => void;
  onRefresh?: () => void;
}

export default function SPRequestModal({ 
  request, 
  onClose, 
  onApprove, 
  onReject, 
  onBackdropClick,
  onRefresh
}: SPRequestModalProps) {
  const [viewingDocument, setViewingDocument] = useState<{
    id: number;
    fileName: string;
  } | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Calculate if all documents are verified
  const allDocsVerified = request.documents.total > 0 && 
                          request.documents.verified === request.documents.total;
  
  // Use either backend's readyForActivation or our calculation
  const canApprove = request.readyForActivation || allDocsVerified;

  const handleApprove = async () => {
    setIsProcessing(true);
    setError('');
    try {
      await onApprove(request.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve provider');
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    setError('');
    try {
      await onReject(request.id, rejectionReason);
      setShowRejectInput(false);
      setRejectionReason('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject provider');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onBackdropClick}
      >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Provider Request Details - {request.businessName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Provider Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Business Information</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-900"><span className="font-semibold text-gray-700">Business Name:</span> <span className="font-medium">{request.businessName}</span></p>
                  <p className="text-gray-900"><span className="font-semibold text-gray-700">Contact Person:</span> <span className="font-medium">{request.user.name}</span></p>
                  <p className="text-gray-900"><span className="font-semibold text-gray-700">Email:</span> <span className="font-medium">{request.user.email}</span></p>
                  <p className="text-gray-900"><span className="font-semibold text-gray-700">Phone:</span> <span className="font-medium">{request.user.phone}</span></p>
                  <p className="text-gray-900"><span className="font-semibold text-gray-700">Location:</span> <span className="font-medium">{request.location}</span></p>
                  <p className="text-gray-900"><span className="font-semibold text-gray-700">Experience:</span> <span className="font-medium">{request.experience} years ({request.experienceLevel})</span></p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Document Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Documents:</span>
                    <span className="font-semibold text-gray-900">{request.documents.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Verified:</span>
                    <span className="text-green-700 font-semibold">{request.documents.verified}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Pending:</span>
                    <span className="text-yellow-700 font-semibold">{request.documents.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Rejected:</span>
                    <span className="text-red-700 font-semibold">{request.documents.rejected}</span>
                  </div>
              <div className="mt-2 p-2 rounded bg-gray-50">
                <span className={`font-semibold ${canApprove ? 'text-green-700' : 'text-yellow-700'}`}>
                  {canApprove ? '✅ Ready for Activation' : '⏳ Pending Document Verification'}
                </span>
              </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents List */}
          {request.documents.list && request.documents.list.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Uploaded Documents</h4>
              <div className="space-y-2">
                {request.documents.list.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{doc.fileName}</p>
                      <p className="text-xs text-gray-600">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        doc.status === 'verified' 
                          ? 'bg-green-100 text-green-800' 
                          : doc.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.status === 'verified' ? '✅ Verified' : doc.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                      </span>
                      <button
                        onClick={() => setViewingDocument({ id: doc.id, fileName: doc.fileName })}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-medium"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services and Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Requested Services</h4>
              <div className="flex flex-wrap gap-2">
                {request.requestedServices.map((service, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {service}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Service Areas</h4>
              <div className="flex flex-wrap gap-2">
                {request.serviceAreas.map((zipcode, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {zipcode}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Approval Notice */}
          {!canApprove && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-yellow-600 text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-medium text-yellow-800">Documents Must Be Verified First</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    <strong>Status:</strong> {request.documents.verified}/{request.documents.total} documents verified
                  </p>
                  <p className="text-sm text-yellow-700 mt-2">
                    Please click <strong>&quot;View&quot;</strong> on each document above, review it, then click <strong>&quot;✅ Verify&quot;</strong> to approve the document. 
                    Once all documents are verified, you can approve the provider.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons or Rejection Input */}
          {!showRejectInput ? (
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✗ Reject Provider
              </button>
              <button
                onClick={handleApprove}
                disabled={!canApprove || isProcessing}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  canApprove && !isProcessing
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={
                  canApprove 
                    ? 'All documents verified - ready to approve' 
                    : `Please verify all documents first (${request.documents.verified}/${request.documents.total} verified)`
                }
              >
                {isProcessing ? 'Processing...' : canApprove 
                  ? '✅ Approve Provider' 
                  : `⏳ Verify Documents (${request.documents.verified}/${request.documents.total})`
                }
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-6 border-t">
              <div>
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Explain why this provider is being rejected..."
                  disabled={isProcessing}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRejectInput(false);
                    setRejectionReason('');
                    setError('');
                  }}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Document Viewer Modal */}
    {viewingDocument && (
      <DocumentViewerModal
        providerId={request.id}
        documentId={viewingDocument.id}
        documentName={viewingDocument.fileName}
        onClose={() => setViewingDocument(null)}
        onDocumentStatusChange={() => {
          // Close document viewer and trigger parent refresh
          setViewingDocument(null);
          // Refresh the provider data to get updated document counts
          if (onRefresh) {
            onRefresh();
          }
        }}
      />
    )}
    </>
  );
}
