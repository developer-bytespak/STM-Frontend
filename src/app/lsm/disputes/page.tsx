'use client';

import { useState, useEffect } from 'react';
import { lsmApi, Dispute, DisputeFilters } from '@/api/lsm';
import { DisputeCard, DisputeDetailModal } from '@/components/lsm/disputes';

export default function LSMDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');
  const [selectedDisputeId, setSelectedDisputeId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    fetchDisputes();
  }, [activeTab, pagination.page]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: DisputeFilters = {
        status: activeTab === 'pending' ? 'pending' : 'resolved',
        page: pagination.page,
        limit: 12,
      };

      const response = await lsmApi.getDisputes(filters);
      setDisputes(response.data);
      setPagination({
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
      });
    } catch (err: any) {
      console.error('Error fetching disputes:', err);
      setError(err.message || 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'pending' | 'resolved') => {
    setActiveTab(tab);
    setPagination({ page: 1, totalPages: 1, total: 0 });
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  const handleViewDetails = (disputeId: number) => {
    setSelectedDisputeId(disputeId);
  };

  const handleCloseModal = () => {
    setSelectedDisputeId(null);
  };

  const handleDisputeUpdated = () => {
    fetchDisputes();
  };

  if (loading && disputes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading disputes...</p>
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
              <button
                onClick={fetchDisputes}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dispute Management</h1>
          <p className="text-gray-600">
            Review and resolve disputes between customers and providers
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleTabChange('pending')}
                className={'flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ' + (activeTab === 'pending' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent')}
              >
                Pending Disputes
                <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs">
                  {activeTab === 'pending' ? pagination.total : ''}
                </span>
              </button>
              
              <button
                onClick={() => handleTabChange('resolved')}
                className={'flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all ' + (activeTab === 'resolved' ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent')}
              >
                Resolved Disputes
                <span className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs">
                  {activeTab === 'resolved' ? pagination.total : ''}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Disputes Grid */}
        <div className="max-w-6xl mx-auto">
          {disputes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Disputes Found</h3>
                <p className="text-gray-600">
                  {activeTab === 'pending' 
                    ? 'There are no pending disputes in your region at the moment.'
                    : 'No resolved disputes to display.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {activeTab === 'pending' ? 'Pending Disputes' : 'Resolved Disputes'} ({pagination.total})
                </h2>
                <button
                  onClick={fetchDisputes}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="inline-block">↻</span> Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {disputes.map((dispute) => (
                  <DisputeCard
                    key={dispute.id}
                    dispute={dispute}
                    onViewDetails={() => handleViewDetails(dispute.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dispute Detail Modal */}
        {selectedDisputeId && (
          <DisputeDetailModal
            disputeId={selectedDisputeId}
            onClose={handleCloseModal}
            onDisputeUpdated={handleDisputeUpdated}
          />
        )}
      </div>
    </div>
  );
}