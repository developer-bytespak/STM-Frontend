'use client';

import { SPRequest } from '@/data/dummyRequest';

interface RequestCardProps {
  request: SPRequest;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export default function RequestCard({ request, onApprove, onReject }: RequestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {request.firstName} {request.lastName}
          </h3>
          <p className="text-sm text-gray-600">{request.email}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
          {getStatusIcon(request.status)} {request.status.toUpperCase()}
        </div>
      </div>

      {/* Service Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Service Type:</span> {request.serviceType}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Experience:</span> {request.experience}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Location:</span> {request.location}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Phone:</span> {request.phone}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Price Range:</span> {request.minPrice} - {request.maxPrice}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Submitted:</span> {request.submittedDate}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Documents:</span> {request.documents?.filter(doc => doc.uploaded).length || 0}/{request.documents?.length || 0}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
          <span className="font-medium">Description:</span> {request.description}
        </p>
      </div>

      {/* Documents Status */}
      {request.documents && request.documents.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Documents:</p>
          <div className="flex flex-wrap gap-2">
            {request.documents.map((doc, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded text-xs ${
                  doc.uploaded 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {doc.uploaded ? '✅' : '❌'} {doc.description}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {request.status === 'pending' && (
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={() => onApprove(request.id)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            ✅ Approve
          </button>
          <button
            onClick={() => onReject(request.id)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            ❌ Reject
          </button>
        </div>
      )}
    </div>
  );
}
