'use client';

import React, { useState, useEffect } from 'react';
import { adminApi, ServiceRequest } from '@/api/admin';
import ViewServiceRequestModal from '@/components/admin/ViewServiceRequestModal';
import Loader from '@/components/ui/Loader';
import Toast from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch service requests
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getPendingServiceRequests();
      setRequests(data);
    } catch (error) {
      setToast({
        message: 'Failed to load service requests',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleViewRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleApprove = async (requestId: number) => {
    try {
      await adminApi.approveServiceRequest(requestId);
      setToast({
        message: 'Service request approved successfully! Service has been created.',
        type: 'success',
      });
      // Refresh the list
      await fetchRequests();
      setIsModalOpen(false);
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  const handleReject = async (requestId: number, reason: string) => {
    try {
      await adminApi.rejectServiceRequest(requestId, reason);
      setToast({
        message: 'Service request rejected successfully.',
        type: 'success',
      });
      // Refresh the list
      await fetchRequests();
      setIsModalOpen(false);
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
            <p className="text-gray-600 mt-1">
              Review and approve service requests from LSMs
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="inline-block">↻</span> Refresh
          </button>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{requests.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">
              No pending service requests at the moment.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      LSM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approved On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {request.serviceName}
                          </p>
                          <p className="text-xs text-gray-500">{request.category}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            {request.provider.businessName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.provider.user.first_name} {request.provider.user.last_name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {request.region}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{request.lsm.name}</p>
                          <p className="text-xs text-gray-500">{request.lsm.region}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {new Date(request.lsm_reviewed_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.lsm_reviewed_at).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => handleViewRequest(request)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
                        >
                          View Request
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Request Modal */}
        <ViewServiceRequestModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        {/* Toast Notification */}
        <Toast
          message={toast?.message || ''}
          type={toast?.type || 'success'}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      </div>
    </div>
  );
}