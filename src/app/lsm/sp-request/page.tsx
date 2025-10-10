'use client';

import { useState, useEffect } from 'react';
import { lsmApi, PendingOnboardingResponse } from '@/api/lsm';
import { SPRequestStats, SPRequestList, SPRequestModal } from '@/components/lsm/sprequest';

export default function SPRequestPage() {
  const [requests, setRequests] = useState<PendingOnboardingResponse[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PendingOnboardingResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await lsmApi.getPendingOnboarding();
        setRequests(data);
      } catch (err: any) {
        console.error('Error fetching pending requests:', err);
        setError(err.message || 'Failed to load pending requests');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      // ✅ CORRECT: Using provider onboarding approval endpoint
      const result = await lsmApi.approveProviderOnboarding(id);
      alert(`Provider #${id} has been approved! ${result.message}`);
      // Refresh the list
      const data = await lsmApi.getPendingOnboarding();
      setRequests(data);
    } catch (error) {
      console.error('Error approving provider:', error);
      alert('Failed to approve provider');
    }
    setShowModal(false);
    setSelectedRequest(null);
  };

  const handleReject = async (id: number, reason?: string) => {
    try {
      // ✅ CORRECT: Using provider onboarding rejection endpoint
      const result = await lsmApi.rejectProviderOnboarding(id, reason || 'No reason provided');
      alert(`Provider #${id} has been rejected. ${result.message}`);
      // Refresh the list
      const data = await lsmApi.getPendingOnboarding();
      setRequests(data);
    } catch (error) {
      console.error('Error rejecting provider:', error);
      alert('Failed to reject provider');
    }
    setShowModal(false);
    setSelectedRequest(null);
  };

  const openModal = (request: PendingOnboardingResponse) => {
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

  const handleRefreshRequest = async () => {
    try {
      // Re-fetch the pending requests to get updated document status
      const data = await lsmApi.getPendingOnboarding();
      setRequests(data);
      
      // Update the selected request with fresh data
      if (selectedRequest) {
        const updatedRequest = data.find(r => r.id === selectedRequest.id);
        if (updatedRequest) {
          setSelectedRequest(updatedRequest);
        }
      }
    } catch (error) {
      console.error('Error refreshing request:', error);
    }
  };

  // Since API only returns pending requests, we'll show them all
  const pendingRequests = requests;
  const approvedRequests: PendingOnboardingResponse[] = [];
  const rejectedRequests: PendingOnboardingResponse[] = [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Service Provider Onboarding Requests
          </h1>
          <p className="text-gray-600">
            Review and manage pending service provider applications
          </p>
        </div>

        {/* Stats Cards */}
        <SPRequestStats 
          pendingCount={pendingRequests.length}
          approvedCount={approvedRequests.length}
          rejectedCount={rejectedRequests.length}
        />

        {/* Requests Section */}
        <div className="max-w-6xl mx-auto">
          <SPRequestList 
            requests={pendingRequests}
            onRequestClick={openModal}
          />

          {/* Recently Processed */}
          {(approvedRequests.length > 0 || rejectedRequests.length > 0) && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Recently Processed
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Since we only have pending requests from API, this section will be empty */}
                <div className="text-center py-8 text-gray-500">
                  <p>No recently processed requests to display.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedRequest && (
          <SPRequestModal
            request={selectedRequest}
            onClose={closeModal}
            onApprove={handleApprove}
            onReject={handleReject}
            onBackdropClick={handleBackdropClick}
            onRefresh={handleRefreshRequest}
          />
        )}
      </div>
    </div>
  );
}
