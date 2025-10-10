'use client';

import { useState, useEffect } from 'react';
import { lsmApi } from '@/api/lsm';

interface DocumentViewerModalProps {
  providerId: number;
  documentId: number;
  documentName: string;
  onClose: () => void;
  onDocumentStatusChange?: () => void; // Callback to refresh provider data
}

export default function DocumentViewerModal({
  providerId,
  documentId,
  documentName,
  onClose,
  onDocumentStatusChange,
}: DocumentViewerModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [documentData, setDocumentData] = useState<{
    fileName: string;
    fileType: string;
    fileSize: number;
    fileData: string;
    description: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await lsmApi.getProviderDocument(providerId, documentId);
        setDocumentData(data);
      } catch (err: any) {
        console.error('Error loading document:', err);
        setError(err.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [providerId, documentId]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleVerify = async () => {
    if (!documentData) return;
    
    setVerifying(true);
    try {
      await lsmApi.verifyDocument(providerId, documentId);
      // Update local status
      setDocumentData({ ...documentData, status: 'verified' });
      // Notify parent to refresh
      if (onDocumentStatusChange) {
        onDocumentStatusChange();
      }
      alert('Document verified successfully!');
    } catch (err: any) {
      console.error('Error verifying document:', err);
      alert(err.message || 'Failed to verify document');
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!documentData) return;
    
    const reason = prompt('Please provide a reason for rejecting this document:');
    if (!reason) return; // User cancelled
    
    setRejecting(true);
    try {
      await lsmApi.rejectDocument(providerId, documentId, reason);
      // Update local status
      setDocumentData({ ...documentData, status: 'rejected' });
      // Notify parent to refresh
      if (onDocumentStatusChange) {
        onDocumentStatusChange();
      }
      alert('Document rejected successfully!');
    } catch (err: any) {
      console.error('Error rejecting document:', err);
      alert(err.message || 'Failed to reject document');
    } finally {
      setRejecting(false);
    }
  };

  const renderDocument = () => {
    if (!documentData) return null;

    const { fileType, fileData, fileName } = documentData;

    // Handle PDFs
    if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      return (
        <iframe
          src={fileData}
          className="w-full h-[600px] border-0 rounded"
          title={fileName}
        />
      );
    }

    // Handle Images
    if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName)) {
      return (
        <div className="flex items-center justify-center bg-gray-100 rounded p-4">
          <img
            src={fileData}
            alt={fileName}
            className="max-w-full max-h-[600px] object-contain"
          />
        </div>
      );
    }

    // Handle other file types - show download option
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{fileName}</h3>
          <p className="text-sm text-gray-600 mb-4">
            File type: {fileType}<br />
            Size: {(documentData.fileSize / 1024).toFixed(2)} KB
          </p>
          <a
            href={fileData}
            download={fileName}
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download File
          </a>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {documentName}
              </h3>
              {documentData && (
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    documentData.status === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : documentData.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {documentData.status === 'verified' ? '✅ Verified' : documentData.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                  </span>
                  {documentData.description && (
                    <span className="text-sm text-gray-600">{documentData.description}</span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Document Content */}
          <div className="mb-4">
            {loading && (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading document...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Document</h3>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && documentData && renderDocument()}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            {/* Left side - Download button */}
            <div>
              {documentData && (
                <a
                  href={documentData.fileData}
                  download={documentData.fileName}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Download
                </a>
              )}
            </div>

            {/* Right side - Action buttons */}
            <div className="flex gap-3">
              {documentData?.status === 'pending' && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={rejecting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejecting ? 'Rejecting...' : '❌ Reject'}
                  </button>
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifying ? 'Verifying...' : '✅ Verify'}
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

