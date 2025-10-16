'use client';

import { useState, useEffect } from 'react';
import { lsmApi, ServiceRequestHistoryFilters, PendingServiceRequest } from '@/api/lsm';
import ServiceRequestHistory from '@/components/lsm/ServiceRequestHistory';
import { useAlert } from '@/hooks/useAlert';

export default function RequestsHistoryPage() {
  const { showAlert, AlertComponent } = useAlert();
  const [data, setData] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [filters, setFilters] = useState<ServiceRequestHistoryFilters>({
    page: 1,
    limit: 20,
  });

  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAllData();
  }, [filters]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both pending and history
      const [pendingData, historyData] = await Promise.all([
        lsmApi.getPendingServiceRequests(),
        lsmApi.getServiceRequestsHistory(filters),
      ]);
      
      setPendingRequests(pendingData);
      setData(historyData);
    } catch (err: any) {
      console.error('Error fetching service requests:', err);
      setError(err.message || 'Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await lsmApi.getServiceRequestsHistory(filters);
      setData(response);
    } catch (err: any) {
      console.error('Error fetching service requests:', err);
      setError(err.message || 'Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    if (!confirm('Are you sure you want to approve this service request?')) {
      return;
    }

    try {
      await lsmApi.approveServiceRequest(requestId);
      showAlert({
        title: 'Success',
        message: 'Service request approved successfully',
        type: 'success'
      });
      await fetchAllData();
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: `Failed to approve: ${err.message}`,
        type: 'error'
      });
    }
  };

  const handleReject = async (requestId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || !reason.trim()) {
      showAlert({
        title: 'Validation Error',
        message: 'Rejection reason is required',
        type: 'warning'
      });
      return;
    }

    try {
      await lsmApi.rejectServiceRequest(requestId, reason);
      showAlert({
        title: 'Success',
        message: 'Service request rejected successfully',
        type: 'success'
      });
      await fetchAllData();
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: `Failed to reject: ${err.message}`,
        type: 'error'
      });
    }
  };

  const handleApplyFilters = () => {
    const newFilters: ServiceRequestHistoryFilters = {
      page: 1,
      limit: 20,
    };

    if (statusFilter) newFilters.status = statusFilter;

    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setFilters({ page: 1, limit: 20 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading service requests...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Request Management</h1>
          <p className="text-gray-600">Review and manage service requests in your region</p>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('pending')}
                className={'flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ' + (activeTab === 'pending' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent')}
              >
                Pending Approval
                <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs">
                  {pendingRequests.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={'flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ' + (activeTab === 'history' ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent')}
              >
                Request History
                <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs">
                  {data?.pagination?.total || 0}
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
                Pending Approval ({pendingRequests.length})
              </h2>
              
              {pendingRequests.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">No pending service requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.serviceName}
                          </h3>
                          <p className="text-sm text-gray-600">{request.category}</p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                          Pending LSM Review
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Provider:</p>
                          <p className="text-sm text-gray-900">
                            {request.provider.businessName || `${request.provider.user.first_name} ${request.provider.user.last_name}`}
                          </p>
                          <p className="text-xs text-gray-500">{request.provider.user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Request ID:</p>
                          <p className="text-sm text-gray-900">#{request.id}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                        <p className="text-sm text-gray-600">{request.description}</p>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          ✓ Approve Request
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          ✗ Reject Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Request History
              </h2>

              {/* Filters */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Requests</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="">All Statuses</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleApplyFilters}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Loading...' : 'Apply Filters'}
                  </button>
                  <button
                    onClick={handleResetFilters}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Service Request History Component */}
              {data && (
                <ServiceRequestHistory
                  requests={data.data}
                  totalRequests={data.pagination.total}
                  currentPage={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          )}

          {/* Alert Modal */}
          <AlertComponent />
        </div>
      </div>
    </div>
  );
}
