'use client';

import { useState, useEffect } from 'react';
import { lsmApi, PendingOnboardingResponse, ProviderInRegion } from '@/api/lsm';
import { SPRequestList, SPRequestModal } from '@/components/lsm/sprequest';
import ProviderStatusCard from '@/components/lsm/sprequest/ProviderStatusCard';
import { useAlert } from '@/hooks/useAlert';

export default function SPRequestPage() {
  const { showAlert, AlertComponent } = useAlert();
  const [requests, setRequests] = useState<PendingOnboardingResponse[]>([]);
  const [rejectedProviders, setRejectedProviders] = useState<ProviderInRegion[]>([]);
  const [approvedProviders, setApprovedProviders] = useState<ProviderInRegion[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PendingOnboardingResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch pending onboarding requests
      const pendingData = await lsmApi.getPendingOnboarding();
      setRequests(pendingData);
      
      // Fetch providers by status (only approved and rejected for onboarding workflow)
      const [approvedData, rejectedData] = await Promise.all([
        lsmApi.getProvidersInRegion('active'),
        lsmApi.getProvidersInRegion('rejected'),
      ]);
      
      setApprovedProviders(approvedData.providers);
      setRejectedProviders(rejectedData.providers);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      // ✅ CORRECT: Using provider onboarding approval endpoint
      const result = await lsmApi.approveProviderOnboarding(id);
      showAlert({
        title: 'Provider Approved',
        message: `Provider #${id} has been approved! ${result.message}`,
        type: 'success'
      });
      
      // Refresh all data to reflect changes
      await fetchAllData();
      
      // Switch to approved tab to show the newly approved provider
      setActiveTab('approved');
    } catch (error) {
      console.error('Error approving provider:', error);
      throw error; // Let the modal handle the error
    }
    setShowModal(false);
    setSelectedRequest(null);
  };

  const handleReject = async (id: number, reason: string) => {
    try {
      // ✅ CORRECT: Using provider onboarding rejection endpoint with reason
      const result = await lsmApi.rejectProviderOnboarding(id, reason);
      showAlert({
        title: 'Provider Rejected',
        message: `Provider #${id} has been rejected. ${result.message}`,
        type: 'warning'
      });
      
      // Refresh all data to reflect changes
      await fetchAllData();
      
      // Switch to rejected tab to show the newly rejected provider
      setActiveTab('rejected');
    } catch (error) {
      console.error('Error rejecting provider:', error);
      throw error; // Let the modal handle the error
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
            Service Provider Management
          </h1>
          <p className="text-gray-600">
            Review and manage service provider applications and statuses
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 min-w-[150px] px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                Pending Review
                <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs">
                  {requests.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('approved')}
                className={`flex-1 min-w-[150px] px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'approved'
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                Approved
                <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs">
                  {approvedProviders.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('rejected')}
                className={`flex-1 min-w-[150px] px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'rejected'
                    ? 'bg-red-100 text-red-700 border-2 border-red-300'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                Rejected
                <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs">
                  {rejectedProviders.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'pending' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Pending Review ({requests.length})
              </h2>
              {requests.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">No pending requests</p>
                </div>
              ) : (
                <SPRequestList 
                  requests={requests}
                  onRequestClick={openModal}
                />
              )}
            </div>
          )}

          {activeTab === 'approved' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Active Providers ({approvedProviders.length})
              </h2>
              {approvedProviders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">No active providers</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedProviders.map((provider) => (
                    <ProviderStatusCard key={provider.id} provider={provider} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rejected' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Rejected Providers ({rejectedProviders.length})
              </h2>
              {rejectedProviders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">No rejected providers</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rejectedProviders.map((provider) => (
                    <ProviderStatusCard key={provider.id} provider={provider} />
                  ))}
                </div>
              )}
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

        {/* Alert Modal */}
        <AlertComponent />
      </div>
    </div>
  );
}
