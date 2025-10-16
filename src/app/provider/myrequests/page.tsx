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
    // Debug: Log the actual values being received
    console.log('MyRequests Page - Request approval status debug:', {
      id: request.id,
      serviceName: request.serviceName,
      lsm_approved: request.lsm_approved,
      admin_approved: request.admin_approved,
      lsm_rejection_reason: request.lsm_rejection_reason,
      admin_rejection_reason: request.admin_rejection_reason
    });

    // Both approved = approved
    if (request.lsm_approved === true && request.admin_approved === true) {
      return { status: 'approved', text: 'Approved' };
    }
    
    // Check if LSM has actually rejected (has rejection reason)
    const hasLSMRejection = request.lsm_rejection_reason && request.lsm_rejection_reason.trim().length > 0;
    
    // Check if admin has actually rejected (has rejection reason)
    const hasAdminRejection = request.admin_rejection_reason && request.admin_rejection_reason.trim().length > 0;
    
    // LSM rejected = rejected (no need to wait for admin)
    if (request.lsm_approved === false && hasLSMRejection) {
      return { status: 'rejected', text: 'LSM Rejected' };
    }
    
    // Admin rejected = rejected (LSM was approved but admin rejected with reason)
    if (request.lsm_approved === true && request.admin_approved === false && hasAdminRejection) {
      return { status: 'rejected', text: 'Admin Rejected' };
    }
    
    // LSM approved, waiting for admin = admin review (even if admin_approved is false but no rejection reason)
    if (request.lsm_approved === true && (request.admin_approved === null || (request.admin_approved === false && !hasAdminRejection))) {
      return { status: 'pending', text: 'Under Admin Review' };
    }
    
    // Default case: waiting for LSM review
    return { status: 'pending', text: 'LSM Review' };
  };

  if (loading) {
    return (
      <div>
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center mb-4">
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">My Service Requests</h1>
              <p className="mt-2 text-gray-600">Track the status of your service requests</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Skeleton request cards */}
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                </div>
                
                {/* Request details skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-18"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </div>
                </div>
                
                {/* Description skeleton */}
                <div className="mb-4">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                
                {/* Status sections skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                      ) : (() => {
                        // Check if LSM has actually rejected (has rejection reason)
                        const hasLSMRejection = request.lsm_rejection_reason && request.lsm_rejection_reason.trim().length > 0;
                        
                        // Only show rejected if lsm_approved is false AND there's a rejection reason
                        if (request.lsm_approved === false && hasLSMRejection) {
                          return <span className="text-red-600 text-sm">✗ Rejected</span>;
                        }
                        
                        // Otherwise show pending (even if lsm_approved is false but no rejection reason)
                        return <span className="text-yellow-600 text-sm">⏳ Pending</span>;
                      })()}
                    </div>
                    {request.lsm_rejection_reason && (
                      <p className="text-red-600 text-sm mt-1">{request.lsm_rejection_reason}</p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Admin Approval</h5>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        // If LSM rejected, admin approval is not applicable
                        const hasLSMRejection = request.lsm_rejection_reason && request.lsm_rejection_reason.trim().length > 0;
                        if (request.lsm_approved === false && hasLSMRejection) {
                          return <span className="text-gray-500 text-sm">N/A</span>;
                        }
                        
                        // If LSM approved and admin approved
                        if (request.admin_approved === true) {
                          return <span className="text-green-600 text-sm">✓ Approved</span>;
                        }
                        
                        // Check if admin has actually rejected (has rejection reason)
                        const hasAdminRejection = request.admin_rejection_reason && request.admin_rejection_reason.trim().length > 0;
                        
                        // Only show rejected if admin_approved is false AND there's a rejection reason
                        if (request.admin_approved === false && hasAdminRejection) {
                          return <span className="text-red-600 text-sm">✗ Rejected</span>;
                        }
                        
                        // Otherwise show pending (even if admin_approved is false but no rejection reason)
                        return <span className="text-yellow-600 text-sm">⏳ Pending</span>;
                      })()}
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
