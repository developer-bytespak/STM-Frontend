'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { providerApi, ServiceRequest } from '@/api/provider';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await providerApi.getMyServiceRequests();
        setRequests(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch service requests:', err);
        setError(err.message || 'Failed to load service requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getApprovalStatus = (request: ServiceRequest) => {
    if (request.lsm_approved === true && request.admin_approved === true) {
      return { status: 'approved', text: 'Approved' };
    }
    if (request.lsm_approved === false || request.admin_approved === false) {
      return { status: 'rejected', text: 'Rejected' };
    }
    if (request.lsm_approved === true && request.admin_approved === null) {
      return { status: 'pending', text: 'Admin Review' };
    }
    return { status: 'pending', text: 'LSM Review' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Service Requests</h1>
          <p className="text-gray-600 mt-1">Track the status of your service requests</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {requests.length} request{requests.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Requests List */}
      {requests.length > 0 ? (
        <div className="grid gap-6">
          {requests.map((request) => {
            const approval = getApprovalStatus(request);
            return (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{request.serviceName}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">{request.category}</span>
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(approval.status)}`}>
                    {approval.text}
                  </span>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{request.description}</p>
                </div>

                {/* Approval Status Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">LSM Approval</h5>
                    <div className="flex items-center space-x-2">
                      {request.lsm_approved === true ? (
                        <span className="text-green-600 text-sm">✓ Approved</span>
                      ) : request.lsm_approved === false ? (
                        <span className="text-red-600 text-sm">✗ Rejected</span>
                      ) : (
                        <span className="text-yellow-600 text-sm">⏳ Pending</span>
                      )}
                    </div>
                    {request.lsm_rejection_reason && (
                      <p className="text-red-600 text-sm mt-1">{request.lsm_rejection_reason}</p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Admin Approval</h5>
                    <div className="flex items-center space-x-2">
                      {request.admin_approved === true ? (
                        <span className="text-green-600 text-sm">✓ Approved</span>
                      ) : request.admin_approved === false ? (
                        <span className="text-red-600 text-sm">✗ Rejected</span>
                      ) : (
                        <span className="text-yellow-600 text-sm">⏳ Pending</span>
                      )}
                    </div>
                    {request.admin_rejection_reason && (
                      <p className="text-red-600 text-sm mt-1">{request.admin_rejection_reason}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Service Requests Yet</h3>
          <p className="text-gray-600 mb-6">You haven&apos;t submitted any service requests yet.</p>
          <Link
            href="/provider/service-request"
            className="bg-navy-600 text-white px-6 py-3 rounded-lg hover:bg-navy-700 transition-colors"
          >
            Request New Service
          </Link>
        </div>
      )}
    </div>
  );
}
