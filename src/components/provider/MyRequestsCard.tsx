'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { providerApi, ServiceRequest } from '@/api/provider';

interface MyRequestsCardProps {
  className?: string;
}

export default function MyRequestsCard({ className = '' }: MyRequestsCardProps) {
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
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-navy-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Service Requests</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Service Requests</h2>
        <Link
          href="/provider/myrequests"
          className="text-navy-600 hover:text-navy-700 font-medium text-sm"
        >
          View All →
        </Link>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.slice(0, 3).map((request) => {
            const approval = getApprovalStatus(request);
            return (
              <div key={request.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{request.serviceName}</h3>
                    <p className="text-sm text-gray-600 mb-2">{request.category}</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{request.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${getStatusColor(approval.status)}`}>
                    {approval.text}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </span>
                  {approval.status === 'rejected' && (
                    <span className="text-red-600 text-xs">
                      {request.lsm_rejection_reason || request.admin_rejection_reason}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          
          {requests.length > 3 && (
            <div className="text-center pt-2">
              <span className="text-gray-500 text-sm">
                +{requests.length - 3} more requests
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No service requests yet</p>
          <Link
            href="/provider/service-request"
            className="bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700 transition-colors text-sm"
          >
            Request New Service
          </Link>
        </div>
      )}
    </div>
  );
}
