'use client';

import { useState } from 'react';
import RequestCard from '@/components/cards/RequestCard';
import { dummySPRequests } from '@/data/dummyRequest';
import { SPRequest } from '@/data/dummyRequest';

export default function SPRequestPage() {
  const [requests, setRequests] = useState<SPRequest[]>(dummySPRequests);
  const [selectedRequest, setSelectedRequest] = useState<SPRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleApprove = (id: number) => {
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === id ? { ...request, status: 'approved' as const } : request
      )
    );
    alert(`Provider request #${id} has been approved!`);
    setShowModal(false);
    setSelectedRequest(null);
  };

  const handleReject = (id: number) => {
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === id ? { ...request, status: 'rejected' as const } : request
      )
    );
    alert(`Provider request #${id} has been rejected.`);
    setShowModal(false);
    setSelectedRequest(null);
  };

  const openModal = (request: SPRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Service Provider Requests
          </h1>
          <p className="text-gray-600">
            Review and manage service provider approval requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="text-3xl mr-4">⏳</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Pending Requests</h3>
                <p className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="text-3xl mr-4">✅</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Approved</h3>
                <p className="text-3xl font-bold text-green-600">{approvedRequests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="text-3xl mr-4">❌</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Rejected</h3>
                <p className="text-3xl font-bold text-red-600">{rejectedRequests.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Section */}
        <div className="max-w-6xl mx-auto">
          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Pending Approval ({pendingRequests.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => openModal(request)}
                    className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {request.firstName} {request.lastName}
                      </h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        ⏳ PENDING
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Service:</span> {request.serviceType}</p>
                      <p><span className="font-medium">Experience:</span> {request.experience}</p>
                      <p><span className="font-medium">Location:</span> {request.location}</p>
                      <p><span className="font-medium">Submitted:</span> {request.submittedDate}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-blue-600 text-sm font-medium">
                        Click to view details →
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Pending Requests
              </h3>
              <p className="text-gray-500">
                All service provider requests have been reviewed.
              </p>
            </div>
          )}

          {/* Recently Processed */}
          {(approvedRequests.length > 0 || rejectedRequests.length > 0) && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Recently Processed
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...approvedRequests, ...rejectedRequests]
                  .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
                  .slice(0, 6)
                  .map((request) => (
                    <div
                      key={request.id}
                      onClick={() => openModal(request)}
                      className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {request.firstName} {request.lastName}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status === 'approved' ? '✅ APPROVED' : '❌ REJECTED'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Service:</span> {request.serviceType}</p>
                        <p><span className="font-medium">Experience:</span> {request.experience}</p>
                        <p><span className="font-medium">Location:</span> {request.location}</p>
                        <p><span className="font-medium">Submitted:</span> {request.submittedDate}</p>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-blue-600 text-sm font-medium">
                          Click to view details →
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedRequest && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Provider Request Details
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <RequestCard
                  request={selectedRequest}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
