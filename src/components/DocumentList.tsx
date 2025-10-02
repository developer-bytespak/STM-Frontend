import React from 'react';

interface Document {
  fileName: string;
  fileSize: number;
  fileType: string;
  description: string;
  uploadedAt: string;
}

interface DocumentListProps {
  documents: Document[];
}

export default function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl mb-2 block">📄</span>
        <p>No documents uploaded</p>
      </div>
    );
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📄';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {documents.map((doc, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getFileIcon(doc.fileType)}</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{doc.description}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>File:</strong> {doc.fileName}</p>
                  <p><strong>Size:</strong> {formatFileSize(doc.fileSize)}</p>
                  <p><strong>Type:</strong> {doc.fileType}</p>
                  <p><strong>Uploaded:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                View
              </button>
              <button className="text-green-600 hover:text-green-800 text-sm">
                Download
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
