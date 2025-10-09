'use client';

import { PendingOnboardingResponse } from '@/api/lsm';

interface SPRequestModalProps {
  request: PendingOnboardingResponse;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onBackdropClick: (e: React.MouseEvent) => void;
}

export default function SPRequestModal({ 
  request, 
  onClose, 
  onApprove, 
  onReject, 
  onBackdropClick 
}: SPRequestModalProps) {
  return (
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
                <h4 className="font-semibold text-gray-700 mb-2">Business Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Business Name:</span> {request.businessName}</p>
                  <p><span className="font-medium">Contact Person:</span> {request.user.name}</p>
                  <p><span className="font-medium">Email:</span> {request.user.email}</p>
                  <p><span className="font-medium">Phone:</span> {request.user.phone}</p>
                  <p><span className="font-medium">Location:</span> {request.location}</p>
                  <p><span className="font-medium">Experience:</span> {request.experience} years ({request.experienceLevel})</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Document Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Documents:</span>
                    <span className="font-medium">{request.documents.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verified:</span>
                    <span className="text-green-600 font-medium">{request.documents.verified}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <span className="text-yellow-600 font-medium">{request.documents.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rejected:</span>
                    <span className="text-red-600 font-medium">{request.documents.rejected}</span>
                  </div>
                  <div className="mt-2 p-2 rounded bg-gray-50">
                    <span className={`font-medium ${request.readyForActivation ? 'text-green-600' : 'text-yellow-600'}`}>
                      {request.readyForActivation ? '✅ Ready for Activation' : '⏳ Pending Document Verification'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services and Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Requested Services</h4>
              <div className="flex flex-wrap gap-2">
                {request.requestedServices.map((service, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {service}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Service Areas</h4>
              <div className="flex flex-wrap gap-2">
                {request.serviceAreas.map((zipcode, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {zipcode}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={() => onReject(request.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => onApprove(request.id)}
              disabled={!request.readyForActivation}
              className={`px-4 py-2 rounded-lg transition-colors ${
                request.readyForActivation
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
