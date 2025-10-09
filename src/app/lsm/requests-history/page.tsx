'use client';

import { useState, useEffect } from 'react';
import { lsmApi, ServiceRequestHistoryFilters } from '@/api/lsm';
import ServiceRequestHistory from '@/components/lsm/ServiceRequestHistory';

export default function RequestsHistoryPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ServiceRequestHistoryFilters>({
    page: 1,
    limit: 20,
  });

  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filters]);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Request History</h1>
          <p className="text-gray-600">View and manage all service requests in your region</p>
        </div>

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
    </div>
  );
}
